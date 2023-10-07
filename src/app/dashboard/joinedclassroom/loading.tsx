import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="p-6 grid gap-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1">
      <Skeleton className="w-[100%] h-[10rem] rounded-sm" />
      <Skeleton className="w-[100%] h-[10rem] rounded-sm" />
      <Skeleton className="w-[100%] h-[10rem] rounded-sm" />
      <Skeleton className="w-[100%] h-[10rem] rounded-sm" />
      <Skeleton className="w-[100%] h-[10rem] rounded-sm" />
      <Skeleton className="w-[100%] h-[10rem] rounded-sm" />
    </div>
  );
}
