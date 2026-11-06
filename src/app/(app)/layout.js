import { requireGroup } from "@/lib/auth";
import AppShell from "@/components/layout/AppShell";

export default async function AppLayout({ children }) {
  // Layout dan halaman dirender paralel, jadi setiap halaman tetap
  // memanggil requireGroup() sendiri; ini hanya untuk header/menu.
  const { owner, group } = await requireGroup();

  return (
    <AppShell owner={owner} group={group}>
      {children}
    </AppShell>
  );
}
