import { redirect } from "next/navigation";
import { logout } from "@/actions/auth";
import { getOwnerGroup, requireOwner } from "@/lib/auth";
import GroupForm from "@/components/groups/GroupForm";
import { Button } from "@/components/ui/Button";

export const metadata = { title: "Buat Grup" };

export default async function OnboardingPage() {
  const owner = await requireOwner();

  // Satu grup per Owner: jika sudah punya, tidak boleh membuat lagi.
  const group = await getOwnerGroup();
  if (group) redirect("/dashboard");

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
          <h1 className="mb-1 text-xl font-semibold">Buat grup Anda</h1>
          <p className="mb-5 text-sm text-zinc-600">
            Grup adalah ruang kerja untuk kelas, panitia, koperasi, atau
            komunitas Anda. Setiap akun hanya dapat memiliki satu grup.
          </p>
          <GroupForm />
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 text-sm text-zinc-600">
          <span className="truncate">Masuk sebagai {owner.email}</span>
          <form action={logout}>
            <Button type="submit" variant="secondary">
              Keluar
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
