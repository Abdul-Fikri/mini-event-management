import Link from "next/link";
import MemberForm from "@/components/members/MemberForm";
export const metadata = { title: "Tambah Anggota" };
export default function NewMemberPage() {
  return <div className="space-y-5"><div><Link href="/members" className="text-sm text-indigo-700">← Kembali ke anggota</Link><h1 className="mt-2 text-2xl font-semibold">Tambah anggota panitia</h1></div><div className="rounded-lg border border-zinc-200 bg-white p-5"><MemberForm/></div></div>;
}
