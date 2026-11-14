import Link from "next/link";
import MemberForm from "@/components/members/MemberForm";
export const metadata = { title: "Tambah Anggota" };
export default function NewMemberPage() {
  return <div className="space-y-5"><div><Link href="/members" className="management-link text-sm hover:underline">← Kembali ke anggota</Link><h1 className="mt-2 text-2xl font-semibold">Tambah anggota panitia</h1></div><div className="management-panel p-5 sm:p-6"><MemberForm/></div></div>;
}
