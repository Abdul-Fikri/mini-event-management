"use client";

import Link from "next/link";
import { useState } from "react";
import { deleteTask } from "@/actions/tasks";
import { ConfirmDeleteButton } from "@/components/ui/ConfirmDeleteButton";
import TaskForm from "@/components/events/TaskForm";
import ListPagination from "@/components/ui/ListPagination";

const PAGE_SIZE = 5;
const dateFmt = new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeZone: "Asia/Jakarta" });
const statusLabel = { todo: "Belum dikerjakan", in_progress: "Sedang dikerjakan", done: "Selesai", blocked: "Terhambat" };
const priorityLabel = { low: "Rendah", medium: "Sedang", high: "Tinggi" };

export default function TaskSection({ eventId, tasks, members, standalone = false }) {
  const [page, setPage] = useState(1);
  const memberById = new Map(members.map((member) => [member.id, member]));
  const counts = { todo: 0, in_progress: 0, done: 0, blocked: 0 };
  tasks.forEach((task) => { counts[task.status] = (counts[task.status] ?? 0) + 1; });
  const totalPages = Math.max(1, Math.ceil(tasks.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const visibleTasks = tasks.slice(startIndex, startIndex + PAGE_SIZE);
  const basePath = `/events/${eventId}/tugas`;
  const returnTo = standalone ? `${basePath}/all` : basePath;

  return (
    <section className="space-y-4 rounded-lg border border-zinc-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          {standalone ? <Link href={basePath} className="text-sm font-medium text-indigo-700 hover:underline">← Kembali ke Tugas</Link> : null}
          <h2 className={standalone ? "mt-2 text-xl font-semibold" : "text-lg font-semibold"}>{standalone ? "Semua tugas event" : "Manajemen tugas"}</h2>
          <p className="text-sm text-zinc-600">Bagikan pekerjaan kepada panitia, tentukan prioritas, dan pantau progresnya.</p>
        </div>
        {!standalone && tasks.length > 0 ? (
          <Link href={`${basePath}/all`} className="shrink-0 rounded-md border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-800 hover:bg-indigo-100">Lihat semua tugas</Link>
        ) : null}
      </div>

      {!standalone ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {Object.entries(statusLabel).map(([key, label]) => (
            <div key={key} className="rounded-md bg-zinc-50 p-3">
              <p className="text-xs text-zinc-500">{label}</p>
              <p className="mt-1 text-xl font-semibold tabular-nums">{counts[key]}</p>
            </div>
          ))}
        </div>
      ) : null}

      {tasks.length ? (
        <>
          <p className="text-xs text-zinc-500" aria-live="polite">
            Menampilkan {startIndex + 1}–{Math.min(startIndex + PAGE_SIZE, tasks.length)} dari {tasks.length} tugas.
          </p>
          <div className="space-y-3">
            {visibleTasks.map((task) => (
              <article key={task.id} className="rounded-lg border border-zinc-200 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold">{task.title}</h3>
                    <p className="mt-1 text-sm text-zinc-600">{statusLabel[task.status]} · Prioritas {priorityLabel[task.priority]}</p>
                    <p className="mt-1 text-sm text-zinc-600">PIC: {memberById.get(task.assigned_to)?.full_name ?? "Belum ditentukan"} · Deadline: {task.due_date ? dateFmt.format(new Date(task.due_date + "T00:00:00")) : "—"}</p>
                    {task.description ? <p className="mt-2 whitespace-pre-wrap text-sm">{task.description}</p> : null}
                    {task.notes ? <p className="mt-2 whitespace-pre-wrap text-xs text-zinc-500">Catatan: {task.notes}</p> : null}
                  </div>
                  <form action={deleteTask}>
                    <input type="hidden" name="event_id" value={eventId} />
                    <input type="hidden" name="return_to" value={returnTo} />
                    <input type="hidden" name="task_id" value={task.id} />
                    <ConfirmDeleteButton message={`Hapus tugas "${task.title}"?`}>Hapus</ConfirmDeleteButton>
                  </form>
                </div>
                <details className="mt-3">
                  <summary className="cursor-pointer text-sm font-medium text-indigo-700">Edit tugas / perbarui status</summary>
                  <div className="mt-3"><TaskForm eventId={eventId} members={members} task={task} returnTo={returnTo} /></div>
                </details>
              </article>
            ))}
          </div>
          <ListPagination currentPage={currentPage} totalPages={totalPages} onPageChange={setPage} />
        </>
      ) : (
        <p className="rounded-md border border-dashed border-zinc-300 p-4 text-center text-sm text-zinc-600">Belum ada tugas untuk event ini.</p>
      )}

      {!standalone ? (
        <div className="border-t border-zinc-100 pt-4">
          <h3 className="mb-3 font-medium">Tambah tugas</h3>
          <TaskForm eventId={eventId} members={members} returnTo={returnTo} />
        </div>
      ) : null}
    </section>
  );
}
