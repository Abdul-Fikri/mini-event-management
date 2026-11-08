import { requireGroup } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const exports = {
  members: {
    filename: "anggota-panitia",
    headers: ["Nama", "Kontak"],
    map: row => [row.full_name, row.contact],
    query: (db, eventId, groupId) => db.from("members").select("full_name,contact").eq("group_id", groupId).order("full_name"),
    eventScoped: false,
  },
  committee: {
    filename: "susunan-panitia",
    headers: ["Nama anggota", "Kontak", "Divisi", "Jabatan", "Tanggung jawab"],
    map: row => [row.member?.full_name, row.member?.contact, row.division, row.position_title, row.responsibility],
    query: (db, eventId, groupId) => db.from("event_members").select("division,position_title,responsibility,member:members(full_name,contact)").eq("event_id", eventId).eq("group_id", groupId).order("created_at"),
  },
  schedule: {
    filename: "rundown",
    headers: ["Tanggal", "Waktu mulai", "Waktu selesai", "Agenda", "Lokasi", "PIC", "Catatan", "Urutan"],
    map: row => [row.item_date, row.start_time, row.end_time, row.title, row.location, row.pic?.full_name, row.notes, row.sort_order],
    query: (db, eventId, groupId) => db.from("schedule_items").select("item_date,start_time,end_time,title,location,notes,sort_order,pic:members!schedule_items_pic_member_id_fkey(full_name)").eq("event_id", eventId).eq("group_id", groupId).order("item_date").order("start_time").order("sort_order"),
  },
  tasks: {
    filename: "daftar-tugas",
    headers: ["Tugas", "Deskripsi", "PIC", "Deadline", "Prioritas", "Status", "Catatan"],
    map: row => [row.title, row.description, row.assignee?.full_name, row.due_date, row.priority, row.status, row.notes],
    query: (db, eventId, groupId) => db.from("tasks").select("title,description,due_date,priority,status,notes,assignee:members!tasks_assigned_to_fkey(full_name)").eq("event_id", eventId).eq("group_id", groupId).order("due_date").order("created_at"),
  },
  procurement: {
    filename: "pengadaan",
    headers: ["Nama kebutuhan", "Spesifikasi", "Jumlah", "Satuan", "Estimasi harga satuan", "Harga aktual satuan", "PIC", "Status", "Supplier", "Catatan"],
    map: row => [row.name, row.specification, row.quantity, row.unit, row.est_unit_price, row.actual_unit_price, row.pic?.full_name, row.status, row.supplier, row.notes],
    query: (db, eventId, groupId) => db.from("procurement_items").select("name,specification,quantity,unit,est_unit_price,actual_unit_price,status,supplier,notes,pic:members!procurement_items_pic_member_id_fkey(full_name)").eq("event_id", eventId).eq("group_id", groupId).order("created_at"),
  },
  finance: {
    filename: "transaksi-keuangan",
    headers: ["Jenis", "Tanggal", "Deskripsi", "Nominal", "Kategori", "Dicatat oleh", "Referensi"],
    map: row => [row.type === "income" ? "Pemasukan" : "Pengeluaran", row.trx_date, row.description, row.amount, row.category?.name, row.recorder?.full_name, row.reference],
    query: (db, eventId, groupId) => db.from("transactions").select("type,trx_date,description,amount,reference,category:budget_categories(name),recorder:members!transactions_recorded_by_fkey(full_name)").eq("event_id", eventId).eq("group_id", groupId).order("trx_date", { ascending: false }).order("created_at", { ascending: false }),
  },
};

function csvCell(value) {
  let text = value == null ? "" : String(value);
  if (/^[\\s]*[=+@]/.test(text) || /^[\\s]*-/.test(text)) text = "'" + text;
  return '"' + text.replace(/"/g, '""') + '"';
}

function safeFilename(value) {
  return String(value || "event").normalize("NFKD").replace(/[\\u0300-\\u036f]/g, "").replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "event";
}

export async function GET(_request, { params }) {
  const { id, type } = await params;
  const config = exports[type];
  if (!config) return new Response("Jenis ekspor tidak ditemukan.", { status: 404 });

  const { group } = await requireGroup();
  const supabase = await createClient();
  const { data: event, error: eventError } = await supabase.from("events").select("id,name").eq("id", id).eq("group_id", group.id).maybeSingle();
  if (eventError || !event) return new Response("Event tidak ditemukan.", { status: 404 });

  const { data, error } = await config.query(supabase, id, group.id);
  if (error) {
    console.error("[event-csv-export]", type, error.code, error.message);
    return new Response("Data gagal diekspor.", { status: 500 });
  }

  const rows = [config.headers, ...(data ?? []).map(config.map)];
  const csv = "\\uFEFF" + rows.map(row => row.map(csvCell).join(",")).join("\\r\\n");
  const filename = safeFilename(event.name) + "-" + config.filename + ".csv";
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="' + filename + '"',
      "Cache-Control": "private, no-store",
    },
  });
}
