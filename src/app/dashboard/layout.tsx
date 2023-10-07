import { Dashboard } from "@/components/pagecomponents/Dashboard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Dashboard>{children}</Dashboard>;
}
