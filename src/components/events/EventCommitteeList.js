"use client";

import { useState } from "react";
import { deleteEventMember } from "@/actions/event-members";
import { ConfirmDeleteButton } from "@/components/ui/ConfirmDeleteButton";
import EventMemberForm from "@/components/events/EventMemberForm";

export default function EventCommitteeList({
  eventId,
  committee = [],
  members = [],
  divisions = [],
}) {
  const [search, setSearch] = useState("");
  const [divisionFilter, setDivisionFilter] = useState("all");
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

  const hasActiveFilters = Boolean(normalizedSearch) || divisionFilter !== "all";

  return (
    <div className="space-y-4">
      {committee.length ? (
        <>
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(12rem,0.65fr)]">
            <div>
              <label htmlFor="search-event-committee" className="mb-1 block text-sm font-medium">
                Cari anggota panitia
              </label>
              <input
                id="search-event-committee"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Nama, divisi, jabatan, tanggung jawab…"
                className="block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm shadow-xs placeholder:text-zinc-400 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/25"
              />
            </div>

            <div>
              <label htmlFor="filter-event-committee-division" className="mb-1 block text-sm font-medium">
                Filter divisi
              </label>
              <select
                id="filter-event-committee-division"
                value={divisionFilter}
                onChange={(event) => setDivisionFilter(event.target.value)}
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
              Menampilkan {filteredCommittee.length} dari {committee.length} anggota panitia.
            </p>
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setDivisionFilter("all");
                }}
                className="font-medium text-indigo-700 hover:text-indigo-900"
              >
                Reset pencarian dan filter
              </button>
            ) : null}
          </div>

          {filteredCommittee.length ? (
            <div className="space-y-3">
              {filteredCommittee.map((item) => (
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
                      <input type="hidden" name="return_to" value={`/events/${eventId}/panitia`} />
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
        </>
      ) : (
        <p className="rounded-md border border-dashed border-zinc-300 p-4 text-center text-sm text-zinc-600">
          Belum ada anggota dalam susunan panitia event ini.
        </p>
      )}
    </div>
  );
}
