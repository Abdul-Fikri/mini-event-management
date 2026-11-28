"use client";

import Link from "next/link";
import { useState } from "react";
import { deleteMember } from "@/actions/members";
import { ConfirmDeleteButton } from "@/components/ui/ConfirmDeleteButton";
import MemberForm from "@/components/members/MemberForm";
import Modal from "@/components/ui/Modal";
import ListPagination from "@/components/ui/ListPagination";

const PAGE_SIZE = 5;

function getInitials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "?";
}

export default function MemberList({ members, standalone = false }) {
  const [page, setPage] = useState(1);
  const [activeMember, setActiveMember] = useState(null);
  const totalPages = Math.max(1, Math.ceil(members.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const visibleMembers = members.slice(startIndex, startIndex + PAGE_SIZE);
  const returnTo = standalone ? "/members/all" : "/members";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          {standalone ? (
            <Link href="/members" className="management-link text-sm hover:underline">
              ← Kembali ke anggota
            </Link>
          ) : null}
          {standalone ? <h2 className="mt-2 text-xl font-semibold">Semua anggota panitia</h2> : null}
          <p className="text-sm text-zinc-600">
            {standalone
              ? "Seluruh anggota yang terdaftar pada grup."
              : "Daftar orang yang dapat ditugaskan ke event."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setActiveMember({ mode: "add" })} className="rounded-xl bg-[#407BB0] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#32628E]">
            + Tambah anggota
          </button>
          {!standalone && members.length > 0 ? (
            <Link
              href="/members/all"
              className="shrink-0 rounded-xl border border-[#D7E5F1] bg-[#EDF4FA] px-3.5 py-2 text-sm font-semibold text-[#32628E] transition-colors hover:bg-[#E5EFF8]"
            >
              Lihat semua anggota
            </Link>
          ) : null}
        </div>
      </div>

      {members.length ? (
        <>
          <p className="text-xs text-zinc-500" aria-live="polite">
            Menampilkan {startIndex + 1}–{Math.min(startIndex + PAGE_SIZE, members.length)} dari {members.length} anggota.
          </p>
          <div className="space-y-3">
            {visibleMembers.map((member) => (
              <article
                key={member.id}
                className="management-card flex flex-col justify-between gap-4 p-4 sm:flex-row sm:items-center sm:p-5"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <span
                    aria-hidden="true"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EDF4FA] text-xs font-semibold text-[#407BB0]"
                  >
                    {getInitials(member.full_name)}
                  </span>
                  <div className="min-w-0">
                    <h2 className="font-semibold text-zinc-900">{member.full_name}</h2>
                    <p className="mt-0.5 text-sm text-zinc-500">
                      {member.contact || "Kontak belum diisi"}
                    </p>
                    <p className={`mt-2 text-xs font-medium ${member.auth_user_id ? "text-emerald-700" : "text-amber-700"}`}>
                      {member.auth_user_id
                        ? `Akun terhubung · ${member.account_email || "email belum tercatat"}`
                        : "Akun belum dibuat · Edit untuk membuat akun"}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2 pl-[52px] sm:pl-0">
                  <button
                    type="button"
                    onClick={() => setActiveMember({ mode: "edit", member })}
                    className="rounded-xl border border-[#DCE5EE] bg-white px-3.5 py-2 text-sm font-medium text-[#475569] transition-colors hover:bg-[#F7F9FC]"
                  >
                    Edit
                  </button>
                  <form action={deleteMember}>
                    <input type="hidden" name="id" value={member.id} />
                    <input type="hidden" name="return_to" value={returnTo} />
                    <ConfirmDeleteButton message={`Hapus anggota ${member.full_name}? Akun login terkait juga akan dihapus dan penugasan event akan dilepas.`} />
                  </form>
                </div>
              </article>
            ))}
          </div>
          <ListPagination currentPage={currentPage} totalPages={totalPages} onPageChange={setPage} />
        </>
      ) : (
        <div className="management-empty p-8 text-center">
          <h2 className="font-semibold">Belum ada anggota</h2>
          <p className="mt-1 text-sm text-zinc-600">
            Tambahkan anggota agar dapat dipilih sebagai koordinator event.
          </p>
          <button type="button" onClick={() => setActiveMember({ mode: "add" })} className="mt-4 inline-flex text-sm font-semibold text-[#407BB0] hover:text-[#32628E]">
            Tambah anggota pertama →
          </button>
        </div>
      )}
      <Modal
        open={Boolean(activeMember)}
        onClose={() => setActiveMember(null)}
        title={activeMember?.mode === "edit" ? "Edit anggota panitia" : "Tambah anggota panitia"}
        description={activeMember?.mode === "edit" ? "Perbarui nama dan kontak anggota grup." : "Tambahkan orang yang dapat ditugaskan ke event dalam grup ini."}
        size="md"
      >
        {activeMember ? <MemberForm key={activeMember.member?.id ?? "new-member"} member={activeMember.member ?? null} returnTo={returnTo} /> : null}
      </Modal>
    </div>
  );
}
