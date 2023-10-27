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
import { Skeleton } from "../ui/skeleton";

const Listofassignments = () => {
  const [user, setUser] = useState<User | null>(null);
  const [announcements, setAnnouncements] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAnnouncements = async () => {
    try {
      if (user) {
        setLoading(true);
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
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem with your request.",
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      if (authUser) {
        setUser(authUser);
        fetchAnnouncements();
      } else {
        setUser(null);
        setLoading(false);
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
        {loading ? (
          <>
            <Skeleton className="w-[100%] h-[5rem] rounded-sm" />
            <Skeleton className="w-[100%] h-[5rem] rounded-sm" />
          </>
        ) : announcements.length === 0 ? (
          <div className={`${styles.emptyMessage} p-5 w-full text-center`}>
            No General quizes found
          </div>
        ) : (
          announcements.map((announcement) => (
            <div key={announcement.id} className={styles.recentobj}>
              <div>
                <div style={{ whiteSpace: "pre" }}>
                  Name:
                  {announcement.assignmentname.length > 5
                    ? ` ${announcement.assignmentname.substring(0, 5)}...`
                    : `${announcement.assignmentname}`.padEnd(9, " ")}
                </div>
              </div>
              <div style={{ whiteSpace: "pre" }}>
                Topic:
                {announcement.topic.length > 5
                  ? ` ${announcement.topic.substring(0, 5)}...`
                  : `${announcement.topic}`.padEnd(9, " ")}
              </div>
              <div>
                No of Questions:
                {announcement.noquestions}
              </div>

              <Link
                href={`/dashboard/${announcement.id}?type=${announcement.Questiontype}`}
              >
                Get Detailed report
              </Link>
              <div
                className="cursor-pointer"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${window.location.origin}/dashboard/u/${announcement.id}?type=${announcement.Questiontype}`
                  );
                  toast({
                    title: "Link copied",
                  });
                }}
              >
                Copy assignment link
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Listofassignments;
