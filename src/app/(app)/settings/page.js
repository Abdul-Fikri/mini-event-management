import { requireGroup } from "@/lib/auth";
import GroupLogoForm from "@/components/settings/GroupLogoForm";

export const metadata = { title: "Pengaturan Grup" };

export default async function SettingsPage() {
  const { group } = await requireGroup();
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Pengaturan grup</h1>
        <p className="mt-1 text-sm text-zinc-600">Kelola identitas visual grup event Anda.</p>
      </div>
      <section className="management-panel p-5">
        <h2 className="font-semibold">{group.name}</h2>
        <p className="mt-1 text-sm text-zinc-600">{group.description || "Belum ada deskripsi grup."}</p>
      </section>
      <GroupLogoForm
        logoUrl={group.logo_url}
        groupName={group.name}
        groupId={group.id}
      />
    </div>
  );
}
