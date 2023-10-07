"use client";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { db, app } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { SetStateAction, useEffect, useState } from "react";
import { useParams, usePathname } from "next/navigation";
import { Icons } from "@/components/ui/Icons";
import Link from "next/link";
import { User, getAuth, onAuthStateChanged } from "firebase/auth";
import styles from "../styles.module.css";

type Assignment = {
  id: string;
  topic: string;
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
          try {
            const assignmentsRef = collection(
              db,
              `Classrooms/${classid}/Assignment`
            );
            const assignmentsSnapshot = await getDocs(assignmentsRef);

            const mergedResults: Assignment[] = await Promise.all(
              assignmentsSnapshot.docs.map(async (assignmentDoc) => {
                const assignmentId = assignmentDoc.id;
                const assignmentTitle = assignmentDoc.data().topic;
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
                  topic: assignmentTitle,
                  submissionDate,
                  Scoredmarks,
                  Questiontype,
                  totalmarks,
                  isSubmitted,
                };
              })
            );

            console.log(mergedResults);
            setAssignments(mergedResults);
          } catch (error) {
            console.error("Error fetching data:", error);
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
              <TableCell>{assignment.topic}</TableCell>
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
                  "submitted"
                ) : (
                  <>
                    <Icons.circlecheck />
                    <Link
                      href={`${path}/${assignment.id}/?type=${assignment.Questiontype}`}
                    >
                      Submit now
                    </Link>
                  </>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
