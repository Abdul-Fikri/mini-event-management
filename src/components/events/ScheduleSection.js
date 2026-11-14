"use client";

import Link from "next/link";
import { useState } from "react";
import { deleteScheduleItem } from "@/actions/schedule";
import { ConfirmDeleteButton } from "@/components/ui/ConfirmDeleteButton";
import ScheduleItemForm from "@/components/events/ScheduleItemForm";
import ListPagination from "@/components/ui/ListPagination";

const PAGE_SIZE = 5;
const dateFmt = new Intl.DateTimeFormat("id-ID", { dateStyle: "long", timeZone: "Asia/Jakarta" });
const timeFmt = (value) => value ? value.slice(0, 5) : "—";

export default function ScheduleSection({ eventId, eventStartDate, schedule, members, standalone = false }) {
  const [page, setPage] = useState(1);
  const memberById = new Map(members.map((member) => [member.id, member]));
  const totalPages = Math.max(1, Math.ceil(schedule.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const visibleSchedule = schedule.slice(startIndex, startIndex + PAGE_SIZE);
  const basePath = `/events/${eventId}/rundown`;
  const returnTo = standalone ? `${basePath}/all` : basePath;

  return (
    <section className="management-panel space-y-5 p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          {standalone ? <Link href={basePath} className="management-link text-sm hover:underline">← Kembali ke Rundown</Link> : null}
          <h2 className={standalone ? "mt-2 text-xl font-semibold" : "text-lg font-semibold"}>{standalone ? "Semua kegiatan rundown" : "Rundown acara"}</h2>
          <p className="text-sm text-zinc-600">Susun kegiatan berdasarkan tanggal dan jam, lalu tentukan penanggung jawabnya.</p>
        </div>
        {!standalone && schedule.length > 0 ? (
          <Link href={`${basePath}/all`} className="shrink-0 rounded-xl border border-[#D7E5F1] bg-[#EDF4FA] px-3.5 py-2.5 text-sm font-semibold text-[#32628E] transition-colors hover:bg-[#E5EFF8]">
            Lihat semua rundown
          </Link>
        ) : null}
      </div>

      {schedule.length ? (
        <>
          <p className="text-xs text-zinc-500" aria-live="polite">
            Menampilkan {startIndex + 1}–{Math.min(startIndex + PAGE_SIZE, schedule.length)} dari {schedule.length} kegiatan.
          </p>
          <div className="space-y-3">
            {visibleSchedule.map((item, index) => (
              <article key={item.id} className="management-card p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-[#407BB0]">KEGIATAN {startIndex + index + 1} · {dateFmt.format(new Date(item.item_date + "T00:00:00"))}</p>
                    <h3 className="mt-1 font-semibold">{item.title}</h3>
                    <p className="mt-1 text-sm text-zinc-600">{timeFmt(item.start_time)} – {timeFmt(item.end_time)}{item.location ? " · " + item.location : ""}</p>
                    <p className="mt-1 text-sm text-zinc-600">PIC: {memberById.get(item.pic_member_id)?.full_name ?? "Belum ditentukan"}</p>
                    {item.notes ? <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-700">{item.notes}</p> : null}
                  </div>
                  <form action={deleteScheduleItem}>
                    <input type="hidden" name="event_id" value={eventId} />
                    <input type="hidden" name="return_to" value={returnTo} />
                    <input type="hidden" name="item_id" value={item.id} />
                    <ConfirmDeleteButton message={`Hapus kegiatan "${item.title}" dari rundown?`}>Hapus</ConfirmDeleteButton>
                  </form>
                </div>
                <details className="mt-3">
                  <summary className="cursor-pointer text-sm font-semibold text-[#407BB0] hover:text-[#32628E]">Edit kegiatan</summary>
                  <div className="mt-3">
                    <ScheduleItemForm eventId={eventId} members={members} item={item} eventStartDate={eventStartDate} returnTo={returnTo} />
                  </div>
                </details>
              </article>
            ))}
          </div>
          <ListPagination currentPage={currentPage} totalPages={totalPages} onPageChange={setPage} />
        </>
      ) : (
        <p className="management-empty p-5 text-center text-sm text-[#64748B]">Belum ada kegiatan dalam rundown event ini.</p>
      )}

      {!standalone ? (
        <div className="border-t border-[#EEF2F6] pt-5">
          <h3 className="mb-3 font-medium">Tambah kegiatan</h3>
          <ScheduleItemForm eventId={eventId} members={members} eventStartDate={eventStartDate} returnTo={returnTo} />
        </div>
      ) : null}
    </section>
  );
}
