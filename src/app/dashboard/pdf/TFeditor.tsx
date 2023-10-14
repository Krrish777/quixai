import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import style from "./styles.module.css";
import { ExclamationTriangleIcon, MagicWandIcon } from "@radix-ui/react-icons";
import TextareaAutosize from "react-textarea-autosize";
import { Button } from "@/components/ui/button";
import { RocketIcon, Sparkles } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { auth, db } from "@/lib/firebase";
import { addDoc, collection } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { usePathname } from "next/navigation";
const predefinedAnswers: string[] = ["TRUE", "FALSE"];

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
  assignmentname: string;
  setFormState: (
    newFormState: "initial" | "loading" | "final" | "Error"
  ) => void;
}

const QuestionEditor: React.FC<ChildProps> = (props) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const pathname = usePathname();
  const params = useParams();
  const user = auth.currentUser;
  useEffect(() => {
    if (props.formState === "final" && props.completion) {
      try {
        console.log(props.completion);
        const normalizedData = props.completion.map((q) => ({
          ...q,
          answer: q.answer.toUpperCase(),
        }));

        setQuestions(normalizedData);
      } catch (error) {
        console.log(props.completion);
        props.setFormState("Error");
      }
    }
  }, [props]);

  const handleAnswerChange = (index: number, selectedAnswer: string) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].answer = selectedAnswer;
    setQuestions(updatedQuestions);
  };

  const handleQuestionChange = (
    index: number,
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].question = event.target.value;
    setQuestions(updatedQuestions);
  };

  const isDataValid = () => {
    return questions.every(
      (q) => q.question.trim() !== "" && predefinedAnswers.includes(q.answer)
    );
  };

  const handleLogEditedJson = () => {
    if (isDataValid()) {
      console.log(questions);
      SendAssignment(questions);
    } else {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "Pls Check the question and answers once again",
      });
      console.log("Invalid data. Please check your questions and answers.");
    }
  };

  async function SendAssignment(questionData: Question[]) {
    const Datatobeadded = {
      createduser: user?.uid,
      assignmentname: props.assignmentname,
      topic: props.topic,
      noquestions: props.noquestions,
      difficulty: props.difficulty,
      Questiontype: props.querydata,
      questionDatatoadd: { questions: questionData },
      totalmarks: props.noquestions,
    };
    if (
      user &&
      user.uid &&
      props.assignmentname &&
      props.formState === "final" &&
      props.completion &&
      props.noquestions &&
      props.topic &&
      props.difficulty !== null &&
      props.querydata === "TF"
    ) {
      try {
        await addDoc(collection(db, `Userassignments`), Datatobeadded);
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
        questions.length > 0 &&
        props.completion && (
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
                {questions.map((q, index) => (
                  <div
                    key={index}
                    className="p-4 border mb-4 w-full rounded-sm"
                  >
                    <div>
                      <TextareaAutosize
                        className="w-full px-2 py-1 mb-2 rounded text-left bg-transparent border-b"
                        value={q.question}
                        onChange={(e) => handleQuestionChange(index, e)}
                      />
                    </div>
                    {predefinedAnswers.map((option) => (
                      <label key={option} className="flex items-center gap-2">
                        <input
                          type="radio"
                          value={option}
                          checked={q.answer === option}
                          onChange={() => handleAnswerChange(index, option)}
                        />
                        {option}
                      </label>
                    ))}
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

export default QuestionEditor;
