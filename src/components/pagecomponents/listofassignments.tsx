"use client";
import { auth, db } from "@/lib/firebase";
import { User, onAuthStateChanged } from "firebase/auth";
import {
  collection,
  orderBy,
  getDocs,
  QuerySnapshot,
  DocumentData,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { toast } from "../ui/use-toast";
import styles from "./styles.module.css";
import Link from "next/link";

const Listofassignments = () => {
  const [user, setUser] = useState<User | null>(null);
  const [announcements, setAnnouncements] = useState<DocumentData[]>([]);

  const fetchAnnouncements = async () => {
    try {
      if (user) {
        const q = query(
          collection(db, "Userassignments"),
          where("createduser", "==", user.uid)
        );

        const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(q);
        const announcementsData: DocumentData[] = [];
        querySnapshot.forEach((doc) => {
          announcementsData.push({
            id: doc.id,
            ...doc.data(),
          });
        });
        setAnnouncements(announcementsData);
        console.log(announcementsData)
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem with your request.",
      });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      if (authUser) {
        setUser(authUser);
        fetchAnnouncements();
      } else {
        setUser(null);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [user]);

  return (
    <div className={styles.recent}>
      <div className={styles.recentname}>Recently Created</div>
      <div className={styles.r}>
        {announcements.map((announcement) => (
          <div key={announcement.id} className={styles.recentobj}>
            <div>Class: {announcement.assignmentname}</div>
            <div>Subject: {announcement.noquestions}</div>
            <div>Topic: {announcement.topic}</div>
            <Link
              href={`/dashboard/${announcement.id}?type=${announcement.Questiontype}`}
            >
              detailed report
            </Link>
            <Link href={`/dashboard/u/${announcement.id}?type=${announcement.Questiontype}`}> copy link</Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Listofassignments;
