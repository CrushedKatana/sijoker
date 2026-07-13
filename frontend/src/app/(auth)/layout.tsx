import { Logo } from "@/components/ui/Logo";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-center overflow-hidden bg-navy-900 px-16 text-white lg:flex">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-navy-700/60" />
        <div className="absolute -bottom-28 left-0 h-72 w-72 rounded-full bg-navy-700/40" />
        <div className="relative">
          <Logo variant="light" className="mb-10 scale-125" />
          <h1 className="text-2xl font-bold">Employment Services Portal</h1>
          <p className="mt-3 max-w-sm text-sm text-slate-300">
            One integrated platform for training, complaints, job listings, and workforce
            reporting.
          </p>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center px-6 py-16">
        <div className="mb-8 lg:hidden">
          <Link href="/">
            <Logo />
          </Link>
        </div>
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
