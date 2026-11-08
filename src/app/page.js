import { redirect } from "next/navigation";

// Halaman utama hanya mengalihkan. Pengguna belum login sudah dialihkan
// ke /login oleh proxy.js; halaman /dashboard memeriksa ulang sesi dan grup.
export default function Home() {
  redirect("/dashboard");
}
