"use client";

import Link from "next/link";
import { useState } from "react";
import { deleteTask } from "@/actions/tasks";
import { ConfirmDeleteButton } from "@/components/ui/ConfirmDeleteButton";
import TaskForm from "@/components/events/TaskForm";
import ListPagination from "@/components/ui/ListPagination";
import Modal from "@/components/ui/Modal";

const PAGE_SIZE = 5;
const dateFmt = new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeZone: "Asia/Jakarta" });
const statusLabel = { todo: "Belum dikerjakan", in_progress: "Sedang dikerjakan", done: "Selesai", blocked: "Terhambat" };
const priorityLabel = { low: "Rendah", medium: "Sedang", high: "Tinggi" };

export default function TaskSection({ eventId, tasks, members }) {
  const [page, setPage] = useState(1);
  const [activeTask, setActiveTask] = useState(null);
  const memberById = new Map(members.map((member) => [member.id, member]));
  const counts = { todo: 0, in_progress: 0, done: 0, blocked: 0 };
  tasks.forEach((task) => { counts[task.status] = (counts[task.status] ?? 0) + 1; });
  const totalPages = Math.max(1, Math.ceil(tasks.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const visibleTasks = tasks.slice(startIndex, startIndex + PAGE_SIZE);
  const basePath = `/events/${eventId}/tugas`;
  const returnTo = `${basePath}/all`;

  return (
    <section className="management-panel space-y-5 p-5 sm:p-6">
      <div>
        <Link href={basePath} className="management-link text-sm hover:underline">← Kembali ke Kanban Tugas</Link>
        <h2 className="mt-2 text-xl font-semibold">Detail seluruh tugas</h2>
        <p className="text-sm text-zinc-600">Daftar lengkap, detail, dan pengelolaan tugas event. Maksimal lima tugas ditampilkan pada setiap halaman.</p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {Object.entries(statusLabel).map(([key, label]) => (
          <div key={key} className="management-stat p-3">
            <p className="text-xs text-zinc-500">{label}</p>
            <p className="mt-1 text-xl font-semibold tabular-nums">{counts[key]}</p>
          </div>
        ))}
      </div>

      {tasks.length ? (
        <>
          <p className="text-xs text-zinc-500" aria-live="polite">
            Menampilkan {startIndex + 1}–{Math.min(startIndex + PAGE_SIZE, tasks.length)} dari {tasks.length} tugas.
          </p>
          <div className="space-y-3">
            {visibleTasks.map((task) => (
              <article key={task.id} className="management-card p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold">{task.title}</h3>
                    <p className="mt-1 text-sm text-zinc-600">{statusLabel[task.status]} · Prioritas {priorityLabel[task.priority]}</p>
                    <p className="mt-1 text-sm text-zinc-600">PIC: {memberById.get(task.assigned_to)?.full_name ?? "Belum ditentukan"} · Deadline: {task.due_date ? dateFmt.format(new Date(task.due_date + "T00:00:00")) : "—"}</p>
                    {task.description ? <p className="mt-2 whitespace-pre-wrap text-sm">{task.description}</p> : null}
                    {task.notes ? <p className="mt-2 whitespace-pre-wrap text-xs text-zinc-500">Catatan: {task.notes}</p> : null}
                  </div>
                  <div className="flex shrink-0 items-center gap-2 sm:pl-3">
                    <button
                      type="button"
                      onClick={() => setActiveTask({ mode: "edit", task })}
                      className="inline-flex items-center justify-center rounded-xl border border-[#D7E6F5] bg-white px-3.5 py-2 text-sm font-semibold text-[#407BB0] transition-colors hover:bg-[#F0F5FA] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#407BB0]"
                    >
                      Edit
                    </button>
                    <form action={deleteTask}>
                      <input type="hidden" name="event_id" value={eventId} />
                      <input type="hidden" name="return_to" value={returnTo} />
                      <input type="hidden" name="task_id" value={task.id} />
                      <ConfirmDeleteButton message={`Hapus tugas "${task.title}"?`}>Hapus</ConfirmDeleteButton>
                    </form>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <ListPagination currentPage={currentPage} totalPages={totalPages} onPageChange={setPage} />
        </>
      ) : (
        <p className="management-empty p-5 text-center text-sm text-[#64748B]">Belum ada tugas untuk event ini.</p>
      )}

      <Modal
        open={Boolean(activeTask)}
        onClose={() => setActiveTask(null)}
        title={activeTask?.mode === "edit" ? "Edit tugas" : "Tambah tugas"}
        description={activeTask?.mode === "edit" ? "Perbarui informasi, penanggung jawab, atau status tugas." : "Tambahkan tugas baru dan tentukan penanggung jawabnya."}
      >
        {activeTask ? <TaskForm key={activeTask.mode === "edit" ? activeTask.task.id : "new-task"} eventId={eventId} members={members} task={activeTask.task ?? null} returnTo={returnTo} /> : null}
      </Modal>
    </section>
  );
}
