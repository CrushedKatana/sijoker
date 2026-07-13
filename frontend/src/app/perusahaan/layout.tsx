import { RequireRole } from "@/components/layout/RequireRole";
import { CompanyTopNav } from "@/components/layout/CompanyTopNav";

export default function PerusahaanLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireRole roles={["perusahaan"]}>
      <div className="min-h-screen bg-background">
        <CompanyTopNav />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
      </div>
    </RequireRole>
  );
}
