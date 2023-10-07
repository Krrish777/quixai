import {
  collection,
  getDocs,
  DocumentData,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { DataTable } from "./data-table";
import styles from "./styles.module.css";

type Question = {
  question: string;
  options: string[];
  answer: string;
}[];

type Assignment = {
  id: string;
  topic: string;
  noquestions: number;
  difficulty: string;
  Questiontype: string;
  questionDatatoadd: { questions: Question };
  totalmarks: number;
};

async function getAssignmentsData(classid: string): Promise<Assignment[]> {
  //not checking type any add errors and stuff
  const assignmentData: Assignment[] = [];
  try {
    const querySnapshot = await getDocs(
      collection(db, `Classrooms/${classid}/Assignment`)
    );

    querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
      const assignmentDataItem: Assignment = {
        id: doc.id,
        topic: doc.data().topic,
        noquestions: doc.data().noquestions,
        difficulty: doc.data().difficulty,
        Questiontype: doc.data().Questiontype,
        questionDatatoadd: doc.data().questionDatatoadd,
        totalmarks: doc.data().totalmarks,
      };

      assignmentData.push(assignmentDataItem);
    });
  } catch (error) {
    console.error("Error fetching assignments:", error);
  }
  return assignmentData;
}

export default async function Assignment({
  params,
}: {
  params: { classid: string };
}) {
  const data = await getAssignmentsData(params.classid);
  console.log(params.classid);
  return (
    <div className={`mx-auto overflow-hidden ${styles.tbc}`}>
      <DataTable data={data} />
    </div>
  );
}
