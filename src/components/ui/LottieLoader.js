"use client";

import { Lottie } from "lottie-react";

export default function LottieLoader({ label = "Sedang memuat..." }) {
  return (
    <main
      role="status"
      aria-live="polite"
      aria-label={label}
      className="flex min-h-[60vh] items-center justify-center px-6 py-12"
    >
      <div className="flex flex-col items-center text-center">
        <div className="h-44 w-44 sm:h-52 sm:w-52" aria-hidden="true">
          <Lottie src="/animations/loading.json" autoplay loop className="h-full w-full" />
        </div>
        <p className="mt-2 text-sm font-medium text-zinc-600">{label}</p>
      </div>
    </main>
  );
}
