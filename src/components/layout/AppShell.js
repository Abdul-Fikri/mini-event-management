import Image from "next/image";
import { logout } from "@/actions/auth";
import { Button } from "@/components/ui/Button";
import NavLinks from "@/components/layout/NavLinks";
import { AppUIProvider } from "@/components/layout/AppUIContext";
import NavMenuToggle from "@/components/layout/NavMenuToggle";

export default function AppShell({ group, owner, children }) {
  const ownerInitial = owner.email?.trim()?.charAt(0)?.toUpperCase() || "O";

  return (
    <AppUIProvider>
      <div className="app-shell min-h-screen">
        <header className="app-topbar sticky top-0 z-40 border-b">
          <div className="mx-auto flex min-h-16 max-w-[1600px] items-center justify-between gap-3 px-4 py-2.5 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <NavMenuToggle />
              {group.logo_url ? (
                <Image
                  src={group.logo_url}
                  alt={`Logo ${group.name}`}
                  width={40}
                  height={40}
                  className="h-10 w-10 shrink-0 rounded-xl border border-[#E3ECF5] bg-white object-contain p-1"
                />
              ) : (
                <div
                  aria-hidden="true"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#DCE8F3] bg-[#EDF4FA] text-sm font-semibold text-[#32628E]"
                >
                  {group.name?.trim()?.charAt(0)?.toUpperCase() || "G"}
                </div>
              )}
              <div className="min-w-0 leading-tight">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#5C83A7]">
                  Mini Event Management
                </p>
                <p className="truncate text-sm font-semibold text-[#1E293B] sm:text-base">
                  {group.name}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <div className="hidden items-center gap-2.5 rounded-full border border-[#E3ECF5] bg-[#F8FAFC] px-3 py-1.5 sm:flex">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#DDEAF5] text-xs font-semibold text-[#32628E]">
                  {ownerInitial}
                </span>
                <div className="min-w-0 text-left leading-tight">
                  <span className="block max-w-52 truncate text-xs font-semibold text-[#334155]" title={owner.email}>
                    {owner.email}
                  </span>
                  <span className="mt-0.5 block text-[10px] text-[#718096]">Owner</span>
                </div>
              </div>
              <form action={logout}>
                <Button
                  type="submit"
                  variant="secondary"
                  className="px-3 py-2 text-xs sm:px-3.5 sm:text-sm"
                >
                  Keluar
                </Button>
              </form>
            </div>
          </div>
        </header>

        <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-5 px-4 py-5 sm:px-6 lg:flex-row lg:gap-6 lg:px-8 lg:py-6">
          <aside className="w-full shrink-0 lg:w-60">
            <NavLinks />
          </aside>
          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </div>
    </AppUIProvider>
  );
}
