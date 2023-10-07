"use client";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { useParams } from "next/navigation";

async function updateCreatedData(classid: string) {
  try {
    const classroomDocRef = doc(db, "Classrooms", classid);

    await setDoc(
      classroomDocRef,
      {
        createddata: Date.now(),
      },
      { merge: true }
    );

    toast({
      title: "Updated Created Data",
      description: "The createddata field has been updated.",
    });
  } catch (error) {
    console.error("Error updating createddata:", error);
    toast({
      variant: "destructive",
      title: "Uh oh! Something went wrong.",
      description: "There was a problem updating the createddata field.",
    });
  }
}

const Modifiers = () => {
  const params = useParams();
  const dovclassid = params.classid as string;
  return (
    <Button
      variant="outline"
      size="lg"
      className="h-8"
      onClick={() => updateCreatedData(dovclassid)}
    >
      Reset Attendance
    </Button>
  );
};

export default Modifiers;
