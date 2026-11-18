import { requireGroup } from "@/lib/auth";
import MysqlEventsPanel from "@/components/events/MysqlEventsPanel";

export const dynamic = "force-dynamic";
export const metadata = { title: "Integrasi MySQL" };

export default async function MysqlIntegrationPage() {
  await requireGroup();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-zinc-500">Demo integrasi Docker</p>
        <h1 className="text-2xl font-semibold">Integrasi PHP ↔ MySQL ↔ Next.js</h1>
        <p className="mt-1 max-w-2xl text-sm text-zinc-600">
          Halaman demonstrasi ini membaca data dari tabel MySQL bersama yang juga digunakan aplikasi PHP.
          Data demo dipisahkan dari modul Event Management utama.
        </p>
      </div>
      <MysqlEventsPanel />
    </div>
  );
}
