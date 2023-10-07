import React, { useEffect, useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { auth } from "@/lib/firebase";
import { useParams, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface Question {
  question: string;
  answer: string;
}

interface QidProps {
  questions: Question[];
  totalmarks: number;
  topic: string;
}

const Qid: React.FC<QidProps> = ({ questions, totalmarks, topic }) => {
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const router = useRouter();
  const user = auth.currentUser;
  const params = useParams();
  const classid = params.classid;
  const assignmentid = params.answerassignment;
  const searchParams = useSearchParams();
  const type = searchParams.get("type");

  useEffect(() => {
    setSelectedAnswers(Array(questions.length).fill(""));
  }, [questions]);

  const handleAnswerChange = (questionIndex: number, answer: string) => {
    const updatedSelectedAnswers = [...selectedAnswers];
    updatedSelectedAnswers[questionIndex] = answer;
    setSelectedAnswers(updatedSelectedAnswers);
  };

  async function Sendassignment() {
    console.log(selectedAnswers);
    if (user && classid && assignmentid && type === "Fillinblanks") {
      const score = calculateScore();

      const assignmentData = questions.map((question, index) => ({
        question: question.question,
        answer: question.answer,
        selectedAnswer: selectedAnswers[index],
      }));

      const Datatobeadded: any = {
        studentUUID: user.uid,
        assignmentId: assignmentid,
        scoredMarks: score,
        selectedanswer: assignmentData,
        totalmarks,
        submissionDate: Date.now(),
      };

      const projectDocRef = await addDoc(
        collection(db, `Classrooms/${classid}/submitted_assignment`),
        Datatobeadded
      );

      router.back();
    } else {
      console.log("No user is currently authenticated or classid is missing");
    }
  }

  const calculateScore = () => {
    let score = 0;
    questions.forEach((question, index) => {
      if (
        selectedAnswers[index].trim().toLowerCase() ===
        question.answer.trim().toLowerCase()
      ) {
        score++;
      }
    });
    return score;
  };

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
      {selectedAnswers.length === questions.length &&
        questions.map((question, index) => (
          <div key={index} className="mb-4 bg-muted p-4 rounded-lg">
            <div className="mb-2">{question.question}</div>
            <input
              type="text"
              placeholder="Your answer here"
              value={selectedAnswers[index]}
              onChange={(e) => handleAnswerChange(index, e.target.value)}
              className="p-2 border  rounded w-full"
            />
          </div>
        ))}
      <Button onClick={Sendassignment}>Submit Answers</Button>
    </div>
  );
};

export default Qid;
