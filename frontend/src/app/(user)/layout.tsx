import { RequireRole } from "@/components/layout/RequireRole";
import { UserTopNav } from "@/components/layout/UserTopNav";

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireRole roles={["pencari_kerja"]}>
      <div className="min-h-screen bg-background">
        <UserTopNav />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
      </div>
    </RequireRole>
  );
}
