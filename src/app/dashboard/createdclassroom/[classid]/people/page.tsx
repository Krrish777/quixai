"use client";

import CryptoJS from "crypto-js";
import { CopyIcon, Link, MoreHorizontal } from "lucide-react";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import styles from "./styles.module.css";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

type Classroom = {
  id: string;
  Classname: string;
  TeacherName: string;
  TeacherEmail: string;
  TeacherUid: string;
  Section: string;
  Subject: string;
  Createdby: string;
  students: Student[];
};
type Student = {
  uid: string;
  name: string;
  email: string;
};

const Page = () => {
  const params = useParams();
  const [Classname, setClasssname] = useState<Student[]>([]);
  const classid = Array.isArray(params.classid)
    ? params.classid.join("")
    : params.classid;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser && classid) {
        const CACHE_KEY = `${authUser.uid.slice(0, 5)}CreatedclassroomsData`;
        const cachedData = localStorage.getItem(CACHE_KEY);

        if (cachedData) {
          try {
            const decryptedBytes = CryptoJS.AES.decrypt(cachedData, CACHE_KEY);
            const decryptedData = decryptedBytes.toString(CryptoJS.enc.Utf8);

            const parsedData = JSON.parse(decryptedData) as Classroom[];
            const foundObject = parsedData.find((item) => item.id === classid);
            if (foundObject) {
              setClasssname(foundObject?.students || []);
            }
          } catch (error) {
            console.error("Error decrypting data:", error);
          }
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [classid]);

  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Students Details </CardTitle>
        <CardDescription>Manage class students </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {Classname.map((item) => (
            <div className="flex items-center" key={item.uid}>
              <Avatar className="flex h-9 w-9 items-center justify-center space-y-0 border">
                <AvatarImage src="/02.png" alt="Avatar" />
                <AvatarFallback>JL</AvatarFallback>
              </Avatar>
              <div className="ml-4 space-y-1">
                <p className="text-sm font-medium leading-none">{item.name}</p>
                <p className="text-sm text-muted-foreground">{item.email}</p>
              </div>
              <div className="ml-auto font-medium">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem>Email Student</DropdownMenuItem>
                    <DropdownMenuItem>Remove Student</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default Page;
