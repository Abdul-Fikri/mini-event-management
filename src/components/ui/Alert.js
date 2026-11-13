const TONES = {
  error: "border-red-200 bg-red-50 text-red-900",
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
};

export function Alert({ tone = "error", children }) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`rounded-xl border px-4 py-3 text-sm leading-6 ${TONES[tone] || TONES.error}`}
    >
      {children}
    </div>
  );
}
