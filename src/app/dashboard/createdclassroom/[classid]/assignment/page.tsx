import { DataTable } from "./data-table";
import styles from "./styles.module.css";
import { getAssignmentsData } from '@/lib/utils/firebase';
type Question = {
  question: string;
  options: string[];
  answer: string;
}[];

type Assignment = {
  id: string;
  assignmentname: string;
  topic: string;
  noquestions: number;
  difficulty: string;
  Questiontype: string;
  questionDatatoadd: { questions: Question };
  totalmarks: number;
};



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