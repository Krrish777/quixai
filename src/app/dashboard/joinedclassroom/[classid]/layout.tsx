import { Separator } from "@/components/ui/separator";
import { SidebarNav } from "./sidebar-nav";
import Classlayoutdetails from "./Classlayoutdetails";
import styles from "./styles.module.css";

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
  // {
  //   title: "Attendance",
  //   href: "attendance",
  // },
  {
    title: "People",
    href: "people",
  },
  // {
  //   title: "request",
  //   href: "request",
  // },
];

export default function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { classid: string };
}) {
  return (
    <div className={`p-6 ${styles.padd}`}>
      <div className=" pb-0">
        <div className="flex items-center justify-between ">
          <Classlayoutdetails />
        </div>
        <Separator className="my-4" />
      </div>
      <SidebarNav items={sidebarNavItems} />
      <div>{children}</div>
    </div>
  );
}
