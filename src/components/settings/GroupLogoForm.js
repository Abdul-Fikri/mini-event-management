"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  prepareGroupLogoUpload,
  saveGroupLogoPath,
  removeGroupLogo,
} from "@/actions/group-logo";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";

const BUCKET = "group-logos";
const MAX_FILE_SIZE = 2 * 1024 * 1024;
const TYPES = {
  "image/jpeg": {
    ext: "jpg",
    signature: (bytes) =>
      bytes.length >= 3 &&
      bytes[0] === 0xff &&
      bytes[1] === 0xd8 &&
      bytes[2] === 0xff,
  },
  "image/png": {
    ext: "png",
    signature: (bytes) =>
      bytes.length >= 8 &&
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47 &&
      bytes[4] === 0x0d &&
      bytes[5] === 0x0a &&
      bytes[6] === 0x1a &&
      bytes[7] === 0x0a,
  },
  "image/webp": {
    ext: "webp",
    signature: (bytes) =>
      bytes.length >= 12 &&
      String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
      String.fromCharCode(...bytes.slice(8, 12)) === "WEBP",
  },
};

export default function GroupLogoForm({ logoUrl, groupName, groupId }) {
  const router = useRouter();
  const inputRef = useRef(null);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  async function handleUpload(event) {
    event.preventDefault();
    if (pending) return;

    const file = inputRef.current?.files?.[0];
    if (!file) {
      setMessage("Pilih file gambar terlebih dahulu.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setMessage("Ukuran logo maksimal 2 MB.");
      return;
    }

    const type = TYPES[file.type];
    if (!type) {
      setMessage("Format logo harus JPG, PNG, atau WebP.");
      return;
    }

    setPending(true);
    setMessage("");

    let uploadedPath = null;
    let supabase;

    try {
      supabase = createClient();
      const bytes = new Uint8Array(await file.arrayBuffer());
      if (!type.signature(bytes)) {
        setMessage("Isi file tidak sesuai dengan format gambar.");
        return;
      }

      const validationForm = new FormData();
      validationForm.set("logo", file);
      const prepared = await prepareGroupLogoUpload(validationForm);
      if (!prepared?.ok) {
        setMessage(prepared?.message || "File logo tidak lolos validasi.");
        return;
      }

      uploadedPath = prepared.path;

      // Upload dilakukan di browser agar Supabase Storage memakai session
      // pengguna secara langsung, bukan session yang direkonstruksi di Action.
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(uploadedPath, file, {
          contentType: file.type,
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("[GroupLogoForm] browser upload failed:", {
          message: uploadError.message,
          statusCode: uploadError.statusCode ?? null,
        });
        setMessage(`Upload Storage gagal: ${uploadError.message}`);
        return;
      }

      const result = await saveGroupLogoPath(uploadedPath);
      if (!result?.ok) {
        const { error: cleanupError } = await supabase.storage
          .from(BUCKET)
          .remove([uploadedPath]);
        if (cleanupError) {
          console.error("[GroupLogoForm] orphan upload cleanup failed:", cleanupError.message);
        }
        setMessage(result?.message || "Gagal menyimpan logo grup.");
        return;
      }

      let successMessage = result.message;
      if (result.oldPath) {
        const { error: cleanupError } = await supabase.storage
          .from(BUCKET)
          .remove([result.oldPath]);
        if (cleanupError) {
          console.error("[GroupLogoForm] old logo cleanup failed:", cleanupError.message);
          successMessage += " Logo baru tersimpan, tetapi file logo lama belum berhasil dibersihkan.";
        }
      }

      setMessage(successMessage);
      inputRef.current.value = "";
      router.refresh();
    } catch (error) {
      console.error("[GroupLogoForm] upload flow failed:", error);
      if (uploadedPath && supabase) {
        const { error: cleanupError } = await supabase.storage
          .from(BUCKET)
          .remove([uploadedPath]);
        if (cleanupError) {
          console.error("[GroupLogoForm] failed upload cleanup failed:", cleanupError.message);
        }
      }
      setMessage("Terjadi kesalahan saat mengunggah logo. Coba lagi.");
    } finally {
      setPending(false);
    }
  }

  async function handleRemove() {
    if (pending) return;

    setPending(true);
    setMessage("");

    try {
      const result = await removeGroupLogo();
      if (!result?.ok) {
        setMessage(result?.message || "Logo grup gagal dihapus.");
        return;
      }

      let successMessage = result.message;
      if (result.oldPath) {
        const supabase = createClient();
        const { error } = await supabase.storage.from(BUCKET).remove([result.oldPath]);
        if (error) {
          console.error("[GroupLogoForm] logo object cleanup failed:", error.message);
          successMessage += " File lama belum berhasil dibersihkan dari Storage.";
        }
      }

      setMessage(successMessage);
      router.refresh();
    } catch (error) {
      console.error("[GroupLogoForm] remove flow failed:", error);
      setMessage("Terjadi kesalahan saat menghapus logo. Coba lagi.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5">
      <h2 className="font-semibold">Logo grup</h2>
      <p className="mt-1 text-sm text-zinc-600">
        Gunakan gambar JPG, PNG, atau WebP dengan ukuran maksimal 2 MB.
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-4">
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoUrl}
            alt={`Logo ${groupName}`}
            className="h-20 w-20 rounded-lg border border-zinc-200 bg-white object-contain p-1"
          />
        ) : (
          <div
            aria-label="Belum ada logo"
            className="flex h-20 w-20 items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-zinc-50 text-2xl font-semibold text-zinc-400"
          >
            {groupName?.trim()?.charAt(0)?.toUpperCase() || "G"}
          </div>
        )}
        <form onSubmit={handleUpload} className="min-w-0 flex-1 space-y-3">
          <input
            ref={inputRef}
            name="logo"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={pending}
            className="block w-full text-sm text-zinc-700 file:mr-3 file:rounded-md file:border-0 file:bg-zinc-100 file:px-3 file:py-2 file:text-sm file:font-medium"
          />
          <div className="flex flex-wrap gap-2">
            <Button type="submit" pending={pending} pendingText="Mengunggah...">
              Upload logo
            </Button>
            {logoUrl ? (
              <Button
                type="button"
                onClick={handleRemove}
                pending={pending}
                pendingText="Menghapus..."
                variant="secondary"
              >
                Hapus logo
              </Button>
            ) : null}
          </div>
        </form>
      </div>
      {message ? (
        <p
          role="status"
          className={`mt-3 text-sm ${message.includes("berhasil") || message.includes("tersimpan") ? "text-emerald-700" : "text-red-700"}`}
        >
          {message}
        </p>
      ) : null}
    </section>
  );
}
