import { logout } from "@/actions/auth";
import { Button } from "@/components/ui/Button";
import NavLinks from "@/components/layout/NavLinks";
import { AppUIProvider } from "@/components/layout/AppUIContext";
import NavMenuToggle from "@/components/layout/NavMenuToggle";

// Kerangka Owner: provider membagikan state navigasi ke header dan menu.
export default function AppShell({ group, owner, children }) {
  return (
    <AppUIProvider>
      <div className="min-h-screen bg-zinc-50 text-zinc-900">
        <header className="border-b border-zinc-200 bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <NavMenuToggle />
              <div className="min-w-0">
                <p className="text-xs text-zinc-500">Mini Event Management</p>
                <p className="truncate font-semibold">{group.name}</p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <span
                className="hidden max-w-56 truncate text-sm text-zinc-600 sm:inline"
                title={owner.email}
              >
                {owner.email}
              </span>
              <form action={logout}>
                <Button type="submit" variant="secondary">
                  Keluar
                </Button>
              </form>
            </div>
          </div>
        </header>

        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 md:flex-row">
          <aside className="md:w-52 md:shrink-0">
            <NavLinks />
          </aside>
          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </div>
    </AppUIProvider>
  );
}
