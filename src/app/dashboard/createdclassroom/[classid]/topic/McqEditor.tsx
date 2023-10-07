import React, { useState, useEffect } from "react";
import TextareaAutosize from "react-textarea-autosize";
import style from "./styles.module.css";
import { Button } from "@/components/ui/button";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useParams } from "next/navigation";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { RocketIcon, Sparkles } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

type Question = {
  question: string;
  options: string[];
  answer: string;
};

interface ChildProps {
  formState: "initial" | "loading" | "final" | "Error";
  completion: Question[];
  querydata: string | null;
  topic: string;
  noquestions: number | null;
  difficulty: string;
  setFormState: (
    newFormState: "initial" | "loading" | "final" | "Error"
  ) => void;
  assignmentname: string;
}

const McqEditor: React.FC<ChildProps> = (props) => {
  const [questionData, setQuestionData] = useState<Question[]>([]);
  const params = useParams();
  const classid = params.classid;

  useEffect(() => {
    if (props.formState === "final" && props.completion) {
      try {
        setQuestionData(props.completion);
      } catch (error) {
        console.error(error);
        props.setFormState("Error");
      }
    }
  }, [props]);

  const handleQuestionChange = (index: number, newValue: string) => {
    const updatedQuestions = questionData.map((question, i) =>
      i === index ? { ...question, question: newValue } : question
    );
    setQuestionData(updatedQuestions);
  };

  const handleOptionChange = (
    questionIndex: number,
    optionIndex: number,
    newValue: string
  ) => {
    const updatedQuestions = questionData.map((question, i) =>
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
    setQuestionData(updatedQuestions);
  };

  const handleAnswerChange = (index: number, newValue: string) => {
    const updatedQuestions = questionData.map((question, i) =>
      i === index && question.options.includes(newValue)
        ? { ...question, answer: newValue }
        : question
    );
    setQuestionData(updatedQuestions);
  };

  const handleLogEditedJson = () => {
    const isAllAnswersValid = questionData.every((question) =>
      question.options.includes(question.answer)
    );

    if (isAllAnswersValid) {
      SendAssignment(questionData);
      console.log(questionData);
    } else {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "Pls Check the question and answers once again",
      });
      console.log("Please make sure all answers are valid.");
    }
  };

  async function SendAssignment(questionData: Question[]) {
    const Datatobeadded = {
      assignmentname: props.assignmentname,
      topic: props.topic,
      noquestions: props.noquestions,
      difficulty: props.difficulty,
      Questiontype: props.querydata,
      questionDatatoadd: { questions: questionData },
      totalmarks: props.noquestions,
    };
    if (
      props.assignmentname &&
      props.formState === "final" &&
      props.completion &&
      props.noquestions &&
      props.topic &&
      props.difficulty !== null &&
      props.querydata === "Mcq"
    ) {
      try {
        await addDoc(
          collection(db, `Classrooms/${classid}/Assignment`),
          Datatobeadded
        );
        props.setFormState("initial");
      } catch (error) {
        console.error(error);
        props.setFormState("Error");
      }
    } else {
      console.log(Datatobeadded);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem with your request.",
      });
      props.setFormState("Error");
    }
  }

  return (
    <div className={`place-items-center grid ${style.grd2}`}>
      {props.formState == "initial" && (
        <div className=" relative text-center mt-10  ">
          <div
            className="animate-bounce absolute top-0"
            style={{
              animation: "bounce 2s infinite",
            }}
          >
            <RocketIcon className="w-6 h-6 text-muted-foreground " />
          </div>
          <div className="m-5 ml-6">
            Enter the Topic and Watch the Magic Unfold !!!
          </div>
        </div>
      )}
      {props.formState === "loading" && props.noquestions && (
        <div className="flex flex-col  gap-5 w-full">
          {Array.from({ length: props.noquestions }).map((_, index) => (
            <div
              className="flex flex-col  gap-5 space-x-4  border p-3 rounded-lg w-full"
              key={index}
            >
              <div className="flex items-center space-x-4 ml-3">
                <Skeleton className="h-12 w-12 rounded-full " />
                <div className="space-y-2 w-full">
                  <Skeleton className="h-5 w-[90%] " />
                  <Skeleton className="h-5 w-[80%] " />
                </div>
              </div>
              <div className="flex items-center gap-4 ml-0">
                <Skeleton className="h-8 w-8 rounded-lg  ml-0" />
                <Skeleton className="h-6 w-[50%] " />
              </div>
              <div className="flex items-center gap-4 ml-0">
                <Skeleton className="h-8 w-8 rounded-lg  " />
                <Skeleton className="h-6 w-[50%] " />
              </div>
              <div className="flex items-center gap-4 ml-0">
                <Skeleton className="h-8 w-8 rounded-lg  " />
                <Skeleton className="h-6 w-[50%] " />
              </div>
            </div>
          ))}
        </div>
      )}
      {props.formState === "final" &&
        props.completion &&
        questionData.length > 0 && (
          <div>
            <div className="flex flex-col p-2 justify-center mb-5 items-center ">
              <div className={`flex gap-5 ${style.names}`}>
                <div>Topic : {props.topic}</div>
                <br />
              </div>
              <div className="text-muted-foreground">
                Edit and save the form to submit
              </div>
            </div>
            <div
              className={`flex items-center justify-center flex-col ${style.cont}`}
            >
              {questionData.map((question, questionIndex) => (
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
                        onChange={() =>
                          handleAnswerChange(questionIndex, option)
                        }
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
              <div
                className={`flex flex-row items-center gap-5 justify-around mb-10 ${style.btn}`}
              >
                <div className="text-muted-foreground text-center">
                  Your changes will be saved, and the assignment will be posted
                  to students
                </div>
                <div>
                  <Button
                    onClick={handleLogEditedJson}
                    className={`mr-4 ${style.btt}`}
                  >
                    Save&nbsp;Your&nbsp;Changes
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      {props.formState === "Error" && (
        <div className=" relative text-center mt-10">
          <div
            className="animate-bounce absolute top-0"
            style={{
              animation: "bounce 2s infinite",
            }}
          >
            <ExclamationTriangleIcon className="w-6 h-6 text-muted-foreground rotate-12" />
          </div>
          <div className="m-5 ml-6 ">
            There was a error with your Request !!!
          </div>
        </div>
      )}
    </div>
  );
};

export default McqEditor;
