import { RequireRole } from "@/components/layout/RequireRole";
import { DashboardShell, type NavItem } from "@/components/layout/DashboardShell";
import {
  IconAcademicCap,
  IconBriefcase,
  IconChartBar,
  IconChat,
  IconClipboard,
  IconDashboard,
  IconFolder,
  IconNewspaper,
  IconUserCog,
  IconUsers,
} from "./_components/icons";

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: <IconDashboard /> },
  { label: "Lowongan Pekerjaan", href: "/admin/lowongan", icon: <IconBriefcase /> },
  { label: "Pelaporan Perusahaan", href: "/admin/pelaporan-perusahaan", icon: <IconChartBar /> },
  { label: "Manajemen Berita", href: "/admin/berita", icon: <IconNewspaper /> },
  { label: "Kelola Pengaduan", href: "/admin/pengaduan", icon: <IconChat /> },
  { label: "Dokumen Peserta", href: "/admin/dokumen-peserta", icon: <IconFolder /> },
  { label: "Manajemen Peserta", href: "/admin/peserta", icon: <IconUsers /> },
  { label: "Manajemen Pelatihan", href: "/admin/pelatihan", icon: <IconAcademicCap /> },
  { label: "Survei Kepuasan", href: "/admin/survei", icon: <IconClipboard /> },
  { label: "Manajemen Akun", href: "/admin/akun", icon: <IconUserCog /> },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireRole roles={["admin", "operator"]}>
      <DashboardShell navItems={navItems} panelLabel="Admin Panel">
        {children}
      </DashboardShell>
    </RequireRole>
  );
}
