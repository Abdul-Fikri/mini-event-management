"use server";

import { revalidatePath } from "next/cache";
import { requireGroup } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const BUCKET = "group-logos";
const MAX_FILE_SIZE = 2 * 1024 * 1024;
const TYPES = {
  "image/jpeg": { ext: "jpg", signature: (b) => b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  "image/png": { ext: "png", signature: (b) => b.length >= 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 && b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a },
  "image/webp": { ext: "webp", signature: (b) => b.length >= 12 && String.fromCharCode(...b.slice(0, 4)) === "RIFF" && String.fromCharCode(...b.slice(8, 12)) === "WEBP" },
};

function getOwnedObjectPath(url, groupId, supabaseUrl) {
  if (!url || !supabaseUrl) return null;
  try {
    const parsed = new URL(url);
    const base = new URL(supabaseUrl);
    if (parsed.origin !== base.origin) return null;
    const prefix = `/storage/v1/object/public/${BUCKET}/`;
    if (!parsed.pathname.startsWith(prefix)) return null;
    const path = decodeURIComponent(parsed.pathname.slice(prefix.length));
    if (!path.startsWith(`${groupId}/`) || path.includes("..")) return null;
    return path;
  } catch {
    return null;
  }
}

export async function saveGroupLogo(_previousState, formData) {
  const { group } = await requireGroup();
  const supabase = await createClient();
  const file = formData.get("logo");
  const remove = formData.get("remove") === "true";
  const oldPath = getOwnedObjectPath(group.logo_url, group.id, process.env.NEXT_PUBLIC_SUPABASE_URL);

  if (remove) {
    const { error: updateError } = await supabase.from("groups").update({ logo_url: null }).eq("id", group.id);
    if (updateError) return { ok: false, message: "Logo gagal dihapus. Coba lagi." };
    if (oldPath) {
      const { error } = await supabase.storage.from(BUCKET).remove([oldPath]);
      if (error) console.error("[saveGroupLogo] old logo cleanup failed:", error.message);
    }
    revalidatePath("/", "layout");
    return { ok: true, message: "Logo grup berhasil dihapus." };
  }

  if (!(file instanceof File) || file.size === 0) return { ok: false, message: "Pilih file gambar terlebih dahulu." };
  if (file.size > MAX_FILE_SIZE) return { ok: false, message: "Ukuran logo maksimal 2 MB." };
  const type = TYPES[file.type];
  if (!type) return { ok: false, message: "Format logo harus JPG, PNG, atau WebP." };

  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!type.signature(bytes)) return { ok: false, message: "Isi file tidak sesuai dengan format gambar." };

  const path = `${group.id}/${crypto.randomUUID()}.${type.ext}`;
  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, bytes, {
    contentType: file.type,
    cacheControl: "3600",
    upsert: false,
  });
  if (uploadError) {
    const detail = uploadError.message?.toLowerCase() ?? "";
    console.error("[saveGroupLogo] upload failed:", uploadError.message);

    if (detail.includes("bucket") && detail.includes("not found")) {
      return {
        ok: false,
        message: "Bucket group-logos belum tersedia. Migration Storage perlu diterapkan.",
      };
    }

    if (
      detail.includes("row-level security") ||
      detail.includes("violates") ||
      detail.includes("unauthorized") ||
      detail.includes("permission denied") ||
      detail.includes("forbidden")
    ) {
      return {
        ok: false,
        message: "Upload ditolak oleh policy Storage. Periksa izin Owner pada bucket group-logos.",
      };
    }

    return {
      ok: false,
      message: "Upload logo gagal karena konfigurasi Storage. Periksa log server untuk detail.",
    };
  }

  const { data: publicData } = supabase.storage.from(BUCKET).getPublicUrl(path);
  const { error: updateError } = await supabase.from("groups").update({ logo_url: publicData.publicUrl }).eq("id", group.id);
  if (updateError) {
    await supabase.storage.from(BUCKET).remove([path]);
    console.error("[saveGroupLogo] database update failed:", updateError.message);
    return { ok: false, message: "Logo terunggah, tetapi gagal menyimpan data grup. Silakan coba lagi." };
  }

  if (oldPath) {
    const { error } = await supabase.storage.from(BUCKET).remove([oldPath]);
    if (error) console.error("[saveGroupLogo] old logo cleanup failed:", error.message);
  }
  revalidatePath("/", "layout");
  return { ok: true, message: "Logo grup berhasil diperbarui." };
}
