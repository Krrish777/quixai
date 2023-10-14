"use client";

import CryptoJS from "crypto-js";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import styles from "./styles.module.css";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";

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

  useEffect(() => {
    if (classid) {
      const CACHE_EXPIRATION = 10 * 60 * 1000;
      const currentTime = new Date().getTime();

      const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
        if (authUser) {
          setuser(authUser);
          const CACHE_KEY = `${authUser.uid.slice(0, 5)}JoinedclassroomsData`;
          const cachedData = localStorage.getItem(CACHE_KEY);
          const cachedTimestamp = localStorage.getItem(
            `${CACHE_KEY}_timestamp`
          );

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
            } catch (error) {
              console.log("there was error");
            }
          }
        } else {
          console.log("No user is currently authenticated");
        }
      });

      return () => {
        unsubscribe();
      };
    }
  }, [classid]);

  return (
    <Card className={`col-span-3 ${styles.paddcard}`}>
      <CardHeader>
        <CardTitle>Students Details </CardTitle>
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
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default Page;
