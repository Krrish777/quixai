"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  ColumnFiltersState,
  getFilteredRowModel,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTablePagination } from "./data-table-pagination";
import { DataTableToolbar } from "./data-table-toolbar";
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { useParams, usePathname } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/use-toast";
import { db } from "@/lib/firebase";
import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  setDoc,
  writeBatch,
} from "firebase/firestore";

type AssignmentsData = {
  uid: string;
  name: string;
};

interface DataTableProps<TData, TValue> {
  // columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  // columns,
  data,
}: DataTableProps<AssignmentsData, TValue>) {
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const params = useParams();
  const docclassid = params.classid as string;

  const columns: ColumnDef<AssignmentsData>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-[2px]"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-[2px]"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Topic
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
    },
    {
      accessorKey: "uid",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Question type
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
    },
  ];
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      columnFilters,
      sorting,
    },
  });

  return (
    <div className="flex flex-col gap-5 relative">
      <DataTableToolbar table={table} />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {/* <DataTablePagination table={table} /> */}
      <button
        onClick={async () => {
          const AllRows = table.getFilteredRowModel().flatRows;

          const attendanceDate = "2023-09-26";

          try {
            AllRows.forEach(async (row) => {
              const batch = writeBatch(db);
              const { uid, name } = row.original;
              const attendanceStatus = row.getIsSelected();

              const classroomRef = doc(db, "Classrooms", docclassid);
              const attendanceRef = collection(classroomRef, "Attendance");
              const studentDocRef = doc(attendanceRef, uid);

              const recordedDatesRef = collection(
                classroomRef,
                "RecordedDates"
              );
              const recordedDateDocRef = doc(recordedDatesRef, attendanceDate);
              const recordedDateDocSnapshot = await getDoc(recordedDateDocRef);

              if (!recordedDateDocSnapshot.exists()) {
                batch.set(recordedDateDocRef, {});
                batch.set(
                  studentDocRef,
                  {
                    attendanceRecords: arrayUnion({
                      date: attendanceDate,
                      status: attendanceStatus,
                    }),
                  },
                  { merge: true }
                );
              } else {
                console.log("attendance already taken");
              }

              await batch.commit();
            });

            console.log("Attendance recorded successfully.");
          } catch (error) {
            console.error("Error recording attendance:", error);
          }
        }}
      >
        Submit Attendance
      </button>
    </div>
  );
}
