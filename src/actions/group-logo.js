"use server";

import { revalidatePath } from "next/cache";
import { requireGroup } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

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

function isValidOwnedUploadPath(path, groupId) {
  if (typeof path !== "string") return false;

  const match = path.match(
    new RegExp(`^(${UUID_PATTERN})/(${UUID_PATTERN})\\.(jpg|png|webp)$`, "i")
  );

  return Boolean(match && match[1].toLowerCase() === groupId.toLowerCase());
}

// Validasi file dan buat object path di server sebelum browser mengunggahnya.
export async function prepareGroupLogoUpload(formData) {
  const { group } = await requireGroup();
  const file = formData.get("logo");

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

  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!type.signature(bytes)) {
    return { ok: false, message: "Isi file tidak sesuai dengan format gambar." };
  }

  return {
    ok: true,
    path: `${group.id}/${crypto.randomUUID()}.${type.ext}`,
  };
}

// Dipanggil setelah upload dari browser berhasil. RLS Storage tetap memvalidasi
// INSERT, sedangkan Server Action ini hanya menyimpan URL milik grup aktif.
export async function saveGroupLogoPath(path) {
  const { owner, group } = await requireGroup();

  if (!isValidOwnedUploadPath(path, group.id)) {
    return { ok: false, message: "Path logo tidak valid untuk grup ini." };
  }

  const supabase = await createClient();
  const oldPath = getOwnedObjectPath(
    group.logo_url,
    group.id,
    process.env.NEXT_PUBLIC_SUPABASE_URL
  );
  const { data: publicData } = supabase.storage.from(BUCKET).getPublicUrl(path);

  const { data: updatedGroup, error } = await supabase
    .from("groups")
    .update({ logo_url: publicData.publicUrl })
    .eq("id", group.id)
    .eq("owner_id", owner.id)
    .select("id")
    .maybeSingle();

  if (error || !updatedGroup) {
    console.error("[saveGroupLogoPath] database update failed:", error?.message ?? "group not updated");
    return {
      ok: false,
      message: "Logo berhasil diunggah, tetapi gagal menyimpan pengaturan grup.",
    };
  }

  revalidatePath("/", "layout");
  return {
    ok: true,
    message: "Logo grup berhasil diperbarui.",
    oldPath: oldPath && oldPath !== path ? oldPath : null,
  };
}

// Metadata dilepas lebih dahulu. Penghapusan object dilakukan dari browser
// menggunakan session pengguna yang sama dengan upload Storage.
export async function removeGroupLogo() {
  const { owner, group } = await requireGroup();
  const supabase = await createClient();
  const oldPath = getOwnedObjectPath(
    group.logo_url,
    group.id,
    process.env.NEXT_PUBLIC_SUPABASE_URL
  );

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

  revalidatePath("/", "layout");
  return {
    ok: true,
    message: "Logo grup berhasil dilepas.",
    oldPath,
  };
}
