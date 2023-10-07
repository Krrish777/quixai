"use client";

import React, { useState, useEffect } from "react";
import TextareaAutosize from "react-textarea-autosize";
import style from "./styles.module.css";
import { Button } from "@/components/ui/button";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useParams } from "next/navigation";

type Question = {
  question: string;
  options: string[];
  answer: string;
}[];
interface ChildProps {
  formState: "initial" | "loading" | "final";
  completion: string;
}

const QuestionEditor: React.FC<ChildProps> = (props: ChildProps) => {
  const [questionData, setQuestionData] = useState<{ questions: Question }>({
    questions: [],
  });
  const params = useParams();
  const classid = params.classid;

  useEffect(() => {
    if (props.formState === "final" && props.completion) {
      setQuestionData(JSON.parse(props.completion));
    }
  }, [props.formState, props.completion]);

  useEffect(() => {
    setQuestionData({
      questions: [
        {
          question:
            "Prim's algorithm is used for finding the minimum _________ in a connected weighted graph.",
          options: ["spanning tree", "path", "cycle", "node"],
          answer: "spanning tree",
        },
        {
          question:
            "In Prim's algorithm, the process starts with the selection of a _________.",
          options: [
            "random node",
            "node with highest weight",
            "node with lowest weight",
            "central node",
          ],
          answer: "node with lowest weight",
        },
        {
          question: "In Prim's algorithm, the selected nodes form a _________.",
          options: ["cycle", "spanning tree", "heap", "graph"],
          answer: "spanning tree",
        },
        {
          question:
            "Prim's algorithm works for both ________ and ________ graphs.",
          options: [
            "connected, unweighted",
            "disconnected, weighted",
            "connected, weighted",
            "disconnected, unweighted",
          ],
          answer: "connected, weighted",
        },
        {
          question:
            "The main idea behind Prim's algorithm is to select edges that have the _________.",
          options: [
            "highest weight",
            "lowest weight",
            "longest distance",
            "shortest distance",
          ],
          answer: "lowest weight",
        },
        {
          question:
            "Prim's algorithm guarantees the construction of a minimum _________ of the given graph.",
          options: ["cycle", "path", "heap", "spanning tree"],
          answer: "spanning tree",
        },
        {
          question:
            "In Prim's algorithm, the time complexity is primarily determined by the ________ operation.",
          options: ["addition", "subtraction", "comparison", "multiplication"],
          answer: "comparison",
        },
        {
          question:
            "Which data structure is commonly used to implement Prim's algorithm?",
          options: ["stack", "queue", "linked list", "priority queue"],
          answer: "priority queue",
        },
        {
          question: "Prim's algorithm was proposed by which mathematician?",
          options: ["Kruskal", "Dijkstra", "Floyd", "Prim"],
          answer: "Prim",
        },
        {
          question:
            "Prim's algorithm is a greedy algorithm that grows a _________.",
          options: ["spanning tree", "path", "cycle", "subgraph"],
          answer: "spanning tree",
        },
      ],
    });
  }, []);

  const handleQuestionChange = (index: number, newValue: string) => {
    const updatedQuestions = questionData.questions.map((question, i) =>
      i === index ? { ...question, question: newValue } : question
    );
    setQuestionData((prevData) => ({
      ...prevData,
      questions: updatedQuestions,
    }));
  };

  const handleOptionChange = (
    questionIndex: number,
    optionIndex: number,
    newValue: string
  ) => {
    const updatedQuestions = questionData.questions.map((question, i) =>
      i === questionIndex
        ? {
            ...question,
            options: question.options.map((option, j) =>
              j === optionIndex ? newValue : option
            ),
            answer:
              question.answer === question.options[optionIndex]
                ? newValue
                : question.answer,
          }
        : question
    );
    setQuestionData((prevData) => ({
      ...prevData,
      questions: updatedQuestions,
    }));
  };

  const handleAnswerChange = (index: number, newValue: string) => {
    const updatedQuestions = questionData.questions.map((question, i) =>
      i === index && question.options.includes(newValue)
        ? { ...question, answer: newValue }
        : question
    );
    setQuestionData((prevData) => ({
      ...prevData,
      questions: updatedQuestions,
    }));
  };

  const handleLogEditedJson = () => {
    const isAllAnswersValid = questionData.questions.every((question) =>
      question.options.includes(question.answer)
    );

    if (isAllAnswersValid) {
      Sendassignment(questionData);
      console.log(JSON.stringify(questionData, null, 2));
      console.log(questionData);
    } else {
      console.log("Please make sure all answers are valid.");
    }
  };
  async function Sendassignment(Datatobeadded: { questions: Question }) {
    //change
    // if (props.formState === "final" && props.completion) {
      if(true){
      const projectDocRef = await addDoc(
        collection(db, `Classrooms/${classid}/Assignment`),
        Datatobeadded
      );
    } else {
      console.log("No user is currently authenticated or classid is missing");
    }
  }

  return (
    <div className="place-items-center grid">
      {props.formState === "initial" && <p>Initial State</p>}
      {props.formState === "loading" && <p>Loading State</p>}
      {props.formState != "final" && (
        <div>
          <div className="flex flex-col p-2 justify-center mb-5 items-center ">
            <div className={`flex gap-5 ${style.names}`}>
              <div>Topic : Prims algorithm</div>
              <div> For class : Bca A2</div>
              <div>Difficulty : Easy</div>
            </div>
            <div className="text-muted-foreground">
              Edit and save the form to submit
            </div>
          </div>
          <div
            className={`flex items-center justify-center flex-col ${style.cont}`}
          >
            {questionData.questions.map((question, questionIndex) => (
              <div
                key={questionIndex}
                className="p-4 border mb-4 w-full rounded-sm"
              >
                <TextareaAutosize
                  className="w-full px-2 py-1 mb-2 rounded text-left bg-transparent border-b"
                  value={question.question}
                  onChange={(e) =>
                    handleQuestionChange(questionIndex, e.target.value)
                  }
                />
                {question.options.map((option, optionIndex) => (
                  <div key={optionIndex} className="flex items-center">
                    <input
                      type="radio"
                      name={`answer-${questionIndex}`}
                      value={option}
                      checked={question.answer === option}
                      onChange={() => handleAnswerChange(questionIndex, option)}
                    />
                    <input
                      type="text"
                      className="w-full px-2 py-1 mr-2 rounded bg-transparent"
                      value={option}
                      onChange={(e) =>
                        handleOptionChange(
                          questionIndex,
                          optionIndex,
                          e.target.value
                        )
                      }
                    />
                  </div>
                ))}
                <div className="text-gray-600 mt-2">
                  Selected Answer: {question.answer}
                </div>
              </div>
            ))}
            <div className="flex flex-row items-center gap-5  justify-around mb-10">
              <div className="text-muted-foreground">
                Your changes will be saved and assignemt will be posted to
                students
              </div>
              <div>
                <Button onClick={handleLogEditedJson}>Save Your Changes</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionEditor;
