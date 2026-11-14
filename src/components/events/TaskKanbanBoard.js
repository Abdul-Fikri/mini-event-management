"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  CircleDashed,
  Clock3,
  GripVertical,
  LoaderCircle,
  UserRound,
} from "lucide-react";
import { deleteTask, updateTaskStatus } from "@/actions/tasks";
import TaskForm from "@/components/events/TaskForm";
import { ConfirmDeleteButton } from "@/components/ui/ConfirmDeleteButton";
import { Button } from "@/components/ui/Button";

const dateFmt = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeZone: "Asia/Jakarta",
});

const STATUSES = [
  {
    key: "todo",
    label: "Belum dikerjakan",
    icon: CircleDashed,
    column: "border-slate-200 bg-slate-50",
    heading: "bg-slate-100 text-slate-800",
    count: "bg-slate-200 text-slate-700",
    accent: "border-l-slate-400",
  },
  {
    key: "in_progress",
    label: "Sedang dikerjakan",
    icon: Clock3,
    column: "border-blue-200 bg-blue-50/60",
    heading: "bg-blue-100 text-blue-800",
    count: "bg-blue-200 text-blue-800",
    accent: "border-l-blue-500",
  },
  {
    key: "done",
    label: "Selesai",
    icon: CheckCircle2,
    column: "border-emerald-200 bg-emerald-50/60",
    heading: "bg-emerald-100 text-emerald-800",
    count: "bg-emerald-200 text-emerald-800",
    accent: "border-l-emerald-500",
  },
  {
    key: "blocked",
    label: "Terhambat",
    icon: AlertTriangle,
    column: "border-rose-200 bg-rose-50/60",
    heading: "bg-rose-100 text-rose-800",
    count: "bg-rose-200 text-rose-800",
    accent: "border-l-rose-500",
  },
];

const PRIORITIES = {
  low: { label: "Rendah", className: "bg-slate-100 text-slate-700" },
  medium: { label: "Sedang", className: "bg-amber-100 text-amber-800" },
  high: { label: "Tinggi", className: "bg-rose-100 text-rose-800" },
};

