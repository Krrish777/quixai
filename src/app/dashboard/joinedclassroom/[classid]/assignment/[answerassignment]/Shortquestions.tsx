import React, { useEffect, useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { auth } from "@/lib/firebase";
import { useParams, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FunctionCallHandler } from "ai";
import { useChat } from "ai/react";

interface Question {
  question: string;
  answer: string;
}

interface QidProps {
  questions: Question[];
  totalmarks: number;
  topic: string;
}
interface aimarks {
  marks: number;
  remarks: string;
}

const Shortquestions: React.FC<QidProps> = ({
  questions,
  totalmarks,
  topic,
}) => {
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [aigrades, setaigrades] = useState<aimarks[]>([]);
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

  const functionCallHandler: FunctionCallHandler = async (
    chatMessages,
    functionCall
  ) => {
    if (functionCall.name === "assign_marks_for_each_studentAnswer") {
      if (functionCall.arguments) {
        const parsedFunctionCallArguments = JSON.parse(functionCall.arguments);
        console.log(parsedFunctionCallArguments);
        const marks = parsedFunctionCallArguments.grade;
        setaigrades(marks);
        // console.log(marks);
      }
    }
  };

  const { append, setMessages, messages, isLoading } = useChat({
    experimental_onFunctionCall: functionCallHandler,
    api: `/api/correctassignment`,
    onResponse: (res) => {
      console.log("started");
      if (res.status === 429) {
        console.log("You are being rate limited. Please try again later.");
      }
    },
    onFinish: () => {
      console.log("Successfully generated completion!");
    },
    onError: () => {
      console.log("There was a Error in your request");
    },
  });

  async function Sendassignment() {
    console.log(selectedAnswers);

    if (user && classid && assignmentid && type === "Shortquestions") {
      const datatobevalidated = questions.map((question, index) => ({
        // question: question.question,
        Correctanswer: question.answer,
        studentAnswer: selectedAnswers[index],
      }));
      console.log(datatobevalidated);
      const prompt = `do strict comparing of Correctanswer with studentAnswer and assign grade for each between 0 and 5 with 5 words of remarks ${JSON.stringify(
        datatobevalidated
      )}`;

      await append({ content: prompt, role: "user" }).then(() => {
        setMessages([]);
        const score: aimarks[] = aigrades;

        // console.log(score);
        const Datatobeadded = questions.map((question, index) => ({
          question: question.question,
          correctanswer: question.answer,
          selectedAnswer: selectedAnswers[index],
          aimarks: score[index].marks,
          remarks: score[index].remarks,
        }));

        // console.log(Datatobeadded);
      });

      // const Datatobeadded: any = {
      //   studentUUID: user.uid,
      //   assignmentId: assignmentid,
      //   scoredMarks: score,
      //   selectedanswer: assignmentData,
      //   totalmarks,
      //   submissionDate: Date.now(),
      // };

      // const projectDocRef = await addDoc(
      //   collection(db, `Classrooms/${classid}/submitted_assignment`),
      //   Datatobeadded
      // );

      // router.back();
    } else {
      console.log("No user is currently authenticated or classid is missing");
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

export default Shortquestions;

// const prompt = `
// do strict comparing of answer with studentAnswer and assign grade between 0 and 5 for each question

//  with 5 words of remarks
//  [
//    {
//      "question": "What is Prim's algorithm?",
//      "answer": "Prim's algorithm is a greedy algorithm used to find the minimum spanning tree of a connected weighted graph.",
//      "studentAnswer": ""
//    },
//    {
//      "question": "What is a minimum spanning tree?",
//      "answer": "A minimum spanning tree of a graph is a subgraph that spans all the vertices with the minimum possible total edge weight.",
//      "studentAnswer": "It's a tree with the minimum edge weight."
//    },
//    {
//      "question": "How does Prim's algorithm select the initial vertex?",
//      "answer": "Prim's algorithm typically starts with an arbitrary vertex as the initial vertex.",
//      "studentAnswer": "Prim's algorithm chooses the vertex with the maximum weight."
//    },
//    {
//      "question": "What is the main idea behind Prim's algorithm?",
//      "answer": "The main idea is to grow the minimum spanning tree incrementally by adding the edge with the smallest weight that connects a vertex in the tree to a vertex outside the tree.",
//      "studentAnswer": ""
//    },
//  ]
//  `;
