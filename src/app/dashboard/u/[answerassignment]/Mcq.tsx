"use client";

import React, { useEffect, useState } from "react";
import { addDoc, collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { auth } from "@/lib/firebase";
import { useParams, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface Question {
  question: string;
  options: string[];
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

  const handleOptionChange = (
    questionIndex: number,
    selectedOption: string
  ) => {
    const updatedSelectedAnswers = [...selectedAnswers];
    updatedSelectedAnswers[questionIndex] = selectedOption;
    setSelectedAnswers(updatedSelectedAnswers);
  };

  async function Sendassignment() {
    const score = calculateScore();
    if (user && assignmentid && type === "Mcq") {
      const assignmentData = questions.map((question, index) => ({
        question: question.question,
        options: question.options,
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

      console.log(Datatobeadded);
      const projectDocRef = await addDoc(
        collection(db, `Userssubmitted_assignment`),
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
      if (selectedAnswers[index] === question.answer) {
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
      {questions.map((question, index) => (
        <div key={index} className="mb-4 bg-muted p-4 rounded-lg">
          <div className="mb-2">{question.question}</div>
          <div>
            {question.options.map((option, optionIndex) => (
              <div key={optionIndex} className="mb-2">
                <input
                  type="radio"
                  id={`q${index}-option${optionIndex}`}
                  name={`q${index}`}
                  value={option}
                  checked={selectedAnswers[index] === option}
                  onChange={() => handleOptionChange(index, option)}
                  className="mr-2"
                />
                <label
                  htmlFor={`q${index}-option${optionIndex}`}
                  className="cursor-pointer"
                >
                  {option}
                </label>
              </div>
            ))}
          </div>
        </div>
      ))}
      <Button onClick={Sendassignment}>Submit Answers</Button>
    </div>
  );
};

export default Qid;
