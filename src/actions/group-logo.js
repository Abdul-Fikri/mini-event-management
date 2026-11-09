"use server";

import { revalidatePath } from "next/cache";
import { requireGroup } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const BUCKET = "group-logos";
const UUID_PATTERN = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";

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
