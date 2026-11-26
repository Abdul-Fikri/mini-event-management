"use client";

import { useActionState, useEffect, useState } from "react";
import { saveProcurementItem } from "@/actions/procurement";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { MoneyField } from "@/components/ui/MoneyField";

const initial = { message: "", errors: {}, values: {} };
const selectClass =
  "block w-full rounded-xl border border-[#D8E3ED] bg-white px-3.5 py-2.5 text-sm text-[#1E293B] focus:border-[#8FB0CE] focus:outline-none focus:ring-2 focus:ring-[#8FB0CE]/20";

export default function ProcurementForm({
  eventId,
  members,
  categories,
  item = null,
  returnTo = `/events/${eventId}/pengadaan`,
}) {
  const [state, action, pending] = useActionState(
    saveProcurementItem.bind(null, eventId, item?.id ?? null),
    initial,
  );
  const value = (key) => state.values?.[key] ?? item?.[key] ?? "";
  const [type, setType] = useState(value("procurement_type") || "purchase");
  const [status, setStatus] = useState(value("status") || "not_started");
  const isPurchase = type === "purchase";
  const isBorrow = type === "borrow";
  const statusOptions = isPurchase
    ? [
        ["not_started", "Belum dimulai"],
        ["requested", "Diminta"],
        ["ordered", "Dipesan"],
        ["purchased", "Sudah dibeli"],
        ["ready", "Siap digunakan"],
        ["not_needed", "Tidak diperlukan"],
      ]
    : [
        ["not_started", "Belum dimulai"],
        ["requested", isBorrow ? "Menunggu peminjaman" : "Diminta"],
        ["ready", isBorrow ? "Sedang dipinjam" : "Siap digunakan"],
        ["not_needed", "Tidak diperlukan"],
      ];
  const typeLabel = isPurchase
    ? "Pembelian"
    : isBorrow
      ? "Peminjaman"
      : "Inventaris";
  const supplierLabel = isPurchase
    ? "Supplier / toko"
    : isBorrow
      ? "Pemilik / pemberi pinjaman"
      : "Sumber inventaris";
  const defaultPurchaseDate = value("purchased_date") || "";

  // Server Action returns submitted values on validation/business-rule errors.
  // Sync the controlled selectors and remount uncontrolled fields with those
  // returned values so an error never leaves the modal showing stale/empty data.
  useEffect(() => {
    const submitted = state.values;
    if (!submitted || Object.keys(submitted).length === 0) return;
    if (submitted.procurement_type) setType(submitted.procurement_type);
    if (submitted.status) setStatus(submitted.status);
  }, [state.values]);

  // TextField and MoneyField use defaultValue. Changing this key after an
  // ActionState response reapplies the returned draft values to those inputs.
  const formDraftKey = JSON.stringify(state.values ?? {});

  return (
    <form
      key={formDraftKey}
      action={action}
      className="management-form space-y-3 p-4"
    >
      <input type="hidden" name="return_to" value={returnTo} />
      {state.message ? <Alert>{state.message}</Alert> : null}

      <div>
        <label
          htmlFor={"proc-type-" + (item?.id ?? "new")}
          className="mb-1.5 block text-sm font-medium text-slate-700"
        >
          Jenis pengadaan <span className="text-red-600">*</span>
        </label>
        <select
          id={"proc-type-" + (item?.id ?? "new")}
          name="procurement_type"
          value={type}
          onChange={(event) => {
            const next = event.target.value;
            setType(next);
            if (next !== "purchase" && ["ordered", "purchased"].includes(status)) {
              setStatus("requested");
            }
          }}
          className={selectClass}
        >
          <option value="purchase">Pembelian</option>
          <option value="borrow">Peminjaman</option>
          <option value="inventory">Inventaris tersedia</option>
        </select>
        <p className="mt-1 text-xs text-zinc-500">
          {isPurchase
            ? "Pembelian dapat menjadi komitmen dan pengeluaran Keuangan."
            : isBorrow
              ? "Barang dipinjam; tidak membuat transaksi Keuangan dan dapat ditandai sudah dikembalikan."
              : "Barang sudah tersedia; tidak membuat transaksi Keuangan."}
        </p>
      </div>

      <TextField
        id={"proc-name-" + (item?.id ?? "new")}
        name="name"
        label="Nama barang / kebutuhan"
        defaultValue={value("name")}
        error={state.errors?.name}
        required
      />
      <TextField
        id={"proc-spec-" + (item?.id ?? "new")}
        name="specification"
        label="Spesifikasi"
        defaultValue={value("specification")}
        error={state.errors?.specification}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <TextField
          id={"proc-qty-" + (item?.id ?? "new")}
          name="quantity"
          label="Jumlah"
          type="number"
          min="0.01"
          step="0.01"
          defaultValue={value("quantity") || "1"}
          error={state.errors?.quantity}
          required
        />
        <TextField
          id={"proc-unit-" + (item?.id ?? "new")}
          name="unit"
          label="Satuan"
          hint="Contoh: pcs, kotak, meter, paket"
          defaultValue={value("unit")}
          error={state.errors?.unit}
        />
      </div>

      {/* Keep purchase-only controls mounted while hidden. This retains their
          unsaved values when the Owner switches to Borrow/Inventory and back. */}
      <div hidden={!isPurchase} className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <MoneyField
            id={"proc-est-" + (item?.id ?? "new")}
            name="est_unit_price"
            label="Estimasi harga satuan (Rp)"
            defaultValue={value("est_unit_price")}
            hint="Dipakai menghitung komitmen saat status Dipesan."
            error={state.errors?.est_unit_price}
          />
          <MoneyField
            id={"proc-actual-" + (item?.id ?? "new")}
            name="actual_unit_price"
            label="Harga aktual satuan (Rp)"
            defaultValue={value("actual_unit_price")}
            hint="Wajib lebih dari Rp0 saat sudah dibeli/siap digunakan."
            error={state.errors?.actual_unit_price}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label
              htmlFor={"proc-category-" + (item?.id ?? "new")}
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Kategori anggaran
            </label>
            <select
              id={"proc-category-" + (item?.id ?? "new")}
              name="category_id"
              defaultValue={value("category_id")}
              className={selectClass}
            >
              <option value="">Tanpa kategori</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {state.errors?.category_id ? (
              <p className="mt-1 text-sm text-red-700">
                {state.errors.category_id}
              </p>
            ) : null}
          </div>
          <TextField
            id={"proc-date-" + (item?.id ?? "new")}
            name="purchased_date"
            label="Tanggal pembelian"
            type="date"
            defaultValue={defaultPurchaseDate}
            hint="Untuk pembelian baru, tanggal kosong memakai hari ini (WIB). Data lama perlu tanggal sebenarnya sebelum disinkronkan."
            error={state.errors?.purchased_date}
          />
        </div>
      </div>

      {/* Keep the planned return date mounted too, so changing between types
          does not discard an already-entered date from this unsaved draft. */}
      <div hidden={!isBorrow}>
        <TextField
          id={"proc-return-date-" + (item?.id ?? "new")}
          name="expected_return_date"
          label="Tanggal rencana pengembalian"
          type="date"
          defaultValue={value("expected_return_date")}
          hint="Opsional. Bisa diisi agar jadwal pengembalian barang mudah dipantau."
          error={state.errors?.expected_return_date}
        />
      </div>

      {!isPurchase ? (
        <div className="rounded-xl border border-[#D7E5F1] bg-[#F8FAFC] p-3 text-sm text-slate-600">
          Jenis {typeLabel.toLowerCase()} tidak memerlukan harga dan tidak akan
          dicatat sebagai pengeluaran di Keuangan.
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label
            htmlFor={"proc-pic-" + (item?.id ?? "new")}
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            PIC
          </label>
          <select
            id={"proc-pic-" + (item?.id ?? "new")}
            name="pic_member_id"
            defaultValue={value("pic_member_id")}
            className={selectClass}
          >
            <option value="">Belum ditentukan</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.full_name}
              </option>
            ))}
          </select>
          {state.errors?.pic_member_id ? (
            <p className="mt-1 text-sm text-red-700">
              {state.errors.pic_member_id}
            </p>
          ) : null}
        </div>
        <div>
          <label
            htmlFor={"proc-status-" + (item?.id ?? "new")}
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Status pengadaan
          </label>
          <select
            id={"proc-status-" + (item?.id ?? "new")}
            name="status"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className={selectClass}
          >
            {statusOptions.map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-zinc-500">
            {isPurchase
              ? "Dipesan menjadi komitmen; Sudah dibeli/Siap digunakan dicatat sebagai pengeluaran."
              : isBorrow
                ? "Status Siap digunakan berarti barang sedang dipinjam; tandai pengembalian pada kartu item."
                : "Inventaris tidak membuat komitmen atau transaksi Keuangan."}
          </p>
          {state.errors?.status ? (
            <p className="mt-1 text-sm text-red-700">{state.errors.status}</p>
          ) : null}
        </div>
      </div>

      <TextField
        id={"proc-supplier-" + (item?.id ?? "new")}
        name="supplier"
        label={supplierLabel}
        defaultValue={value("supplier")}
        error={state.errors?.supplier}
      />
      <TextField
        id={"proc-notes-" + (item?.id ?? "new")}
        name="notes"
        label="Catatan"
        multiline
        defaultValue={value("notes")}
        error={state.errors?.notes}
      />
      <Button type="submit" pending={pending} pendingText="Menyimpan…">
        {item ? "Simpan perubahan" : "Tambah kebutuhan"}
      </Button>
    </form>
  );
}
