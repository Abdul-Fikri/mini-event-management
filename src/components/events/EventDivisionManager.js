"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { saveEventDivision, deleteEventDivision } from "@/actions/event-divisions";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { ConfirmDeleteButton } from "@/components/ui/ConfirmDeleteButton";
import ListPagination from "@/components/ui/ListPagination";
import { TextField } from "@/components/ui/TextField";
import Modal from "@/components/ui/Modal";

const PAGE_SIZE = 5;
const initial = { message: "", errors: {}, values: {} };
const INPUT_CLASS =
  "block w-full rounded-xl border border-[#D7E3F0] bg-white px-3.5 py-2.5 text-sm text-[#0F172A] shadow-sm placeholder:text-[#94A3B8] focus:border-[#5C98CB] focus:outline-none focus:ring-4 focus:ring-[#5C98CB]/10";

function DivisionForm({ eventId, division = null, returnTo }) {
  const [state, action, pending] = useActionState(
    saveEventDivision.bind(null, eventId, division?.id ?? null),
    initial,
  );
  const value = (key) => state.values?.[key] ?? division?.[key] ?? "";
  const suffix = division?.id ?? "new";

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="return_to" value={returnTo} />
      {state.message ? <Alert>{state.message}</Alert> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          id={`division-name-${suffix}`}
          name="name"
          label="Nama divisi"
          required
          defaultValue={value("name")}
          error={state.errors?.name}
          hint="Contoh: Acara, Perlengkapan, Konsumsi, Publikasi."
          className={INPUT_CLASS}
        />
        <TextField
          id={`division-description-${suffix}`}
          name="description"
          label="Deskripsi (opsional)"
          multiline
          defaultValue={value("description")}
          error={state.errors?.description}
          className={INPUT_CLASS}
        />
      </div>
      <div className="flex justify-end">
        <Button type="submit" variant="ice" pending={pending} pendingText="Menyimpan…" className="rounded-xl px-5 py-2.5">
          {division ? "Simpan divisi" : "Tambah divisi"}
        </Button>
      </div>
    </form>
  );
}

function DivisionDeleteForm({ eventId, division, returnTo }) {
  const [state, action] = useActionState(
    deleteEventDivision.bind(null, eventId, division.id),
    initial,
  );

  return (
    <form action={action} className="space-y-2">
      <input type="hidden" name="return_to" value={returnTo} />
      <ConfirmDeleteButton
        message={`Hapus divisi “${division.name}”? Penugasan yang sudah memakai divisi ini tetap menyimpan nama lama sebagai label historis.`}
      >
        Hapus
      </ConfirmDeleteButton>
      {state.message ? <Alert>{state.message}</Alert> : null}
    </form>
  );
}

