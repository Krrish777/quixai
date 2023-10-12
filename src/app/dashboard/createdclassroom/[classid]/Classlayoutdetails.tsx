"use client";

import CryptoJS from "crypto-js";
import { CopyIcon } from "lucide-react";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import styles from "./styles.module.css";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { toast } from "@/components/ui/use-toast";
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
  students: string[];
};

const Classlayoutdetails = () => {
  const params = useParams();
  const [Classname, setClasssname] = useState<string>();
  const [user, setuser] = useState<User | null>(null);
  const classid = Array.isArray(params.classid)
    ? params.classid.join("")
    : params.classid;

  useEffect(() => {
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
            setClasssname(foundObject?.Classname);
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
              setClasssname(foundObject?.Classname);
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
  }, [classid]);

  return (
    <div className="space-y-1">
      <h2 className={`text-2xl font-semibold tracking-tight ${styles.clsname}`}>
        {Classname ? Classname : ""}
      </h2>
      <div
        className={`${styles.cpnam} text-sm text-muted-foreground  flex leading-1 items-center`}
      >
        <CopyIcon
          className="h-3 cursor-pointer"
          onClick={() => {
            navigator.clipboard.writeText(classid);
            toast({
              title: "Class id copied!",
            });
          }}
        />
        <div className={`${styles.clscd}`}>Class code: </div>
        {classid.substring(0, 7)}...
      </div>
    </div>
  );
};

export default Classlayoutdetails;
