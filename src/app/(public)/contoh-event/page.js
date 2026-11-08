import Link from "next/link";

export const dynamic = "force-static";
export const metadata = {
  title: "Contoh Event",
  description:
    "Contoh jenis acara yang dapat dikelola dengan Mini Event Management.",
};

const examples = [
  {
    title: "Seminar dan workshop",
    category: "Edukasi",
    description:
      "Kelola sesi pembicara, rundown, registrasi internal, perlengkapan, dan pembagian tugas panitia.",
    items: ["Sesi materi", "Moderator dan pembicara", "Perlengkapan ruangan"],
  },
  {
    title: "Kompetisi dan turnamen",
    category: "Kompetisi",
    description:
      "Atur jadwal pertandingan, koordinator, kebutuhan teknis, serta progres pekerjaan setiap divisi.",
    items: ["Jadwal pertandingan", "Koordinator divisi", "Kebutuhan teknis"],
  },
  {
    title: "Festival dan acara komunitas",
    category: "Komunitas",
    description:
      "Pantau susunan acara, kebutuhan vendor, pengadaan, dan pencatatan anggaran dalam satu tempat.",
    items: ["Susunan acara", "Vendor dan pengadaan", "Anggaran kegiatan"],
  },
];

export default function PublicEventCatalogPage() {
  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-12 text-zinc-900">
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/" className="font-semibold">
            Mini Event Management
          </Link>
          <Link
            href="/login"
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Masuk ke aplikasi
          </Link>
        </header>

        <section className="mt-14 max-w-2xl">
          <p className="text-sm font-medium text-indigo-700">
            Katalog contoh penggunaan
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Kelola berbagai jenis acara dengan lebih terstruktur
          </h1>
          <p className="mt-3 text-zinc-600">
            Berikut beberapa contoh kegiatan yang dapat direncanakan dan
            dikelola menggunakan Mini Event Management.
          </p>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          {examples.map((example) => (
            <article
              key={example.title}
              className="rounded-xl border border-zinc-200 bg-white p-5"
            >
              <span className="text-xs font-medium uppercase tracking-wide text-indigo-700">
                {example.category}
              </span>
              <h2 className="mt-2 text-lg font-semibold">{example.title}</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-600">
                {example.description}
              </p>
              <ul className="mt-4 space-y-2 border-t border-zinc-100 pt-4">
                {example.items.map((item) => (
                  <li key={item} className="text-sm text-zinc-700">
                    <span className="mr-2 text-indigo-600">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </section>

        <footer className="mt-10 border-t border-zinc-200 pt-5 text-sm text-zinc-500">
          Katalog ini bersifat publik dan tidak menampilkan data event maupun
          informasi privat milik pengguna.
        </footer>
      </div>
    </main>
  );
}
