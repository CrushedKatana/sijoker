import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { Button } from "@/components/ui/Button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicNavbar />
      <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="text-3xl font-extrabold text-navy-950">Foundation build</h1>
        <p className="max-w-md text-sm text-slate-500">
          This is the shared baseline (design system, auth, API client, layouts). The public
          landing experience lives on the <code className="rounded bg-navy-50 px-1.5 py-0.5">landing-page</code> branch.
        </p>
        <Button href="/login">Masuk / Daftar</Button>
      </main>
      <PublicFooter />
    </div>
  );
}
