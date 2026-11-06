export default function AuthLayout({ children }) {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <p className="mb-6 text-center text-lg font-semibold text-zinc-900">
          Mini Event Management
        </p>
        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
