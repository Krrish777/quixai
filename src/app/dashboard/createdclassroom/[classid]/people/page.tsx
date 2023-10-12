"use client";

import CryptoJS from "crypto-js";
import { CopyIcon, Link, MoreHorizontal } from "lucide-react";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import styles from "./styles.module.css";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
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
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";

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
  const [user, setuser] = useState<User | null>(null);
  const classid = Array.isArray(params.classid)
    ? params.classid.join("")
    : params.classid;
  const randomImage = ["02.png", "01.png", "03.png", "04.png", "05.png"][
    Math.floor(Math.random() * 5)
  ];

  function renderstudents() {
    const CACHE_EXPIRATION = 10 * 60 * 1000;
    const currentTime = new Date().getTime();

    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        setuser(authUser);
        const CACHE_KEY = `${authUser.uid.slice(0, 5)}CreatedclassroomsData`;
        const cachedData = localStorage.getItem(CACHE_KEY);
        const cachedTimestamp = localStorage.getItem(`${CACHE_KEY}_timestamp`);

        if (
          cachedData &&
          cachedTimestamp &&
          currentTime - parseInt(cachedTimestamp) < CACHE_EXPIRATION
        ) {
          const decryptedBytes = CryptoJS.AES.decrypt(cachedData, CACHE_KEY);
          const decryptedData = decryptedBytes.toString(CryptoJS.enc.Utf8);

          const parsedData = JSON.parse(decryptedData) as Classroom[];
          const foundObject = parsedData.find((item) => item.id === classid);
          if (foundObject) {
            setClasssname(foundObject?.students || []);
          }
        } else {
          try {
            const q = query(
              collection(db, "Classrooms"),
              where("Createdby", "==", authUser.uid),
              orderBy("Createddata")
            );

            const querySnapshot = await getDocs(q);

            const classroomsData: Classroom[] = [];
            querySnapshot.forEach((doc) => {
              classroomsData.push({
                id: doc.id,
                ...doc.data(),
              } as Classroom);
            });

            const dataToEncrypt = JSON.stringify(classroomsData);
            const encryptedData = CryptoJS.AES.encrypt(
              dataToEncrypt,
              CACHE_KEY
            ).toString();

            localStorage.setItem(CACHE_KEY, encryptedData);
            localStorage.setItem(
              `${CACHE_KEY}_timestamp`,
              currentTime.toString()
            );

            const foundObject = classroomsData.find(
              (item) => item.id === classid
            );
            if (foundObject) {
              setClasssname(foundObject?.students || []);
            }
          } catch (error) {}
        }
      } else {
        console.log("No user is currently authenticated");
      }
    });

    return () => {
      unsubscribe();
    };
  }

  useEffect(() => {
    if (classid) {
      renderstudents();
    }
  }, [classid]);

  async function deleteStudent(
    uid: string,
    name: string,
    email: string
  ): Promise<void> {
    try {
      if (classid && uid && user) {
        const CACHE_KEY = `${user.uid.slice(0, 5)}CreatedclassroomsData`;
        const classroomDocRef = doc(db, "Classrooms", classid);
        const classroomDoc = await getDoc(classroomDocRef);

        if (classroomDoc.exists()) {
          const classroomData = classroomDoc.data();

          // Extract the students array from the classroom data
          const students = classroomData.students || [];

          // Find the index of the student with the specified UID
          const studentIndex = students.findIndex(
            (student: { uid: string }) => student.uid === uid
          );

          console.log(studentIndex);
          if (studentIndex !== -1) {
            // Remove the student from the students array
            students.splice(studentIndex, 1);

            // Update the classroom document with the modified students array
            await updateDoc(classroomDocRef, { students });

            console.log(`Student with UID ${uid} removed successfully.`);
          } else {
            console.error(
              `Student with UID ${uid} not found in the classroom.`
            );
          }
          localStorage.removeItem(CACHE_KEY);
          localStorage.removeItem(`${CACHE_KEY}_timestamp`);
          renderstudents();
        } else {
          console.error(`Classroom document with ID ${classid} not found.`);
        }
      } else {
        console.error("Missing classid or uid");
      }
    } catch (error) {
      console.error("Error removing student:", error);
      throw new Error("Failed to remove student");
    }
  }

  return (
    <Card className={`col-span-3 ${styles.paddcard}`}>
      <CardHeader>
        <CardTitle>Students Details </CardTitle>
        <CardDescription>Manage class students </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {Classname.map((item) => (
            <div className="flex items-center" key={item.uid}>
              <Avatar className="flex h-9 w-9 items-center justify-center space-y-0 border">
                <AvatarImage src={`/${randomImage}`} alt="Avatar" />
                <AvatarFallback>JL</AvatarFallback>
              </Avatar>
              <div className="ml-4 space-y-1">
                <p className="text-sm font-medium leading-none">{item.name}</p>
                <p className={`text-sm text-muted-foreground ${styles.email}`}>
                  {item.email}
                </p>
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
                    <DropdownMenuItem
                      onClick={() => {
                        deleteStudent(item.uid, item.name, item.email);
                      }}
                    >
                      Remove Student
                    </DropdownMenuItem>
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
