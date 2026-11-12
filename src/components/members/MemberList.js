"use client";

import Link from "next/link";
import { useState } from "react";
import { deleteMember } from "@/actions/members";
import { ConfirmDeleteButton } from "@/components/ui/ConfirmDeleteButton";
import MemberInvitationForm from "@/components/members/MemberInvitationForm";
import ListPagination from "@/components/ui/ListPagination";

const PAGE_SIZE = 5;

export default function MemberList({ members, standalone = false }) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(members.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const visibleMembers = members.slice(startIndex, startIndex + PAGE_SIZE);
  const returnTo = standalone ? "/members/all" : "/members";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          {standalone ? <Link href="/members" className="text-sm font-medium text-indigo-700 hover:underline">← Kembali ke anggota</Link> : null}
          {standalone ? <h2 className="mt-2 text-xl font-semibold">Semua anggota panitia</h2> : null}
          <p className="text-sm text-zinc-600">{standalone ? "Seluruh anggota yang terdaftar pada grup." : "Daftar orang yang dapat ditugaskan ke event."}</p>
        </div>
        {!standalone && members.length > 0 ? <Link href="/members/all" className="shrink-0 rounded-md border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-800 hover:bg-indigo-100">Lihat semua anggota</Link> : null}
      </div>

      {members.length ? (
        <>
          <p className="text-xs text-zinc-500" aria-live="polite">Menampilkan {startIndex + 1}–{Math.min(startIndex + PAGE_SIZE, members.length)} dari {members.length} anggota.</p>
          <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white divide-y divide-zinc-100">
            {visibleMembers.map((member) => (
              <div key={member.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <h2 className="font-medium">{member.full_name}</h2>
                  <p className="text-sm text-zinc-500">{member.contact || "Kontak belum diisi"}</p>
                  <MemberInvitationForm memberId={member.id} connected={Boolean(member.auth_user_id)} />
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/members/${member.id}/edit${standalone ? "?returnTo=%2Fmembers%2Fall" : ""}`} className="rounded-md border border-zinc-300 px-3 py-2 text-sm">Edit</Link>
                  <form action={deleteMember}>
                    <input type="hidden" name="id" value={member.id} />
                    <input type="hidden" name="return_to" value={returnTo} />
                    <ConfirmDeleteButton message={`Hapus anggota ${member.full_name}? Penugasan dan kepanitiaan terkait akan dilepas.`} />
                  </form>
                </div>
              </div>
            ))}
          </div>
          <ListPagination currentPage={currentPage} totalPages={totalPages} onPageChange={setPage} />
        </>
      ) : (
        <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-8 text-center">
          <h2 className="font-semibold">Belum ada anggota</h2>
          <p className="mt-1 text-sm text-zinc-600">Tambahkan anggota agar dapat dipilih sebagai koordinator event.</p>
          {!standalone ? <Link href="/members/new" className="mt-4 inline-block text-sm font-medium text-indigo-700">Tambah anggota pertama →</Link> : null}
        </div>
      )}
    </div>
  );
}
