import { cache } from 'react'
export const revalidate = 3600
import {
    collection,
    getDocs,
    DocumentData,
    QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "@/components/ui/use-toast";
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


export const getAssignmentsData = cache(async (classid: string) => {
    const assignmentData: Assignment[] = [];
    try {
        const querySnapshot = await getDocs(
            collection(db, `Classrooms/${classid}/Assignment`)
        );

        querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
            const assignmentDataItem: Assignment = {
                id: doc.id,
                assignmentname: doc.data().assignmentname,
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
        toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: "There was an error fetching your assignments currently",
        });
    }
    return assignmentData;
})