import { getDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { DataTable } from "./data-table";
import styles from "./styles.module.css";

type Classroom = {
  id: string;
  Classname: string;
  TeacherName: string;
  TeacherEmail: string;
  TeacherUid: string;
  Section: string;
  Subject: string;
  Createdby: string;
  students: {
    uid: string;
    name: string;
  }[];
};

async function getAssignmentsData(classid: string): Promise<Classroom | null> {
  try {
    const docRef = doc(db, "Classrooms", classid);
    const docSnapshot = await getDoc(docRef);

    if (docSnapshot.exists()) {
      const classroomData = docSnapshot.data() as Classroom;
      return { ...classroomData, id: docSnapshot.id };
    } else {
      console.error("Document does not exist.");
      return null;
    }
  } catch (error) {
    console.error("Error fetching assignments:", error);
    throw error;
  }
}

export default async function Assignment({
  params,
}: {
  params: { classid: string };
}) {
  const classroomData: Classroom | null = await getAssignmentsData(
    params.classid
  );

  return (
    <div className={`mx-auto overflow-hidden ${styles.tbc}`}>
      <DataTable data={classroomData?.students || []} />
    </div>
  );
}
