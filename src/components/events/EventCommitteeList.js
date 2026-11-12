"use client";

import Link from "next/link";
import { useState } from "react";
import { deleteEventMember } from "@/actions/event-members";
import { ConfirmDeleteButton } from "@/components/ui/ConfirmDeleteButton";
import EventMemberForm from "@/components/events/EventMemberForm";
import ListPagination from "@/components/ui/ListPagination";

const PAGE_SIZE = 5;

export default function EventCommitteeList({
  eventId,
  committee = [],
  members = [],
  divisions = [],
  standalone = false,
  initialSearch = "",
  initialDivisionFilter = "all",
}) {
  const [search, setSearch] = useState(initialSearch);
  const [divisionFilter, setDivisionFilter] = useState(initialDivisionFilter);
  const [page, setPage] = useState(1);
  const normalizedSearch = search.trim().toLowerCase();

  const filteredCommittee = committee.filter((item) => {
    const matchesDivision =
      divisionFilter === "all" ||
      (divisionFilter === "unassigned"
        ? !item.division_id
        : item.division_id === divisionFilter);

    const searchableText = [
      item.member?.full_name,
      item.member?.contact,
      item.division,
      item.position_title,
      item.responsibility,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return matchesDivision && searchableText.includes(normalizedSearch);
  });

  const totalPages = Math.max(1, Math.ceil(filteredCommittee.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const visibleCommittee = filteredCommittee.slice(startIndex, startIndex + PAGE_SIZE);
  const hasActiveFilters = Boolean(normalizedSearch) || divisionFilter !== "all";
  const basePath = `/events/${eventId}/panitia`;
  const returnTo = standalone ? `${basePath}/committee` : basePath;
  const query = new URLSearchParams();
  if (search.trim()) query.set("q", search.trim());
  if (divisionFilter !== "all") query.set("division", divisionFilter);
  const queryString = query.toString();
  const viewAllHref = `${basePath}/committee${queryString ? `?${queryString}` : ""}`;

  return (
    <div className="space-y-4">
      {standalone ? (
        <div>
          <Link href={basePath} className="text-sm font-medium text-indigo-700 hover:underline">
            ← Kembali ke Panitia
          </Link>
          <h2 className="mt-2 text-xl font-semibold">Semua susunan panitia</h2>
          <p className="mt-1 text-sm text-zinc-600">
            Cari anggota, filter divisi, lalu kelola penugasan pada halaman khusus ini.
          </p>
        </div>
      ) : null}

      {committee.length ? (
        <>
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(12rem,0.65fr)]">
            <div>
              <label htmlFor={standalone ? "search-all-event-committee" : "search-event-committee"} className="mb-1 block text-sm font-medium">
                Cari anggota panitia
              </label>
              <input
                id={standalone ? "search-all-event-committee" : "search-event-committee"}
                type="search"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Nama, divisi, jabatan, tanggung jawab…"
                className="block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm shadow-xs placeholder:text-zinc-400 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/25"
              />
            </div>

            <div>
              <label htmlFor={standalone ? "filter-all-event-committee-division" : "filter-event-committee-division"} className="mb-1 block text-sm font-medium">
                Filter divisi
              </label>
              <select
                id={standalone ? "filter-all-event-committee-division" : "filter-event-committee-division"}
                value={divisionFilter}
                onChange={(event) => {
                  setDivisionFilter(event.target.value);
                  setPage(1);
                }}
                className="block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/25"
              >
                <option value="all">Semua divisi</option>
                <option value="unassigned">Tanpa divisi aktif</option>
                {divisions.map((division) => (
                  <option key={division.id} value={division.id}>{division.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500">
            <p aria-live="polite">
              {filteredCommittee.length
                ? `Menampilkan ${startIndex + 1}–${Math.min(startIndex + PAGE_SIZE, filteredCommittee.length)} dari ${filteredCommittee.length} anggota panitia (total ${committee.length}).`
                : `Menampilkan 0 dari ${committee.length} anggota panitia.`}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              {hasActiveFilters ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setDivisionFilter("all");
                    setPage(1);
                  }}
                  className="font-medium text-indigo-700 hover:text-indigo-900"
                >
                  Reset pencarian dan filter
                </button>
              ) : null}
              {!standalone ? (
                <Link href={viewAllHref} className="font-medium text-indigo-700 hover:text-indigo-900">
                  Lihat semua susunan panitia
                </Link>
              ) : null}
            </div>
          </div>

          {filteredCommittee.length ? (
            <div className="space-y-3">
              {visibleCommittee.map((item) => (
                <article key={item.id} className="rounded-lg border border-zinc-200 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-semibold">{item.member?.full_name ?? "Anggota tidak ditemukan"}</h3>
                      <p className="text-sm text-zinc-600">
                        {[item.division, item.position_title].filter(Boolean).join(" · ") || "Divisi dan jabatan belum ditentukan"}
                      </p>
                      {item.member?.contact ? (
                        <p className="mt-1 text-xs text-zinc-500">{item.member.contact}</p>
                      ) : null}
                      {item.responsibility ? (
                        <p className="mt-2 whitespace-pre-wrap text-sm">{item.responsibility}</p>
                      ) : null}
                    </div>

                    <form action={deleteEventMember}>
                      <input type="hidden" name="event_id" value={eventId} />
                      <input type="hidden" name="return_to" value={returnTo} />
                      <input type="hidden" name="assignment_id" value={item.id} />
                      <ConfirmDeleteButton message={`Keluarkan ${item.member?.full_name ?? "anggota"} dari susunan panitia event ini?`}>
                        Keluarkan
                      </ConfirmDeleteButton>
                    </form>
                  </div>

                  <details className="mt-3">
                    <summary className="cursor-pointer text-sm font-medium text-indigo-700">Edit penugasan</summary>
                    <div className="mt-3">
                      <EventMemberForm
                        eventId={eventId}
                        members={members}
                        divisions={divisions}
                        assignment={item}
                        returnTo={returnTo}
                      />
                    </div>
                  </details>
                </article>
              ))}
            </div>
          ) : (
            <p className="rounded-md border border-dashed border-zinc-300 p-4 text-center text-sm text-zinc-600">
              Tidak ada anggota yang cocok dengan pencarian dan filter divisi.
            </p>
          )}

          <ListPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      ) : (
        <p className="rounded-md border border-dashed border-zinc-300 p-4 text-center text-sm text-zinc-600">
          Belum ada anggota dalam susunan panitia event ini.
        </p>
      )}
    </div>
  );
}
