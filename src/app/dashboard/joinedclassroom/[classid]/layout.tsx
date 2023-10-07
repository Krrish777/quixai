import { Separator } from "@/components/ui/separator";
import Dropmenu from "./dropmenu";
import { SidebarNav } from "./sidebar-nav";

const sidebarNavItems = [
  {
    title: "Announcment",
    href: "announcement",
  },
  {
    title: "Assignment",
    href: "assignment",
  },
  {
    title: "Materials",
    href: "materials",
  },
  {
    title: "Attendance",
    href: "attendance",
  },
  {
    title: "People",
    href: "people",
  },
  {
    title: "request",
    href: "request",
  },
];

export default function DashboardLayout({
  params,
  children,
}: {
  params: { classid: string }
  children: React.ReactNode;
}) {
  return (
    <div className="p-6">
      <div className=" pb-0">
        <div className="flex items-center justify-between ">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight">BBA A2</h2>
            <p className="text-sm text-muted-foreground">Class code: {params.classid.substring(0, 7)}...</p>
          </div>
          {/* <div>
            <Dropmenu />
          </div> */}
        </div>
        <Separator className="my-4" />
      </div>

      <SidebarNav items={sidebarNavItems} />

      <div>{children}</div>
    </div>
  );
}
