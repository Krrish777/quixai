"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  // Questiontype: "WrittenAssignment";
}

const Material: React.FC<QidProps> = ({ topic, instructions, totalmarks }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const user = auth.currentUser;
  const fileInputRef = useRef<HTMLInputElement>(null);
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

      if (user && classid && assignmentid && type === "WrittenAssignment") {
        try {
          const storageRef = ref(storage, `${classid}/${selectedFile?.name}`);
          const snapshot = await uploadBytes(storageRef, selectedFile);

          await getDownloadURL(snapshot.ref).then(async (downloadURL) => {
            console.log("File available at", downloadURL);

            const Datatobeadded: any = {
              studentUUID: user.uid,
              assignmentId: assignmentid,
              topic,
              instructions,
              selectedpdf: downloadURL,
              totalmarks,
              submissionDate: Date.now(),
            };

            console.log(Datatobeadded);
            const projectDocRef = await addDoc(
              collection(db, `Classrooms/${classid}/submitted_assignment`),
              Datatobeadded
            ).then(() => {
              router.back();
            });
          });
        } catch (error) {
          console.log(error);
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
      <div className="flex flex-col p-2 justify-center mb-5 items-center ">
        <div className={`flex gap-5 `}>
          <div>Topic : {topic}</div>
          <br />
        </div>
        <div className="text-muted-foreground">
          Mark your answer and submit the form
        </div>
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
