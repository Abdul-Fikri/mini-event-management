"use client";

import { useActionState } from "react";
import { saveEventMember } from "@/actions/event-members";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";

const initial = { message: "", errors: {}, values: {} };

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
    <form action={action} className="space-y-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
      <input type="hidden" name="return_to" value={returnTo} />
      {state.message ? <Alert>{state.message}</Alert> : null}

      <div>
        <label htmlFor={`member-${formId}`} className="mb-1 block text-sm font-medium">
          Anggota
        </label>
        <select
          id={`member-${formId}`}
          name="member_id"
          defaultValue={value("member_id")}
          required
          className="block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"
        >
          <option value="">Pilih anggota</option>
          {available.map((member) => (
            <option key={member.id} value={member.id}>{member.full_name}</option>
          ))}
        </select>
        {state.errors?.member_id ? (
          <p className="mt-1 text-sm text-red-700">{state.errors.member_id}</p>
        ) : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor={`division-${formId}`} className="mb-1 block text-sm font-medium">
            Divisi
          </label>
          <select
            id={`division-${formId}`}
            name="division_id"
            defaultValue={value("division_id")}
            className="block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"
          >
            <option value="">Tanpa divisi</option>
            {divisions.map((division) => (
              <option key={division.id} value={division.id}>{division.name}</option>
            ))}
          </select>
          {state.errors?.division_id ? (
            <p className="mt-1 text-sm text-red-700">{state.errors.division_id}</p>
          ) : null}
          {assignment?.division && !assignment?.division_id ? (
            <p className="mt-1 text-xs text-zinc-500">
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
        />
      </div>

      <TextField
        id={`responsibility-${formId}`}
        name="responsibility"
        label="Tanggung jawab"
        multiline
        defaultValue={value("responsibility")}
        error={state.errors?.responsibility}
      />

      <Button type="submit" pending={pending} pendingText="Menyimpan…">
        {assignment ? "Simpan perubahan" : "Tambahkan ke panitia"}
      </Button>
    </form>
  );
}
