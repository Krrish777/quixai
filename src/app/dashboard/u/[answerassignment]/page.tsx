"use client";
import React, { useEffect, useState } from "react";
import Mcq from "./Mcq";
import TF from "./Tf";
import Blanks from "./Blanks";
import Material from "./Material";
import { useSearchParams } from "next/navigation";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Shortquestions from "./Shortquestions";

type Question = {
  question: string;
  options: string[];
  answer: string;
}[];

type AssignmentData = {
  topic: string;
  noquestions: number | null;
  difficulty: string;
  Questiontype: string | null;
  questionDatatoadd: { questions: Question };
  totalmarks: number;
};

type materialtype = {
  topic: string;
  instructions: string;
  totalmarks: number;
  Questiontype: "WrittenAssignment";
};

const Page = ({
  params,
}: {
  params: { answerassignment: string; classid: string };
}) => {
  const searchParams = useSearchParams();
  const type = searchParams.get("type");
  const [assignment, setassignment] = useState<AssignmentData | null>();
  const [materialassignment, setmaterialassignment] =
    useState<materialtype | null>();

  useEffect(() => {
    if (
      type === "Mcq" ||
      type === "TF" ||
      type === "Fillinblanks" ||
      type === "Shortanswers"
    ) {
      fetchAssignmentMcq(params.classid, params.answerassignment);
    } else if (type === "WrittenAssignment") {
      fetchwrittenassignment(params.classid, params.answerassignment);
    } else {
      alert("There was a error with the assignments (Type not supported)");
    }
  }, [params.classid, params.answerassignment, type]);

  async function fetchwrittenassignment(classId: string, assignmentId: string) {
    try {
      const assignmentRef = doc(
        db,
        `Classrooms/${classId}/Assignment/${assignmentId}`
      );

      const assignmentSnapshot = await getDoc(assignmentRef);

      const assignment: materialtype | null = assignmentSnapshot.exists()
        ? (assignmentSnapshot.data() as materialtype)
        : null;
      setmaterialassignment(assignment);
      console.log("Assignment:", assignment);
    } catch (error) {
      console.error("Error fetching assignment:", error);
    }
  }

  async function fetchAssignmentMcq(classId: string, assignmentId: string) {
    try {
      const assignmentRef = doc(
        db,
        `Classrooms/${classId}/Assignment/${assignmentId}`
      );

      const assignmentSnapshot = await getDoc(assignmentRef);

      const assignment: AssignmentData | null = assignmentSnapshot.exists()
        ? (assignmentSnapshot.data() as AssignmentData)
        : null;
      setassignment(assignment);
      console.log("Assignment:", assignment);
    } catch (error) {
      console.error("Error fetching assignment:", error);
    }
  }

  switch (type) {
    case "Mcq":
      return (
        <Mcq
          questions={assignment?.questionDatatoadd.questions || []}
          totalmarks={assignment?.totalmarks || 0}
          topic={assignment?.topic || ""}
        />
      );
    case "TF":
      return (
        <TF
          questions={assignment?.questionDatatoadd.questions || []}
          totalmarks={assignment?.totalmarks || 0}
          topic={assignment?.topic || ""}
        />
      );
    case "Fillinblanks":
      return (
        <Blanks
          questions={assignment?.questionDatatoadd.questions || []}
          totalmarks={assignment?.totalmarks || 0}
          topic={assignment?.topic || ""}
        />
      );
    case "WrittenAssignment":
      return (
        <Material
          topic={materialassignment?.topic || ""}
          instructions={materialassignment?.instructions || ""}
          totalmarks={materialassignment?.totalmarks || 0}
        />
      );
    case "Shortanswers":
      return (
        <Shortquestions
          questions={assignment?.questionDatatoadd.questions || []}
          totalmarks={assignment?.totalmarks || 0}
          topic={assignment?.topic || ""}
        />
      );
    default:
      return <div>Type not supported</div>;
  }
};

export default Page;
