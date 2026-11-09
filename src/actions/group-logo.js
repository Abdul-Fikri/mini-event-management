"use server";

import { revalidatePath } from "next/cache";
import { requireGroup } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const BUCKET = "group-logos";
const MAX_FILE_SIZE = 2 * 1024 * 1024;
const UUID_PATTERN = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";
const TYPES = {
  "image/jpeg": {
    ext: "jpg",
    signature: (bytes) => bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff,
  },
  "image/png": {
    ext: "png",
    signature: (bytes) => bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 && bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a,
  },
  "image/webp": {
    ext: "webp",
    signature: (bytes) => bytes.length >= 12 && String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP",
  },
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

function getAdminClient() {
  try {
    return { client: createAdminClient(), error: null };
  } catch (error) {
    console.error("[group-logo] admin storage client unavailable:", error.message);
    return { client: null, error };
  }
}

function validateLogoFile(file) {
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "Pilih file gambar terlebih dahulu." };
  }
  if (file.size > MAX_FILE_SIZE) {
    return { ok: false, message: "Ukuran logo maksimal 2 MB." };
  }

  const type = TYPES[file.type];
  if (!type) {
    return { ok: false, message: "Format logo harus JPG, PNG, atau WebP." };
  }

  return { ok: true, type };
}

// Upload dilakukan di server setelah requireGroup memastikan pengguna adalah Owner.
// Service key hanya melewati RLS pada operasi Storage ini; akses grup tetap diverifikasi
// menggunakan session pengguna dan metadata groups tetap ditulis dengan client terautentikasi.
export async function uploadGroupLogo(formData) {
  const { owner, group } = await requireGroup();
  const file = formData.get("logo");
  const validation = validateLogoFile(file);

  if (!validation.ok) return validation;

  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!validation.type.signature(bytes)) {
    return { ok: false, message: "Isi file tidak sesuai dengan format gambar." };
  }

  const { client: admin, error: adminError } = getAdminClient();
  if (!admin) {
    return {
      ok: false,
      message: "Upload logo belum dikonfigurasi di server. Admin perlu menambahkan SUPABASE_SECRET_KEY atau SUPABASE_SERVICE_ROLE_KEY di environment Vercel.",
    };
  }

  const type = validation.type;
  const path = `${group.id}/${crypto.randomUUID()}.${type.ext}`;
  const { error: uploadError } = await admin.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    cacheControl: "3600",
    upsert: false,
  });

  if (uploadError) {
    console.error("[uploadGroupLogo] storage upload failed:", uploadError.message);
    return { ok: false, message: `Upload Storage gagal: ${uploadError.message}` };
  }

  const supabase = await createClient();
  const { data: publicData } = admin.storage.from(BUCKET).getPublicUrl(path);
  const oldPath = getOwnedObjectPath(
    group.logo_url,
    group.id,
    process.env.NEXT_PUBLIC_SUPABASE_URL
  );

  const { data: updatedGroup, error: updateError } = await supabase
    .from("groups")
    .update({ logo_url: publicData.publicUrl })
    .eq("id", group.id)
    .eq("owner_id", owner.id)
    .select("id")
    .maybeSingle();

  if (updateError || !updatedGroup) {
    const { error: cleanupError } = await admin.storage.from(BUCKET).remove([path]);
    if (cleanupError) {
      console.error("[uploadGroupLogo] failed to clean up rejected upload:", cleanupError.message);
    }
    console.error("[uploadGroupLogo] group update failed:", updateError?.message ?? "group not updated");
    return {
      ok: false,
      message: "File terunggah, tetapi pengaturan grup gagal disimpan. Silakan coba lagi.",
    };
  }

  let message = "Logo grup berhasil diperbarui.";
  if (oldPath && oldPath !== path) {
    const { error: cleanupError } = await admin.storage.from(BUCKET).remove([oldPath]);
    if (cleanupError) {
      console.error("[uploadGroupLogo] old logo cleanup failed:", cleanupError.message);
      message += " File logo lama belum berhasil dibersihkan.";
    }
  }

  revalidatePath("/", "layout");
  return { ok: true, message };
}

export async function removeGroupLogo() {
  const { owner, group } = await requireGroup();
  const oldPath = getOwnedObjectPath(
    group.logo_url,
    group.id,
    process.env.NEXT_PUBLIC_SUPABASE_URL
  );

  let admin = null;
  if (oldPath) {
    const result = getAdminClient();
    if (!result.client) {
      return {
        ok: false,
        message: "Penghapusan logo belum dikonfigurasi di server. Admin perlu menambahkan SUPABASE_SECRET_KEY atau SUPABASE_SERVICE_ROLE_KEY di environment Vercel.",
      };
    }
    admin = result.client;
  }

  const supabase = await createClient();
  const { data: updatedGroup, error } = await supabase
    .from("groups")
    .update({ logo_url: null })
    .eq("id", group.id)
    .eq("owner_id", owner.id)
    .select("id")
    .maybeSingle();

  if (error || !updatedGroup) {
    console.error("[removeGroupLogo] database update failed:", error?.message ?? "group not updated");
    return { ok: false, message: "Logo grup gagal dihapus. Coba lagi." };
  }

  let message = "Logo grup berhasil dihapus.";
  if (oldPath && admin) {
    const { error: cleanupError } = await admin.storage.from(BUCKET).remove([oldPath]);
    if (cleanupError) {
      console.error("[removeGroupLogo] storage cleanup failed:", cleanupError.message);
      message += " File lama belum berhasil dibersihkan dari Storage.";
    }
  }

  revalidatePath("/", "layout");
  return { ok: true, message };
}
