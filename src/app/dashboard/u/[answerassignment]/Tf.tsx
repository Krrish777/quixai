import React, { useEffect, useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { auth } from "@/lib/firebase";
import { useParams, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

interface Question {
  question: string;
  answer: string;
}

type SubmittedAssignment = {
  studentUUID: string;
  studentEmail: string;
  studentName: string;
  assignmentId: string;
  scoredMarks: number;
  selectedanswer: any;
  totalmarks: number;
  submissionDate: number;
};

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
    if (
      user &&
      assignmentid &&
      type === "TF" &&
      user.uid &&
      user.email &&
      user.displayName
    ) {
      try {
        const score = calculateScore();

        const assignmentData = questions.map((question, index) => ({
          question: question.question,
          answer: question.answer,
          selectedAnswer: selectedAnswers[index],
        }));

        const Datatobeadded: SubmittedAssignment = {
          studentUUID: user.uid,
          studentEmail: user.email,
          studentName: user.displayName,
          assignmentId: assignmentid as string,
          scoredMarks: score,
          selectedanswer: assignmentData,
          totalmarks,
          submissionDate: Date.now(),
        };

        const projectDocRef = await addDoc(
          collection(db, `Userssubmitted_assignment`),
          Datatobeadded
        );
        router.back();
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: "There was a problem with your request.",
        });
      }
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
    <>
      {topic && questions && selectedAnswers && (
        <div className="p-4">
          <div className="flex flex-col p-2 justify-center mb-5 items-center text-center">
            <div>Topic : {topic}</div>

            <div>
              Mark your answer and submit the form
            </div>
          </div>
          {questions.map((question, index) => (
            <div key={index} className="mb-4 bg-muted p-4 rounded-lg">
              <div className="mb-2">{question.question}</div>
              <div>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name={`q${index}`}
                    value="TRUE"
                    checked={selectedAnswers[index] === "TRUE"}
                    onChange={() => handleOptionChange(index, "TRUE")}
                    className=" mr-2"
                  />
                  <span className="">True</span>
                </label>
                <label className="inline-flex items-center ml-4">
                  <input
                    type="radio"
                    name={`q${index}`}
                    value="FALSE"
                    checked={selectedAnswers[index] === "FALSE"}
                    onChange={() => handleOptionChange(index, "FALSE")}
                    className=" mr-2"
                  />
                  <span className="">False</span>
                </label>
              </div>
            </div>
          ))}
          <Button onClick={Sendassignment}>Submit Answers</Button>
        </div>
      )}
    </>
  );
};

export default Qid;
