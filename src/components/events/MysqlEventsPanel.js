"use client";

import { useCallback, useEffect, useState } from "react";

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "long",
  timeZone: "Asia/Jakarta",
});

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : dateFormatter.format(date);
}

export default function MysqlEventsPanel() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/events", { cache: "no-store" });
      const payload = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Sesi login tidak terdeteksi. Silakan login ulang sebagai Owner.");
        }
        throw new Error(payload.error || "Gagal mengambil data event dari MySQL.");
      }

      setEvents(Array.isArray(payload.events) ? payload.events : []);
    } catch (err) {
      setError(err.message || "Terjadi kesalahan saat mengambil data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Data dari MySQL</h2>
          <p className="text-sm text-zinc-600">
            Daftar ini dibaca melalui endpoint GET /api/events.
          </p>
        </div>
        <button
          type="button"
          onClick={loadEvents}
          disabled={loading}
          className="rounded-xl border border-[#D7E5F1] bg-[#EDF4FA] px-4 py-2 text-sm font-semibold text-[#32628E] disabled:opacity-50"
        >
          {loading ? "Memuat..." : "Muat ulang"}
        </button>
      </div>

      {loading ? (
        <div className="management-panel p-6 text-sm text-zinc-500">Mengambil data dari MySQL...</div>
      ) : error ? (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : events.length === 0 ? (
        <div className="management-empty p-8 text-center">
          <h3 className="font-semibold">Belum ada data event di MySQL</h3>
          <p className="mt-1 text-sm text-zinc-600">
            Tambahkan event melalui aplikasi PHP di localhost:8080, lalu muat ulang halaman ini.
          </p>
        </div>
      ) : (
        <>
          <p className="text-xs text-zinc-500" aria-live="polite">
            Menampilkan {events.length} event dari database MySQL yang sama dengan aplikasi PHP.
          </p>
          <div className="grid gap-3">
            {events.map((event) => (
              <article key={event.id} className="management-card p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold">{event.name}</h3>
                    <p className="mt-1 text-sm text-zinc-600">{event.location || "Lokasi belum ditentukan"}</p>
                  </div>
                  <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs">ID #{event.id}</span>
                </div>
                {event.description ? (
                  <p className="mt-3 whitespace-pre-wrap text-sm text-zinc-700">{event.description}</p>
                ) : null}
                <p className="mt-3 text-xs text-zinc-500">Tanggal event: {formatDate(event.event_date)}</p>
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
