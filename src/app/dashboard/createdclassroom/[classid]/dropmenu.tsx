"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useParams } from "next/navigation";
import styles from "./styles.module.css";

const Dropmenu = () => {
  const params = useParams();
  const classid = params.classid;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className={`${styles.pas} cursor-pointer`}>
        <Button
          variant="outline"
          className="flex flex-row align-middle justify-center align items-center gap-1"
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 15 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`${styles.plus}`}
          >
            <path
              d="M8 2.75C8 2.47386 7.77614 2.25 7.5 2.25C7.22386 2.25 7 2.47386 7 2.75V7H2.75C2.47386 7 2.25 7.22386 2.25 7.5C2.25 7.77614 2.47386 8 2.75 8H7V12.25C7 12.5261 7.22386 12.75 7.5 12.75C7.77614 12.75 8 12.5261 8 12.25V8H12.25C12.5261 8 12.75 7.77614 12.75 7.5C12.75 7.22386 12.5261 7 12.25 7H8V2.75Z"
              fill="currentColor"
              fillRule="evenodd"
              clipRule="evenodd"
            ></path>
          </svg>
          Create Assignment
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Assignment Type</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Mcq</DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuLabel>Create by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <Link
                href={{
                  pathname: `/dashboard/createdclassroom/${classid}/topic`,
                  query: { type: "Mcq" },
                }}
              >
                <DropdownMenuItem>Topic</DropdownMenuItem>
              </Link>
              <Link
                href={{
                  pathname: `/dashboard/createdclassroom/${classid}/text`,
                  query: { type: "Mcq" },
                }}
              >
                <DropdownMenuItem>Text</DropdownMenuItem>
              </Link>
              <Link
                href={{
                  pathname: `/dashboard/createdclassroom/${classid}/pdf`,
                  query: { type: "Mcq" },
                }}
              >
                <DropdownMenuItem>Pdf</DropdownMenuItem>
              </Link>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>T/F</DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuLabel>Create by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <Link
                href={{
                  pathname: `/dashboard/createdclassroom/${classid}/topic`,
                  query: { type: "TF" },
                }}
              >
                <DropdownMenuItem>Topic</DropdownMenuItem>
              </Link>
              <Link
                href={{
                  pathname: `/dashboard/createdclassroom/${classid}/text`,
                  query: { type: "TF" },
                }}
              >
                <DropdownMenuItem>Text</DropdownMenuItem>
              </Link>
              <Link
                href={{
                  pathname: `/dashboard/createdclassroom/${classid}/pdf`,
                  query: { type: "TF" },
                }}
              >
                <DropdownMenuItem>Pdf</DropdownMenuItem>
              </Link>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Fill in the blanks</DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuLabel>Create by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <Link
                href={{
                  pathname: `/dashboard/createdclassroom/${classid}/topic`,
                  query: { type: "Fillinblanks" },
                }}
              >
                <DropdownMenuItem>Topic</DropdownMenuItem>
              </Link>
              <Link
                href={{
                  pathname: `/dashboard/createdclassroom/${classid}/text`,
                  query: { type: "Fillinblanks" },
                }}
              >
                <DropdownMenuItem>Text</DropdownMenuItem>
              </Link>
              <Link
                href={{
                  pathname: `/dashboard/createdclassroom/${classid}/pdf`,
                  query: { type: "Fillinblanks" },
                }}
              >
                <DropdownMenuItem>Pdf</DropdownMenuItem>
              </Link>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Short answers</DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuLabel>Create by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <Link
                href={{
                  pathname: `/dashboard/createdclassroom/${classid}/topic`,
                  query: { type: "Shortanswers" },
                }}
              >
                <DropdownMenuItem>Topic</DropdownMenuItem>
              </Link>
              <Link
                href={{
                  pathname: `/dashboard/createdclassroom/${classid}/text`,
                  query: { type: "Shortanswers" },
                }}
              >
                <DropdownMenuItem>Text</DropdownMenuItem>
              </Link>
              <Link
                href={{
                  pathname: `/dashboard/createdclassroom/${classid}/pdf`,
                  query: { type: "Shortanswers" },
                }}
              >
                <DropdownMenuItem>Pdf</DropdownMenuItem>
              </Link>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
        <Link
          href={{
            pathname: `/dashboard/createdclassroom/${classid}/writtenmaterials`,
          }}
        >
          <DropdownMenuItem>Written Assignment</DropdownMenuItem>
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Dropmenu;
