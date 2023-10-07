"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import styles from "./styles.module.css";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items: {
    href: string;
    title: string;
  }[];
}

export function SidebarNav({ className, items, ...props }: SidebarNavProps) {
  const pathname = usePathname();
  const params = useParams();
  const classid = params.classid;

  const lastPartOfPathname = pathname.split("/").filter(Boolean).pop() || "";

  return (
    <div
      className={cn(
        "flex space-x-2",
        `inline-flex  justify-center rounded-md bg-muted p-1 text-muted-foreground place-items-center ${styles.tabs} mb-3`,
        className
      )}
      {...props}
    >
      {items.map((item) => (
        <Link
          key={item.href}
          href={`/dashboard/joinedclassroom/${classid}/${item.href}`}
          className={cn(
            buttonVariants({ variant: "ghost" }),
            lastPartOfPathname === item.href
              ? "hover:bg-muted bg-background text-foreground shadow-sm"
              : "hover:bg-transparent ",
            "justify-start "
          )}
        >
          {item.title}
        </Link>
      ))}
    </div>
  );
}
