"use client";
import React, { useEffect, useState } from "react";
import styles from "@/components/pagecomponents/class.module.css";
import Link from "next/link";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { Icons } from "@/components/ui/Icons";
import { toast } from "@/components/ui/use-toast";
import CryptoJS from "crypto-js";
import Loading from "./loading";

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

export default function Createddclassroom() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const CACHE_EXPIRATION = 10 * 60 * 1000;
    const currentTime = new Date().getTime();

    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        const CACHE_KEY = `${authUser.uid.slice(0, 5)}CreatedclassroomsData`;
        const cachedData = localStorage.getItem(CACHE_KEY);
        const cachedTimestamp = localStorage.getItem(`${CACHE_KEY}_timestamp`);

        if (
          cachedData &&
          cachedTimestamp &&
          currentTime - parseInt(cachedTimestamp) < CACHE_EXPIRATION
        ) {
          const decryptedBytes = CryptoJS.AES.decrypt(cachedData, CACHE_KEY); //encryption key
          const decryptedData = decryptedBytes.toString(CryptoJS.enc.Utf8);

          const parsedData = JSON.parse(decryptedData) as Classroom[];
          setClassrooms(parsedData);
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
              classroomsData.push({ id: doc.id, ...doc.data() } as Classroom);
            });

            const dataToEncrypt = JSON.stringify(classroomsData);
            const encryptedData = CryptoJS.AES.encrypt(
              dataToEncrypt,
              CACHE_KEY //encryption key
            ).toString();

            localStorage.setItem(CACHE_KEY, encryptedData);
            localStorage.setItem(
              `${CACHE_KEY}_timestamp`,
              currentTime.toString()
            );

            setClassrooms(classroomsData);
          } catch (error) {
            console.log(error);
            toast({
              variant: "destructive",
              title: "Uh oh! Something went wrong.",
              description: "There was a problem with your request.",
            });
          }
        }
      } else {
        toast({
          title: "No user authenticated",
          description: "Please login and try again",
        });
        console.log("No user is currently authenticated");
      }

      setLoading(false); // Set loading to false when data is fetched
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <div>
      {loading ? (
        <Loading />
      ) : classrooms.length === 0 ? (
        <div className={`${styles.emptyMessage} p-5 mt-10 w-full text-center`}>
          No classrooms found. Create a Classroom
        </div>
      ) : (
        <div className={styles.grid}>
          {classrooms.map((classroom) => (
            <Link
              key={classroom.id}
              href={`/dashboard/createdclassroom/${classroom.id}/announcement`}
            >
              <div className={`${styles.class}  rounded-sm border`}>
                <div className={`${styles.id} bg-secondary rounded-t-sm`}>
                  <Icons.Classcard />
                  <div>
                    <div>{classroom.Classname}</div>
                    <div>{classroom.Section}</div>
                  </div>
                </div>
                <div className="flex flex-col p-3 gap-2">
                  <div>Teacher : {classroom.TeacherName}</div>
                  <div>Subject : {classroom.Subject}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
