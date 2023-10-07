"use client";

import CryptoJS from "crypto-js";
import { CopyIcon } from "lucide-react";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import styles from "./styles.module.css";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { toast } from "@/components/ui/use-toast";

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
              setClasssname(foundObject?.Classname);
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
