"use client";

import { useActionState } from "react";
import { saveEventMember } from "@/actions/event-members";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";

const initial = { message: "", errors: {}, values: {} };
const INPUT_CLASS =
  "block w-full rounded-xl border border-[#D7E3F0] bg-white px-3.5 py-2.5 text-sm text-[#0F172A] shadow-sm placeholder:text-[#94A3B8] focus:border-[#3B82F6] focus:outline-none focus:ring-4 focus:ring-[#3B82F6]/10";

export default function EventMemberForm({
  eventId,
  members,
  divisions = [],
  assignment = null,
  returnTo = `/events/${eventId}/panitia`,
}) {
  const [state, action, pending] = useActionState(
    saveEventMember.bind(null, eventId, assignment?.id ?? null),
    initial,
  );
  const value = (key) => state.values?.[key] ?? assignment?.[key] ?? "";
  const available = assignment ? members : members.filter((member) => !member.assigned);
  const formId = assignment?.id ?? "new";

  return (
    <form
      action={action}
      className="space-y-4 rounded-2xl border border-[#E2EBF5] bg-white p-4 shadow-[0_2px_8px_rgba(148,163,184,0.06)] sm:p-5"
    >
      <input type="hidden" name="return_to" value={returnTo} />
      {state.message ? <Alert>{state.message}</Alert> : null}

      <div>
        <label htmlFor={`member-${formId}`} className="mb-1.5 block text-sm font-semibold text-[#334155]">
          Anggota
        </label>
        <select
          id={`member-${formId}`}
          name="member_id"
          defaultValue={value("member_id")}
          required
          className={INPUT_CLASS}
        >
          <option value="">Pilih anggota</option>
          {available.map((member) => (
            <option key={member.id} value={member.id}>{member.full_name}</option>
          ))}
        </select>
        {state.errors?.member_id ? (
          <p className="mt-1.5 text-sm text-red-700">{state.errors.member_id}</p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`division-${formId}`} className="mb-1.5 block text-sm font-semibold text-[#334155]">
            Divisi
          </label>
          <select
            id={`division-${formId}`}
            name="division_id"
            defaultValue={value("division_id")}
            className={INPUT_CLASS}
          >
            <option value="">Tanpa divisi</option>
            {divisions.map((division) => (
              <option key={division.id} value={division.id}>{division.name}</option>
            ))}
          </select>
          {state.errors?.division_id ? (
            <p className="mt-1.5 text-sm text-red-700">{state.errors.division_id}</p>
          ) : null}
          {assignment?.division && !assignment?.division_id ? (
            <p className="mt-1.5 text-xs leading-5 text-[#64748B]">
              Label divisi lama “{assignment.division}” tetap disimpan. Pilih divisi baru untuk menggantinya.
            </p>
          ) : null}
        </div>

        <TextField
          id={`position-${formId}`}
          name="position_title"
          label="Jabatan"
          defaultValue={value("position_title")}
          error={state.errors?.position_title}
          className={INPUT_CLASS}
        />
      </div>

      <TextField
        id={`responsibility-${formId}`}
        name="responsibility"
        label="Tanggung jawab"
        multiline
        defaultValue={value("responsibility")}
        error={state.errors?.responsibility}
        className={INPUT_CLASS}
      />

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#EAF0F7] pt-4">
        <p className="text-xs text-[#64748B]">Pastikan divisi dan tanggung jawab sudah sesuai.</p>
        <Button type="submit" variant="ice" pending={pending} pendingText="Menyimpan…" className="rounded-xl px-5 py-2.5">
          {assignment ? "Simpan perubahan" : "Tambahkan ke panitia"}
        </Button>
      </div>
    </form>
  );
}
