"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { auth, db, storage } from "@/lib/firebase";
import axios from "axios";
import { addDoc, collection } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import React, { useRef, useState } from "react";

interface QidProps {
  topic: string;
  instructions: string;
  totalmarks: number;
}

type SubmittedAssignment = {
  studentUUID: string;
  studentEmail: string;
  studentName: string;
  assignmentId: string;
  scoredMarks: number;
  topic: string;
  instructions: string;
  selectedpdf: any;
  totalmarks: number;
  submissionDate: number;
};

const Material: React.FC<QidProps> = ({ topic, instructions, totalmarks }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const user = auth.currentUser;
  const params = useParams();
  const classid = params.classid;
  const assignmentid = params.answerassignment;
  const searchParams = useSearchParams();
  const type = searchParams.get("type");
  const router = useRouter();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setSelectedFile(file || null);
  };
  async function Sendassignment() {
    if (selectedFile) {
      console.log(selectedFile);

      const allowedTypes = ["application/pdf"];

      if (selectedFile && !allowedTypes.includes(selectedFile.type)) {
        alert("Please select a PDF file.");
        return;
      }

      if (
        user &&
        classid &&
        assignmentid &&
        type === "WrittenAssignment" &&
        user.uid &&
        user.email &&
        user.displayName
      ) {
        try {
          const storageRef = ref(storage, `${classid}/${selectedFile?.name}`);
          const snapshot = await uploadBytes(storageRef, selectedFile);

          await getDownloadURL(snapshot.ref).then(async (downloadURL) => {
            console.log("File available at", downloadURL);

            const Datatobeadded: SubmittedAssignment = {
              studentUUID: user.uid,
              studentEmail: user.email as string,
              studentName: user.displayName as string,
              assignmentId: assignmentid as string,
              scoredMarks: 0,
              topic,
              instructions,
              selectedpdf: downloadURL,
              totalmarks,
              submissionDate: Date.now(),
            };

            try {
              await addDoc(
                collection(db, `Classrooms/${classid}/submitted_assignment`),
                Datatobeadded
              );
              const CACHE_KEY = `${user.uid.slice(
                0,
                5
              )}joinedclassroom${classid}assignmnets`;
              localStorage.removeItem(CACHE_KEY);
              localStorage.removeItem(`${CACHE_KEY}_timestamp`);
              router.back();
            } catch {
              toast({
                variant: "destructive",
                title: "Uh oh! Something went wrong.",
                description: "There was a problem with your request.",
              });
            }
          });
        } catch (error) {
          alert("there was a error on mapping");
        }
      } else {
        console.log("No user is currently authenticated or classid is missing");
      }
    } else {
      alert("no file");
    }
  }
  return (
    <div className="p-4">
      <div className="flex flex-col p-2 justify-center mb-5 items-center text-center">
        <div>Topic : {topic}</div>

        <div>Mark your answer and submit the form</div>
      </div>
      {instructions.split("\n").map((line, index) => (
        <div key={index}>{line}</div>
      ))}

      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Input type="file" onChange={handleFileChange} />
        <Button onClick={Sendassignment}>Submit Answers</Button>
      </div>
    </div>
  );
};

export default Material;
