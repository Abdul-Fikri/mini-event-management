"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  uploadGroupLogo,
  removeGroupLogo,
} from "@/actions/group-logo";
import { Button } from "@/components/ui/Button";

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function GroupLogoForm({ logoUrl, groupName }) {
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
    if (!ALLOWED_TYPES.includes(file.type)) {
      setMessage("Format logo harus JPG, PNG, atau WebP.");
      return;
    }

    setPending(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.set("logo", file);

      const result = await uploadGroupLogo(formData);
      setMessage(result?.message || "Gagal mengunggah logo grup.");

      if (result?.ok) {
        inputRef.current.value = "";
        router.refresh();
      }
    } catch (error) {
      console.error("[GroupLogoForm] upload failed:", error);
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
      setMessage(result?.message || "Logo grup gagal dihapus.");

      if (result?.ok) router.refresh();
    } catch (error) {
      console.error("[GroupLogoForm] remove failed:", error);
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
