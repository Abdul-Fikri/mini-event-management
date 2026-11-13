"use client";

import Link from "next/link";
import { useState } from "react";
import { deleteEventMember } from "@/actions/event-members";
import { ConfirmDeleteButton } from "@/components/ui/ConfirmDeleteButton";
import EventMemberForm from "@/components/events/EventMemberForm";
import ListPagination from "@/components/ui/ListPagination";

const PAGE_SIZE = 5;
const INPUT_CLASS =
  "block w-full rounded-xl border border-[#D7E3F0] bg-white px-3.5 py-2.5 text-sm text-[#0F172A] shadow-sm placeholder:text-[#94A3B8] focus:border-[#5C98CB] focus:outline-none focus:ring-4 focus:ring-[#5C98CB]/10";

function getInitials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "?";
}

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
    <div className="space-y-5">
      {standalone ? (
        <div>
          <Link href={basePath} className="text-sm font-semibold text-[#407BB0] hover:text-[#32628E] hover:underline">
            ← Kembali ke Panitia
          </Link>
          <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#64748B]">PENGELOLAAN EVENT</p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-[#0F172A]">Semua susunan panitia</h2>
              <p className="mt-1 text-sm leading-6 text-[#64748B]">
                Cari anggota, filter divisi, lalu kelola penugasan pada halaman khusus ini.
              </p>
            </div>
            <span className="rounded-full bg-[#EBF3FC] px-3 py-1.5 text-sm font-semibold text-[#32628E]">
              {committee.length} anggota
            </span>
          </div>
        </div>
      ) : null}

      {committee.length ? (
        <>
          <div className="rounded-2xl border border-[#E2EBF5] bg-[#F8FBFF] p-4 sm:p-5">
            <div className="mb-4">
              <h3 className="font-semibold text-[#0F172A]">Temukan anggota</h3>
              <p className="mt-1 text-xs leading-5 text-[#64748B]">
                Gunakan pencarian dan filter secara bersamaan untuk menemukan penugasan dengan cepat.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(12rem,0.62fr)]">
              <div>
                <label htmlFor={standalone ? "search-all-event-committee" : "search-event-committee"} className="mb-1.5 block text-sm font-semibold text-[#334155]">
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
                  className={INPUT_CLASS}
                />
              </div>

              <div>
                <label htmlFor={standalone ? "filter-all-event-committee-division" : "filter-event-committee-division"} className="mb-1.5 block text-sm font-semibold text-[#334155]">
                  Filter divisi
                </label>
                <select
                  id={standalone ? "filter-all-event-committee-division" : "filter-event-committee-division"}
                  value={divisionFilter}
                  onChange={(event) => {
                    setDivisionFilter(event.target.value);
                    setPage(1);
                  }}
                  className={INPUT_CLASS}
                >
                  <option value="all">Semua divisi</option>
                  <option value="unassigned">Tanpa divisi aktif</option>
                  {divisions.map((division) => (
                    <option key={division.id} value={division.id}>{division.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="rounded-full bg-[#F0F5FA] px-3 py-1.5 text-xs font-medium text-[#64748B]" aria-live="polite">
              {filteredCommittee.length
                ? `Menampilkan ${startIndex + 1}–${Math.min(startIndex + PAGE_SIZE, filteredCommittee.length)} dari ${filteredCommittee.length} anggota (total ${committee.length}).`
                : `Tidak ada hasil dari ${committee.length} anggota panitia.`}
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
                  className="text-sm font-semibold text-[#407BB0] transition-colors hover:text-[#32628E]"
                >
                  Reset pencarian dan filter
                </button>
              ) : null}
              {!standalone ? (
                <Link
                  href={viewAllHref}
                  className="inline-flex items-center gap-1 rounded-xl border border-[#D7E6F5] bg-white px-3.5 py-2 text-sm font-semibold text-[#407BB0] shadow-sm transition-colors hover:bg-[#F0F5FA]"
                >
                  Lihat semua susunan panitia <span aria-hidden="true">→</span>
                </Link>
              ) : null}
            </div>
          </div>

          {filteredCommittee.length ? (
            <div className="space-y-3">
              {visibleCommittee.map((item) => (
                <article
                  key={item.id}
                  className="rounded-2xl border border-[#DCE8F4] bg-white p-4 shadow-none transition-all hover:border-[#D2E0ED] hover:shadow-none sm:p-5"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex min-w-0 items-start gap-3.5">
                      <div
                        aria-hidden="true"
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#EBF3FC] text-sm font-bold text-[#407BB0]"
                      >
                        {getInitials(item.member?.full_name ?? "")}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-bold tracking-tight text-[#0F172A]">
                            {item.member?.full_name ?? "Anggota tidak ditemukan"}
                          </h3>
                          {item.division ? (
                            <span className="rounded-full bg-[#EBF3FC] px-2.5 py-1 text-xs font-semibold text-[#32628E]">
                              {item.division}
                            </span>
                          ) : (
                            <span className="rounded-full bg-[#F0F5FA] px-2.5 py-1 text-xs font-medium text-[#64748B]">
                              Tanpa divisi
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm font-medium text-[#475569]">
                          {item.position_title || "Jabatan belum ditentukan"}
                        </p>
                        {item.member?.contact ? (
                          <p className="mt-2 break-all text-sm text-[#64748B]">{item.member.contact}</p>
                        ) : null}
                        {item.responsibility ? (
                          <div className="mt-3 rounded-xl border border-[#E8EFF7] bg-[#F5F8FC] px-3.5 py-3">
                            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#64748B]">
                              Tanggung jawab
                            </p>
                            <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-[#334155]">
                              {item.responsibility}
                            </p>
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <form action={deleteEventMember} className="shrink-0 sm:pl-3">
                      <input type="hidden" name="event_id" value={eventId} />
                      <input type="hidden" name="return_to" value={returnTo} />
                      <input type="hidden" name="assignment_id" value={item.id} />
                      <ConfirmDeleteButton message={`Keluarkan ${item.member?.full_name ?? "anggota"} dari susunan panitia event ini?`}>
                        Keluarkan
                      </ConfirmDeleteButton>
                    </form>
                  </div>

                  <details className="mt-4 border-t border-[#EAF0F7] pt-3">
                    <summary className="cursor-pointer rounded-xl bg-[#F8FBFF] px-3.5 py-2.5 text-sm font-semibold text-[#407BB0] transition-colors hover:bg-[#F0F5FA]">
                      Edit penugasan
                    </summary>
                    <div className="mt-4">
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
            <div className="rounded-2xl border border-dashed border-[#D2E0ED] bg-[#F8FBFF] px-5 py-8 text-center">
              <p className="font-semibold text-[#334155]">Tidak ada anggota yang cocok.</p>
              <p className="mt-1 text-sm text-[#64748B]">Coba ubah kata kunci atau reset filter divisi.</p>
            </div>
          )}

          <ListPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setPage}
            tone="polar"
          />
        </>
      ) : (
        <div className="rounded-2xl border border-dashed border-[#D2E0ED] bg-[#F8FBFF] px-5 py-8 text-center">
          <p className="font-semibold text-[#334155]">Belum ada anggota dalam susunan panitia.</p>
          <p className="mt-1 text-sm text-[#64748B]">Tambahkan anggota grup ke event ini melalui formulir di bawah.</p>
        </div>
      )}
    </div>
  );
}
