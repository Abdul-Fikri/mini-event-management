"use client";

import { useActionState, useState } from "react";
import { saveEventDivision, deleteEventDivision } from "@/actions/event-divisions";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { ConfirmDeleteButton } from "@/components/ui/ConfirmDeleteButton";
import { TextField } from "@/components/ui/TextField";

const initial = { message: "", errors: {}, values: {} };

function DivisionForm({ eventId, division = null }) {
  const [state, action, pending] = useActionState(
    saveEventDivision.bind(null, eventId, division?.id ?? null),
    initial,
  );
  const value = (key) => state.values?.[key] ?? division?.[key] ?? "";
  const suffix = division?.id ?? "new";

  return (
    <form action={action} className="space-y-3">
      {state.message ? <Alert>{state.message}</Alert> : null}
      <TextField
        id={`division-name-${suffix}`}
        name="name"
        label="Nama divisi"
        required
        defaultValue={value("name")}
        error={state.errors?.name}
        hint="Contoh: Acara, Perlengkapan, Konsumsi, Publikasi."
      />
      <TextField
        id={`division-description-${suffix}`}
        name="description"
        label="Deskripsi (opsional)"
        multiline
        defaultValue={value("description")}
        error={state.errors?.description}
      />
      <Button type="submit" pending={pending} pendingText="Menyimpan…">
        {division ? "Simpan divisi" : "Tambah divisi"}
      </Button>
    </form>
  );
}

function DivisionDeleteForm({ eventId, division }) {
  const [state, action] = useActionState(
    deleteEventDivision.bind(null, eventId, division.id),
    initial,
  );

  return (
    <form action={action} className="space-y-2">
      <ConfirmDeleteButton
        message={`Hapus divisi “${division.name}”? Penugasan yang sudah memakai divisi ini tetap menyimpan nama lama sebagai label historis.`}
      >
        Hapus
      </ConfirmDeleteButton>
      {state.message ? <Alert>{state.message}</Alert> : null}
    </form>
  );
}

export default function EventDivisionManager({ eventId, divisions = [] }) {
  const [search, setSearch] = useState("");
  const normalizedSearch = search.trim().toLowerCase();
  const filteredDivisions = divisions.filter((division) => {
    const searchableText = [division.name, division.description]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return searchableText.includes(normalizedSearch);
  });

  return (
    <section className="space-y-4 rounded-lg border border-zinc-200 bg-white p-5">
      <div>
        <h2 className="text-lg font-semibold">Kelola divisi</h2>
        <p className="text-sm text-zinc-600">
          Buat daftar divisi khusus untuk event ini. Saat menyusun panitia, pilih divisi dari daftar agar penamaannya konsisten.
        </p>
      </div>

      {divisions.length ? (
        <div className="space-y-3">
          <div>
            <label htmlFor="search-event-divisions" className="mb-1 block text-sm font-medium">
              Cari divisi
            </label>
            <input
              id="search-event-divisions"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari nama atau deskripsi divisi…"
              className="block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm shadow-xs placeholder:text-zinc-400 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/25"
            />
          </div>

          <p className="text-xs text-zinc-500" aria-live="polite">
            Menampilkan {filteredDivisions.length} dari {divisions.length} divisi.
          </p>

          {filteredDivisions.length ? (
            <div className="space-y-2">
              {filteredDivisions.map((division) => (
                <article key={division.id} className="rounded-lg border border-zinc-200 p-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-medium">{division.name}</h3>
                      {division.description ? (
                        <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-600">{division.description}</p>
                      ) : null}
                    </div>
                    <DivisionDeleteForm eventId={eventId} division={division} />
                  </div>
                  <details className="mt-3">
                    <summary className="cursor-pointer text-sm font-medium text-indigo-700">Edit divisi</summary>
                    <div className="mt-3 border-t border-zinc-100 pt-3">
                      <DivisionForm eventId={eventId} division={division} />
                    </div>
                  </details>
                </article>
              ))}
            </div>
          ) : (
            <p className="rounded-md border border-dashed border-zinc-300 p-4 text-center text-sm text-zinc-600">
              Divisi tidak ditemukan. Coba kata kunci lain.
            </p>
          )}
        </div>
      ) : (
        <p className="rounded-md border border-dashed border-zinc-300 p-4 text-center text-sm text-zinc-600">
          Belum ada divisi. Tambahkan divisi terlebih dahulu agar bisa dipilih pada form penugasan panitia.
        </p>
      )}

      <details className="border-t border-zinc-100 pt-3" open={divisions.length === 0}>
        <summary className="cursor-pointer text-sm font-semibold text-indigo-700">Tambah divisi baru</summary>
        <div className="mt-3">
          <DivisionForm eventId={eventId} />
        </div>
      </details>
    </section>
  );
}
