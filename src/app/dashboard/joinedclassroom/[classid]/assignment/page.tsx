"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { db, app } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useParams, usePathname } from "next/navigation";
import { Icons } from "@/components/ui/Icons";
import Link from "next/link";
import { User, getAuth, onAuthStateChanged } from "firebase/auth";
import styles from "../styles.module.css";
import CryptoJS from "crypto-js";

type Assignment = {
  id: string;
  assignmentname: string;
  submissionDate: number;
  Scoredmarks: number;
  Questiontype: string;
  totalmarks: number;
  isSubmitted: boolean;
};

export default function InpuMaterialtFile() {
  const params = useParams();
  const classid = params.classid;
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const auth = getAuth(app);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        setUser(authUser);
        if (classid && user) {
          const CACHE_EXPIRATION = 10 * 60 * 1000;
          const currentTime = new Date().getTime();

          const CACHE_KEY = `${authUser.uid.slice(
            0,
            5
          )}joinedclassroom${classid}assignmnets`;
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

            const parsedData = JSON.parse(decryptedData) as Assignment[];
            setAssignments(parsedData);
          } else {
            try {
              const assignmentsRef = collection(
                db,
                `Classrooms/${classid}/Assignment`
              );
              const assignmentsSnapshot = await getDocs(assignmentsRef);

              const mergedResults: Assignment[] = await Promise.all(
                assignmentsSnapshot.docs.map(async (assignmentDoc) => {
                  const assignmentId = assignmentDoc.id;
                  const assignmentname = assignmentDoc.data().assignmentname;
                  const Questiontype = assignmentDoc.data().Questiontype;
                  const totalmarks = assignmentDoc.data().totalmarks;

                  const submittedAssignmentsRef = collection(
                    db,
                    `Classrooms/${classid}/submitted_assignment`
                  );

                  const submittedAssignmentsQuery = query(
                    submittedAssignmentsRef,
                    where("studentUUID", "==", `${user.uid}`),
                    where("assignmentId", "==", assignmentId)
                  );

                  const submittedAssignmentsSnapshot = await getDocs(
                    submittedAssignmentsQuery
                  );

                  const isSubmitted = !submittedAssignmentsSnapshot.empty;

                  let submissionDate = null;
                  let Scoredmarks = null;

                  if (isSubmitted) {
                    const submittedAssignmentData =
                      submittedAssignmentsSnapshot.docs[0].data();
                    submissionDate = submittedAssignmentData.submissionDate;
                    Scoredmarks = submittedAssignmentData.scoredMarks;
                  }

                  return {
                    id: assignmentId,
                    assignmentname: assignmentname,
                    Questiontype,
                    totalmarks,
                    isSubmitted,
                    submissionDate,
                    Scoredmarks,
                  };
                })
              );
              const dataToEncrypt = JSON.stringify(mergedResults);
              const encryptedData = CryptoJS.AES.encrypt(
                dataToEncrypt,
                CACHE_KEY
              ).toString();

              localStorage.setItem(CACHE_KEY, encryptedData);
              localStorage.setItem(
                `${CACHE_KEY}_timestamp`,
                currentTime.toString()
              );

              console.log(mergedResults);
              setAssignments(mergedResults);
            } catch (error) {
              console.error("Error fetching data:", error);
            }
          }
        }
      } else {
        setUser(null);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [classid, user, auth]);

  const path = usePathname();
  console.log(assignments);
  return (
    <div className={`flex flex-col gap-3 overflow-hidden ${styles.tbc}`}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Assignment name</TableHead>
            <TableHead>Assignment Type</TableHead>
            <TableHead>Submission Date</TableHead>
            <TableHead>Marks Scored</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assignments.map((assignment: Assignment, index: any) => (
            <TableRow key={index}>
              <TableCell>{assignment.assignmentname}</TableCell>
              <TableCell>{assignment.Questiontype}</TableCell>
              <TableCell>
                {assignment.submissionDate
                  ? new Date(assignment.submissionDate).toLocaleDateString(
                      "en-US"
                    )
                  : "-"}
              </TableCell>

              <TableCell>
                {assignment.isSubmitted
                  ? `${assignment.Scoredmarks || 0}/${assignment.totalmarks}`
                  : "Not submitted"}
              </TableCell>

              <TableCell>
                {assignment.isSubmitted ? (
                  <span className="line-through">submitted</span>
                ) : (
                  <div className="flex items-center gap-1">
                    <Icons.circlecheck />
                    <Link
                      href={`${path}/${assignment.id}/?type=${assignment.Questiontype}`}
                    >
                      Submit now
                    </Link>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
