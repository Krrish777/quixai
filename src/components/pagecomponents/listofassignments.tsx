"use client";
import { auth, db } from "@/lib/firebase";
import { User, onAuthStateChanged } from "firebase/auth";
import {
  collection,
  orderBy,
  getDocs,
  QuerySnapshot,
  DocumentData,
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
      // Fetch data from Firestore when the user is authenticated
      if (user) {
        // Create a query for the Userassignments collection
        const q = collection(db, "Userassignments");

        // Fetch data from Firestore
        const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(q);

        // Process the query results and update the state
        const announcementsData: DocumentData[] = [];
        querySnapshot.forEach((doc) => {
          announcementsData.push({
            id: doc.id,
            ...doc.data(),
          });
        });

        setAnnouncements(announcementsData);
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
    // Listen for changes in the authentication state
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      if (authUser) {
        setUser(authUser);
      } else {
        // Handle the case when the user is not authenticated
        setUser(null);
      }
    });

    return () => {
      // Unsubscribe from the onAuthStateChanged listener when the component unmounts
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    // Fetch announcements when the user is authenticated
    if (user) {
      fetchAnnouncements();
    }
  }, [user]);

  return (
    <div className={styles.recent}>
      <div className={styles.recentname}>Recently Created</div>
      <div className={styles.r}>
        {/* Map over the announcements and render them */}
        {announcements.map((announcement) => (
          <div key={announcement.id} className={styles.recentobj}>
            <div>Class: {announcement.class}</div>
            <div>Subject: {announcement.subject}</div>
            <div>Topic: {announcement.topic}</div>
            <Link
              href={`/dashboard/${announcement.id}?type=${announcement.Questiontype}`}
            >
              {" "}
              detailed report
            </Link>
            {/* <Link href={`/dashboard/u/${announcement.id}?type=${announcement.Questiontype}`}> detailed report</Link> */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Listofassignments;
