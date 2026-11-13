"use client";

import Link from "next/link";
import { useState } from "react";
import { EVENT_STATUS_LABELS } from "@/lib/events/status";
import ListPagination from "@/components/ui/ListPagination";

const PAGE_SIZE = 5;
const dateFmt = new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeZone: "Asia/Jakarta" });

export default function EventList({ events, standalone = false }) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(events.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const visibleEvents = events.slice(startIndex, startIndex + PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          {standalone ? <Link href="/events" className="management-link text-sm hover:underline">← Kembali ke daftar event</Link> : null}
          {standalone ? <h2 className="mt-2 text-xl font-semibold">Semua event grup</h2> : null}
          <p className="text-sm text-zinc-600">{standalone ? "Seluruh event yang dikelola oleh grup." : "Daftar event terbaru yang dikelola oleh grup. (ketuk event untuk melihat)"}</p>
        </div>
        {!standalone && events.length > 0 ? <Link href="/events/all" className="shrink-0 rounded-xl border border-[#D7E5F1] bg-[#EDF4FA] px-3.5 py-2.5 text-sm font-semibold text-[#32628E] transition-colors hover:bg-[#E5EFF8]">Lihat semua event</Link> : null}
      </div>

      {events.length ? (
        <>
          <p className="text-xs text-zinc-500" aria-live="polite">Menampilkan {startIndex + 1}–{Math.min(startIndex + PAGE_SIZE, events.length)} dari {events.length} event.</p>
          <div className="grid gap-3">
            {visibleEvents.map((event) => (
              <Link key={event.id} href={`/events/${event.id}`} className="management-card p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h2 className="font-semibold">{event.name}</h2>
                    <p className="mt-1 text-sm text-zinc-600">{event.category || "Tanpa kategori"}{event.location ? ` · ${event.location}` : ""}</p>
                  </div>
                  <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs">{EVENT_STATUS_LABELS[event.effectiveStatus] || EVENT_STATUS_LABELS.draft}</span>
                </div>
                <p className="mt-3 text-xs text-zinc-500">{dateFmt.format(new Date(`${event.start_date}T00:00:00`))}{event.end_date ? ` – ${dateFmt.format(new Date(`${event.end_date}T00:00:00`))}` : ""}</p>
              </Link>
            ))}
          </div>
          <ListPagination currentPage={currentPage} totalPages={totalPages} onPageChange={setPage} />
        </>
      ) : (
        <div className="management-empty p-8 text-center">
          <h2 className="font-semibold">Belum ada event</h2>
          <p className="mt-1 text-sm text-zinc-600">Buat event pertama untuk mulai mengelola acara grup.</p>
          {!standalone ? <Link href="/events/new" className="mt-4 inline-block text-sm font-semibold text-[#407BB0] hover:text-[#32628E]">Buat event pertama →</Link> : null}
        </div>
      )}
    </div>
  );
}