export default function EventDivisionManager({
  eventId,
  divisions = [],
  standalone = false,
  initialSearch = "",
}) {
  const [search, setSearch] = useState(initialSearch);
  const [page, setPage] = useState(1);
  const [activeDivision, setActiveDivision] = useState(null);
  const normalizedSearch = search.trim().toLowerCase();
  const filteredDivisions = divisions.filter((division) => {
    const searchableText = [division.name, division.description]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return searchableText.includes(normalizedSearch);
  });

  const totalPages = Math.max(1, Math.ceil(filteredDivisions.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const visibleDivisions = filteredDivisions.slice(startIndex, startIndex + PAGE_SIZE);
  const basePath = `/events/${eventId}/panitia`;
  const returnTo = standalone ? `${basePath}/divisions` : basePath;

  if (!standalone) {
    return (
      <section className="overflow-hidden rounded-2xl border border-[#E2EBF5] bg-white shadow-none">
        <div className="flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6">
          <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight text-[#0F172A]">Divisi event</h2>
                <span className="rounded-full bg-[#F0F5FA] px-2.5 py-1 text-xs font-semibold text-[#64748B]">
                  {divisions.length} divisi tersedia
                </span>
              </div>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-[#64748B]">
                Atur kelompok kerja untuk event ini. Divisi yang dibuat akan tersedia saat menambahkan anggota panitia.
              </p>
          </div>

          <div className="flex w-full flex-wrap gap-2 sm:w-auto">
            <Button
              type="button"
              variant="iceSecondary"
              onClick={() => setActiveDivision({ mode: "add" })}
              className="rounded-xl px-4 py-2.5"
            >
              Tambah divisi
            </Button>
            <Link
              href={`${basePath}/divisions`}
              className="inline-flex items-center justify-center rounded-xl bg-[#407BB0] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#32628E] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#407BB0]"
            >
              Kelola divisi
            </Link>
          </div>
        </div>

        <Modal
          open={Boolean(activeDivision)}
          onClose={() => setActiveDivision(null)}
          title="Tambah divisi"
          description="Isi nama dan deskripsi singkat agar divisi mudah dikenali saat menyusun panitia."
          size="md"
        >
          {activeDivision ? <DivisionForm eventId={eventId} returnTo={returnTo} /> : null}
        </Modal>
      </section>
    );
  }

  return (
    <section className="space-y-5 rounded-2xl border border-[#E2EBF5] bg-white p-5 shadow-none sm:p-6">
      <div>
        <Link href={basePath} className="text-sm font-semibold text-[#407BB0] hover:text-[#32628E] hover:underline">
          ← Kembali ke Panitia
        </Link>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#64748B]">PENGELOLAAN EVENT</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-[#0F172A]">Kelola divisi</h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-[#64748B]">
              Buat daftar divisi khusus untuk event ini. Saat menyusun panitia, pilih divisi dari daftar agar penamaannya konsisten.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[#EBF3FC] px-3 py-1.5 text-sm font-semibold text-[#32628E]">
              {divisions.length} divisi
            </span>
            <Button type="button" variant="ice" onClick={() => setActiveDivision({ mode: "add" })}>
              + Tambah divisi
            </Button>
          </div>
        </div>
      </div>

      {divisions.length ? (
        <div className="space-y-4">
          <div className="rounded-2xl border border-[#E2EBF5] bg-[#F8FBFF] p-4">
            <label htmlFor="search-all-event-divisions" className="mb-1.5 block text-sm font-semibold text-[#334155]">
              Cari divisi
            </label>
            <input
              id="search-all-event-divisions"
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Cari nama atau deskripsi divisi…"
              className={`${INPUT_CLASS} bg-white`}
            />
          </div>

          <p className="text-sm text-[#64748B]" aria-live="polite">
            {filteredDivisions.length
              ? `Menampilkan ${startIndex + 1}–${Math.min(startIndex + PAGE_SIZE, filteredDivisions.length)} dari ${filteredDivisions.length} divisi.`
              : `Menampilkan 0 dari ${divisions.length} divisi.`}
          </p>

          {filteredDivisions.length ? (
            <div className="space-y-3">
              {visibleDivisions.map((division) => (
                <article key={division.id} className="rounded-2xl border border-[#E2EBF5] bg-white p-4 shadow-none transition-colors hover:border-[#D2E0ED] sm:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-bold text-[#0F172A]">{division.name}</h3>
                      {division.description ? (
                        <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-[#64748B]">{division.description}</p>
                      ) : (
                        <p className="mt-1 text-sm italic text-[#94A3B8]">Belum ada deskripsi.</p>
                      )}
                    </div>
                    <DivisionDeleteForm eventId={eventId} division={division} returnTo={returnTo} />
                  </div>
                  <div className="mt-4 border-t border-[#EAF0F7] pt-3">
                    <Button
                      type="button"
                      variant="iceSecondary"
                      onClick={() => setActiveDivision({ mode: "edit", division })}
                    >
                      Edit divisi
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="rounded-2xl border border-dashed border-[#D2E0ED] bg-[#F8FBFF] p-5 text-center text-sm text-[#64748B]">
              Divisi tidak ditemukan. Coba kata kunci lain.
            </p>
          )}

          <ListPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setPage}
            tone="polar"
          />
        </div>
      ) : (
        <p className="rounded-2xl border border-dashed border-[#D2E0ED] bg-[#F8FBFF] p-5 text-center text-sm text-[#64748B]">
          Belum ada divisi. Tambahkan divisi terlebih dahulu agar bisa dipilih pada form penugasan panitia.
        </p>
      )}

      {divisions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#D2E0ED] bg-[#F8FBFF] p-5 text-center">
          <p className="text-sm text-[#64748B]">Belum ada divisi untuk event ini.</p>
          <Button type="button" variant="ice" onClick={() => setActiveDivision({ mode: "add" })} className="mt-3">
            + Tambah divisi
          </Button>
        </div>
      ) : null}
      <Modal
        open={Boolean(activeDivision)}
        onClose={() => setActiveDivision(null)}
        title={activeDivision?.mode === "edit" ? "Edit divisi" : "Tambah divisi"}
        description={activeDivision?.mode === "edit"
          ? "Perbarui nama atau deskripsi divisi event ini."
          : "Isi nama dan deskripsi singkat agar divisi mudah dikenali."}
        size="md"
      >
        {activeDivision ? (
          <DivisionForm
            key={activeDivision.mode === "edit" ? activeDivision.division.id : "new-division"}
            eventId={eventId}
            division={activeDivision.division ?? null}
            returnTo={returnTo}
          />
        ) : null}
      </Modal>
    </section>
  );
}
