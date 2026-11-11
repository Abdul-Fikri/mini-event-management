"use client";

import { useActionState, useState } from "react";
import { saveEvent } from "@/actions/events";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { MoneyField } from "@/components/ui/MoneyField";
import { getTodayJakartaDate } from "@/lib/dates";
import {
  EVENT_STATUS_OPTIONS,
  EVENT_STATUS_LABELS,
  getEffectiveEventStatus,
} from "@/lib/events/status";

const initial = { ok: false, message: "", errors: {}, values: {} };

export default function EventForm({ event = null, members = [] }) {
  const [state, formAction, pending] = useActionState(
    saveEvent.bind(null, event?.id ?? null),
    initial,
  );
  const today = getTodayJakartaDate();
  const value = (key) => state.values?.[key] ?? event?.[key] ?? "";

  const [statusMode, setStatusMode] = useState(
    value("status_mode") || "automatic",
  );
  const [manualStatus, setManualStatus] = useState(
    state.values?.status ||
      (event?.status_mode === "manual"
        ? event.status
        : getEffectiveEventStatus({ ...event, status_mode: "automatic" }, today)),
  );
  const [startDate, setStartDate] = useState(value("start_date"));
  const [endDate, setEndDate] = useState(value("end_date"));
  const [planningStartDate, setPlanningStartDate] = useState(
    value("planning_start_date"),
  );
  const [preparationStartDate, setPreparationStartDate] = useState(
    value("preparation_start_date"),
  );
  const [evaluationEndDate, setEvaluationEndDate] = useState(
    value("evaluation_end_date"),
  );

  const previewStatus = getEffectiveEventStatus(
    {
      status_mode: "automatic",
      start_date: startDate,
      end_date: endDate,
      planning_start_date: planningStartDate,
      preparation_start_date: preparationStartDate,
      evaluation_end_date: evaluationEndDate,
    },
    today,
  );

  const startDateMin =
    event?.start_date && event.start_date < today ? event.start_date : today;
  const endDateMin =
    event?.end_date && event.end_date < today && endDate === event.end_date
      ? event.end_date
      : startDate && startDate > today
        ? startDate
        : today;

  function handleStatusModeChange(nextMode) {
    if (nextMode === "manual" && statusMode !== "manual") {
      setManualStatus(previewStatus);
    }
    setStatusMode(nextMode);
  }

  return (
    <form action={formAction} className="space-y-5">
      {state.message ? <Alert>{state.message}</Alert> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          id="name"
          name="name"
          label="Nama event"
          required
          defaultValue={value("name")}
          error={state.errors?.name}
        />
        <TextField
          id="category"
          name="category"
          label="Kategori"
          defaultValue={value("category")}
          error={state.errors?.category}
        />
        <TextField
          id="start_date"
          name="start_date"
          label="Tanggal mulai event"
          type="date"
          min={startDateMin}
          required
          defaultValue={value("start_date")}
          onChange={(event) => setStartDate(event.target.value)}
          error={state.errors?.start_date}
          hint={
            event?.start_date && event.start_date < today
              ? "Tanggal lama boleh dipertahankan. Jika diubah, pilih hari ini atau setelahnya."
              : "Pilih hari ini atau tanggal setelahnya."
          }
        />
        <TextField
          id="end_date"
          name="end_date"
          label="Tanggal selesai event"
          type="date"
          min={endDateMin}
          defaultValue={value("end_date")}
          onChange={(event) => setEndDate(event.target.value)}
          error={state.errors?.end_date}
          hint={
            event?.end_date && event.end_date < today
              ? "Tanggal selesai lama boleh dipertahankan. Jika diubah, pilih hari ini atau setelahnya."
              : "Opsional. Jika diisi, tanggal tidak boleh sebelum tanggal mulai."
          }
        />
      </div>

      <section className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
        <div>
          <h2 className="font-semibold">Timeline dan status event</h2>
          <p className="mt-1 text-sm text-zinc-600">
            Pilih status otomatis agar fase event mengikuti tanggal, atau pilih
            manual jika ingin menentukan status sendiri.
          </p>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="status_mode" className="mb-1 block text-sm font-medium">
              Mode status
            </label>
            <select
              id="status_mode"
              name="status_mode"
              value={statusMode}
              onChange={(event) => handleStatusModeChange(event.target.value)}
              className="block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"
            >
              <option value="automatic">Otomatis mengikuti timeline</option>
              <option value="manual">Manual</option>
            </select>
          </div>

          {statusMode === "manual" ? (
            <div>
              <label htmlFor="status" className="mb-1 block text-sm font-medium">
                Status manual
              </label>
              <select
                id="status"
                name="status"
                value={manualStatus}
                onChange={(event) => setManualStatus(event.target.value)}
                className="block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"
              >
                {EVENT_STATUS_OPTIONS.map(([status, label]) => (
                  <option key={status} value={status}>
                    {label}
                  </option>
                ))}
              </select>
              {state.errors?.status ? (
                <p className="mt-1 text-sm text-red-700">{state.errors.status}</p>
              ) : null}
            </div>
          ) : (
            <div className="rounded-md border border-indigo-100 bg-white p-3">
              <input type="hidden" name="status" value={previewStatus} />
              <p className="text-xs text-zinc-500">Status berdasarkan tanggal hari ini</p>
              <p className="mt-1 font-semibold text-indigo-800">
                {EVENT_STATUS_LABELS[previewStatus]}
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                Status akan dihitung ulang di server setiap halaman memuat data.
              </p>
            </div>
          )}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <TextField
            id="planning_start_date"
            name="planning_start_date"
            label="Mulai perencanaan"
            type="date"
            defaultValue={value("planning_start_date")}
            onChange={(event) => setPlanningStartDate(event.target.value)}
            error={state.errors?.planning_start_date}
            hint="Opsional. Kosongkan bersama tanggal persiapan jika tidak ingin memakai fase ini."
          />
          <TextField
            id="preparation_start_date"
            name="preparation_start_date"
            label="Mulai persiapan"
            type="date"
            defaultValue={value("preparation_start_date")}
            onChange={(event) => setPreparationStartDate(event.target.value)}
            error={state.errors?.preparation_start_date}
            hint="Opsional. Harus setelah perencanaan dan sebelum tanggal mulai event."
          />
          <TextField
            id="evaluation_end_date"
            name="evaluation_end_date"
            label="Akhir masa evaluasi"
            type="date"
            defaultValue={value("evaluation_end_date")}
            onChange={(event) => setEvaluationEndDate(event.target.value)}
            error={state.errors?.evaluation_end_date}
            hint="Opsional. Jika diisi, status menjadi Evaluasi setelah event selesai sampai tanggal ini."
          />
        </div>

        {statusMode === "automatic" ? (
          <p className="mt-3 rounded-md bg-white p-3 text-sm text-zinc-700">
            Pratinjau: status saat ini akan menjadi{" "}
            <strong>{EVENT_STATUS_LABELS[previewStatus]}</strong>. Tanpa tanggal
            perencanaan/persiapan, event tetap berstatus Direncanakan sampai
            tanggal mulai.
          </p>
        ) : (
          <p className="mt-3 text-xs text-zinc-500">
            Mode manual tidak mengubah status berdasarkan tanggal. Kamu dapat
            menggantinya kapan saja dari halaman edit event.
          </p>
        )}
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          id="location"
          name="location"
          label="Lokasi"
          defaultValue={value("location")}
          error={state.errors?.location}
        />
        <div>
          <label
            htmlFor="coordinator_id"
            className="mb-1 block text-sm font-medium"
          >
            Koordinator (opsional)
          </label>
          <select
            id="coordinator_id"
            name="coordinator_id"
            defaultValue={value("coordinator_id")}
            className="block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"
          >
            <option value="">Belum ditentukan</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.full_name}
              </option>
            ))}
          </select>
          {state.errors?.coordinator_id ? (
            <p className="mt-1 text-sm text-red-700">
              {state.errors.coordinator_id}
            </p>
          ) : null}
        </div>
        <MoneyField
          id="target_budget"
          name="target_budget"
          label="Target anggaran (Rp)"
          defaultValue={value("target_budget")}
          hint="Pemisah ribuan ditambahkan otomatis, contoh: 500.000."
          error={state.errors?.target_budget}
        />
      </div>

      <TextField
        id="description"
        name="description"
        label="Deskripsi"
        multiline
        defaultValue={value("description")}
        error={state.errors?.description}
      />

      <div className="flex flex-wrap gap-2">
        <Button type="submit" pending={pending} pendingText="Menyimpan…">
          Simpan event
        </Button>
        <a
          href={event ? `/events/${event.id}` : "/events"}
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm"
        >
          Batal
        </a>
      </div>
    </form>
  );
}
