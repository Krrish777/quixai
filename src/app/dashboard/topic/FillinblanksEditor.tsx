import React, { useState, ChangeEvent, useEffect } from "react";
import style from "./styles.module.css";
import { Button } from "@/components/ui/button";
import { ExclamationTriangleIcon, MagicWandIcon } from "@radix-ui/react-icons";
import { RocketIcon, Sparkles } from "lucide-react";
import TextareaAutosize from "react-textarea-autosize";
import { addDoc, collection } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { toast } from "@/components/ui/use-toast";
import { User as FirebaseUser } from "firebase/auth";

interface Question {
  question: string;
  answer: string;
}

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
}

const FillinblanksEditor: React.FC<ChildProps> = (props: ChildProps) => {
  const [editedData, setEditedData] = useState<Question[]>([]);
  const [user, setUser] = useState<FirebaseUser | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        setUser(authUser);
      } else {
        setUser(null);
      }
    });

    if (props.formState === "final" && props.completion) {
      try {
        const normalizedData = props.completion.map((q) => ({
          ...q,
          answer:
            q.answer.charAt(0).toUpperCase() + q.answer.slice(1).toLowerCase(),
        }));

        setEditedData(normalizedData);
      } catch (error) {
        console.log(props.completion);
        props.setFormState("Error");
      }
    }
    return () => {
      unsubscribe();
    };
  }, [props]);

  const handleQuestionChange = (
    index: number,
    event: ChangeEvent<HTMLTextAreaElement>
  ) => {
    const updatedData = [...editedData];
    updatedData[index].question = event.target.value;
    setEditedData(updatedData);
  };

  const handleAnswerChange = (
    index: number,
    event: ChangeEvent<HTMLTextAreaElement>
  ) => {
    const updatedData = [...editedData];
    updatedData[index].answer = event.target.value;
    setEditedData(updatedData);
  };

  const handleLogEditedJson = () => {
    try {
      const isValid = editedData.every(
        (item) =>
          item.hasOwnProperty("question") && item.hasOwnProperty("answer")
      );

      if (isValid) {
        SendAssignment(editedData);
      } else {
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: "Pls Check the question and answers once again",
        });
        console.error(
          "Invalid JSON: Each object should have 'question' and 'answer' properties."
        );
      }
    } catch (error) {
      console.error("Invalid JSON:", error);
    }
  };

  async function SendAssignment(questionData: Question[]) {
    const Datatobeadded = {
      topic: props.topic,
      noquestions: props.noquestions,
      difficulty: props.difficulty,
      Questiontype: props.querydata,
      questionDatatoadd: { questions: questionData },
      totalmarks: props.noquestions,
      Creatorid: user?.uid,
    };
    if (
      props.formState === "final" &&
      props.completion &&
      user &&
      props.noquestions != null &&
      props.topic !== "" &&
      props.difficulty !== null &&
      props.querydata === "Fillinblanks"
    ) {
      try {
        await addDoc(
          collection(db, `Userassignments`),
          Datatobeadded
        );
        props.setFormState("initial");
      } catch (error) {
        console.error(error);
        props.setFormState("Error");
      }
    } else {
      console.log("There was an error with saving the details");
      props.setFormState("Error");
    }
  }

  return (
    <div className="place-items-center grid">
      {props.formState === "initial" && (
        <div className=" relative text-center mt-10">
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
      {props.formState === "loading" && (
        <div className=" relative text-center mt-10">
          <div
            className="animate-bounce absolute top-0"
            style={{
              animation: "bounce 2s infinite",
            }}
          >
            <Sparkles className="w-6 h-6 text-muted-foreground" />
          </div>
          <div className="m-5 ml-6 ">Preapring Your Request !!!</div>
        </div>
      )}
      {props.formState === "final" &&
        props.completion &&
        editedData.length > 0 && (
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
              <div className="container mx-auto p-4">
                {editedData.map((item, index) => (
                  <div
                    key={index}
                    className="p-4 border mb-4 w-full rounded-sm flex flex-col"
                  >
                    <TextareaAutosize
                      className="w-full px-2 py-1 mb-2 rounded text-left bg-transparent border-b"
                      value={item.question}
                      onChange={(e) => handleQuestionChange(index, e)}
                    />
                    <div className="flex flex-row gap-2">
                      {" "}
                      <div className="text-gray-600 mt-2 leading-1">
                        Answer:
                      </div>
                      <TextareaAutosize
                        className="w-full px-2 py-1 mb-2 rounded text-left bg-transparent"
                        value={item.answer}
                        onChange={(e) => handleAnswerChange(index, e)}
                      />
                    </div>
                  </div>
                ))}
              </div>

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
    </div>
  );
};

export default FillinblanksEditor;
