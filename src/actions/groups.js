"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireOwner } from "@/lib/auth";
import { groupSchema } from "@/lib/validators/group";
import { fieldErrors, readForm } from "@/lib/validators/helpers";

export async function createGroup(prevState, formData) {
  // Wajib login. owner_id selalu diambil dari sesi, TIDAK dari input form.
  const owner = await requireOwner();

  const values = readForm(formData, ["name", "category", "description"]);
  const parsed = groupSchema.safeParse(values);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Periksa kembali isian Anda.",
      errors: fieldErrors(parsed.error),
      values,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("groups").insert({
    owner_id: owner.id,
    name: parsed.data.name,
    category: parsed.data.category,
    description: parsed.data.description,
  });

  if (error) {
    // 23505 = unique_violation pada groups.owner_id: Owner sudah punya grup.
    // Batas "satu grup per Owner" dijaga oleh database, bukan hanya oleh UI.
    if (error.code === "23505") {
      redirect("/dashboard");
    }
    console.error("[createGroup]", error.code, error.message);
    return {
      ok: false,
      message: "Grup gagal dibuat. Silakan coba lagi.",
      errors: {},
      values,
    };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}
