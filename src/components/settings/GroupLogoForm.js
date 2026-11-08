"use client";

import { useActionState } from "react";
import { saveGroupLogo } from "@/actions/group-logo";

const initialState = { ok: false, message: "" };

export default function GroupLogoForm({ logoUrl, groupName }) {
  const [state, formAction, pending] = useActionState(saveGroupLogo, initialState);

  function removeLogoAction(formData) {
    formData.set("remove", "true");
    formAction(formData);
  }

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5">
      <h2 className="font-semibold">Logo grup</h2>
      <p className="mt-1 text-sm text-zinc-600">Gunakan gambar JPG, PNG, atau WebP dengan ukuran maksimal 2 MB.</p>
      <div className="mt-4 flex flex-wrap items-center gap-4">
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt={`Logo ${groupName}`} className="h-20 w-20 rounded-lg border border-zinc-200 bg-white object-contain p-1" />
        ) : (
          <div aria-label="Belum ada logo" className="flex h-20 w-20 items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-zinc-50 text-2xl font-semibold text-zinc-400">
            {groupName?.trim()?.charAt(0)?.toUpperCase() || "G"}
          </div>
        )}
        <form action={formAction} className="min-w-0 flex-1 space-y-3">
          <input name="logo" type="file" accept="image/jpeg,image/png,image/webp" className="block w-full text-sm text-zinc-700 file:mr-3 file:rounded-md file:border-0 file:bg-zinc-100 file:px-3 file:py-2 file:text-sm file:font-medium" />
          <div className="flex flex-wrap gap-2">
            <button type="submit" disabled={pending} className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60">
              {pending ? "Menyimpan..." : "Upload logo"}
            </button>
            {logoUrl ? <button type="submit" formAction={removeLogoAction} disabled={pending} className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-60">Hapus logo</button> : null}
          </div>
        </form>
      </div>
      {state.message ? <p role="status" className={`mt-3 text-sm ${state.ok ? "text-emerald-700" : "text-red-700"}`}>{state.message}</p> : null}
    </section>
  );
}