export default function TaskKanbanBoard({ eventId, tasks, members }) {
  const [boardTasks, setBoardTasks] = useState(tasks);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [dropTargetStatus, setDropTargetStatus] = useState(null);
  const [pendingTaskIds, setPendingTaskIds] = useState(() => new Set());
  const pendingTaskIdsRef = useRef(new Set());
  const [feedback, setFeedback] = useState("");
  const basePath = `/events/${eventId}/tugas`;

  useEffect(() => {
    setBoardTasks(tasks);
  }, [tasks]);
  const memberById = new Map(members.map((member) => [member.id, member]));

  async function changeTaskStatus(taskId, nextStatus) {
    const task = boardTasks.find((item) => item.id === taskId);
    if (!task || task.status === nextStatus || pendingTaskIdsRef.current.has(taskId)) return;

    // Optimistically move the card before waiting for the Server Action round-trip.
    pendingTaskIdsRef.current.add(taskId);
    setPendingTaskIds(new Set(pendingTaskIdsRef.current));
    setBoardTasks((current) =>
      current.map((item) => item.id === taskId ? { ...item, status: nextStatus } : item)
    );
    setDraggedTaskId(null);
    setDropTargetStatus(null);
    setFeedback("");

    const rollback = () => {
      setBoardTasks((current) =>
        current.map((item) => item.id === taskId ? { ...item, status: task.status } : item)
      );
    };

    try {
      const result = await updateTaskStatus(eventId, taskId, nextStatus);
      if (!result?.success) {
        rollback();
        setFeedback(result?.message || "Status tugas gagal diperbarui. Status dikembalikan.");
      }
    } catch {
      rollback();
      setFeedback("Status tugas gagal diperbarui. Periksa koneksi lalu coba lagi.");
    } finally {
      pendingTaskIdsRef.current.delete(taskId);
      setPendingTaskIds(new Set(pendingTaskIdsRef.current));
    }
  }

  function handleDragStart(event, taskId) {
    if (event.target.closest?.("button, a, select, input, textarea, form")) {
      event.preventDefault();
      return;
    }
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", taskId);
    setDraggedTaskId(taskId);
    setFeedback("");
  }

  function handleDrop(event, status) {
    event.preventDefault();
    const taskId = event.dataTransfer.getData("text/plain") || draggedTaskId;
    setDropTargetStatus(null);
    if (taskId) changeTaskStatus(taskId, status);
  }

  return (
    <section className="management-panel space-y-5 p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Papan Kanban Tugas</h2>
          <p className="mt-1 max-w-2xl text-sm text-zinc-600">
            Pantau progres pekerjaan berdasarkan status. Tarik kartu ke kolom lain untuk memperbarui status tugas.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`${basePath}/all`}
            className="inline-flex items-center rounded-xl border border-[#D7E5F1] bg-[#EDF4FA] px-3.5 py-2.5 text-sm font-semibold text-[#32628E] transition-colors hover:bg-[#E5EFF8]"
          >
            Detail seluruh tugas
          </Link>
          <Button type="button" onClick={() => setShowCreateForm((value) => !value)}>
            {showCreateForm ? "Tutup form" : "+ Tambah tugas"}
          </Button>
        </div>
      </div>

      {feedback ? (
        <p role="status" aria-live="polite" className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {feedback}
        </p>
      ) : null}

      {showCreateForm ? (
        <div className="management-form p-4">
          <h3 className="mb-3 font-semibold text-zinc-900">Tambah tugas baru</h3>
          <TaskForm eventId={eventId} members={members} returnTo={basePath} />
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {STATUSES.map((status) => {
          const Icon = status.icon;
          const statusTasks = boardTasks.filter((task) => task.status === status.key);
          const isDropTarget = dropTargetStatus === status.key;

          return (
            <section
              key={status.key}
              aria-label={status.label}
              onDragOver={(event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect = "move";
                setDropTargetStatus(status.key);
              }}
              onDragLeave={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) setDropTargetStatus(null);
              }}
              onDrop={(event) => handleDrop(event, status.key)}
              className={`min-h-72 rounded-xl border p-3 transition ${status.column} ${isDropTarget ? "ring-2 ring-[#A9C4DC] ring-offset-2" : ""}`}
            >
              <div className={`mb-3 flex items-center justify-between gap-2 rounded-lg px-3 py-2 ${status.heading}`}>
                <div className="flex min-w-0 items-center gap-2">
                  <Icon size={18} strokeWidth={2.3} aria-hidden="true" />
                  <h3 className="truncate text-sm font-semibold">{status.label}</h3>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums ${status.count}`}>
                  {statusTasks.length}
                </span>
              </div>

              <div className="space-y-3">
                {statusTasks.map((task) => {
                  const priority = PRIORITIES[task.priority] || PRIORITIES.medium;
                  const isPending = pendingTaskIds.has(task.id);
                  const isEditing = editingTaskId === task.id;

                  return (
                    <article
                      key={task.id}
                      draggable={!isPending}
                      onDragStart={(event) => handleDragStart(event, task.id)}
                      onDragEnd={() => {
                        setDraggedTaskId(null);
                        setDropTargetStatus(null);
                      }}
                      className={`cursor-grab rounded-lg border border-l-4 border-zinc-200 bg-white p-3 shadow-sm transition hover:shadow-md active:cursor-grabbing ${status.accent} ${draggedTaskId === task.id ? "opacity-50" : ""} ${isPending ? "ring-1 ring-[#A9C4DC]" : ""}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex min-w-0 items-start gap-1.5">
                          <GripVertical className="mt-0.5 shrink-0 text-zinc-400" size={16} aria-hidden="true" />
                          <h4 className="min-w-0 break-words text-sm font-semibold text-zinc-900">{task.title}</h4>
                        </div>
                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${priority.className}`}>
                          {priority.label}
                        </span>
                      </div>

                      {task.description ? (
                        <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-xs leading-5 text-zinc-600">{task.description}</p>
                      ) : null}

                      <div className="mt-3 space-y-1.5 text-xs text-zinc-600">
                        <p className="flex items-center gap-1.5">
                          <UserRound size={13} className="shrink-0" aria-hidden="true" />
                          <span className="truncate">{memberById.get(task.assigned_to)?.full_name ?? "Belum ada PIC"}</span>
                        </p>
                        <p className="flex items-center gap-1.5">
                          <CalendarDays size={13} className="shrink-0" aria-hidden="true" />
                          <span>{task.due_date ? dateFmt.format(new Date(task.due_date + "T00:00:00")) : "Tanpa deadline"}</span>
                        </p>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[#EEF2F6] pt-2">
                        <label className="sr-only" htmlFor={`task-status-${task.id}`}>Ubah status tugas {task.title}</label>
                        <select
                          id={`task-status-${task.id}`}
                          value={task.status}
                          disabled={isPending}
                          onChange={(event) => changeTaskStatus(task.id, event.target.value)}
                          className="min-w-0 max-w-full rounded-xl border border-[#D8E3ED] bg-white px-3 py-2 text-xs text-[#334155] focus:border-[#8FB0CE] focus:outline-none focus:ring-2 focus:ring-[#8FB0CE]/20 disabled:opacity-50"
                        >
                          {STATUSES.map((option) => (
                            <option key={option.key} value={option.key}>{option.label}</option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => setEditingTaskId(isEditing ? null : task.id)}
                          className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#407BB0] transition-colors hover:bg-[#EDF4FA]"
                          aria-expanded={isEditing}
                        >
                          {isEditing ? "Tutup edit" : "Edit"}
                        </button>
                        <form action={deleteTask}>
                          <input type="hidden" name="event_id" value={eventId} />
                          <input type="hidden" name="return_to" value={basePath} />
                          <input type="hidden" name="task_id" value={task.id} />
                          <ConfirmDeleteButton message={`Hapus tugas "${task.title}"?`} />
                        </form>
                      </div>

                      {isPending ? (
                        <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-indigo-700" role="status" aria-live="polite">
                          <LoaderCircle size={13} className="animate-spin" aria-hidden="true" />
                          Menyimpan status…
                        </p>
                      ) : null}
                      {isEditing ? (
                        <div className="mt-3 border-t border-[#EEF2F6] pt-3">
                          <TaskForm eventId={eventId} members={members} task={task} returnTo={basePath} />
                        </div>
                      ) : null}
                    </article>
                  );
                })}

                {statusTasks.length === 0 ? (
                  <p className="management-empty px-3 py-6 text-center text-xs text-[#64748B]">
                    Belum ada tugas di status ini.
                  </p>
                ) : null}
              </div>
            </section>
          );
        })}
      </div>

      <p className="text-xs text-zinc-500">
        {boardTasks.length} tugas · {boardTasks.filter((task) => task.status === "done").length} selesai · Drag kartu untuk memindahkan status, atau gunakan pilihan status pada kartu.
      </p>
    </section>
  );
}
