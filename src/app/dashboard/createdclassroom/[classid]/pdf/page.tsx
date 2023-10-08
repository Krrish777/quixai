"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Separator } from "@/components/ui/separator";
import * as z from "zod";
import { set, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import styles from "./styles.module.css";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useChat } from "ai/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useSearchParams } from "next/navigation";
import McqEditor from "./McqEditor";
import { useEffect, useState } from "react";
import TFEditor from "./TFeditor";
import FillinblanksEditor from "./FillinblanksEditor";
import { FunctionCallHandler } from "ai";
import { storage } from "@/lib/firebase";
import { ref } from "@firebase/storage";
import { getDownloadURL, uploadBytes } from "firebase/storage";
import axios from "axios";
import { toast } from "@/components/ui/use-toast";

type Question = {
  question: string;
  options: string[];
  answer: string;
};

interface TF {
  question: string;
  answer: string;
}

const formSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: "Topic must be at least 2 characters.",
    })
    .max(40, {
      message: "Topic must be at most 40 characters.",
    }),
  file: z.instanceof(File),
  topic: z
    .string()
    .min(2, {
      message: "Topic must be at least 2 characters.",
    })
    .max(40, {
      message: "Topic must be at most 40 characters.",
    }),
  noquestions: z.coerce
    .number()
    .gte(1, {
      message: "Number of questions must be at least 1.",
    })
    .lte(10, {
      message: "Max Number of questions is 10.",
    }),
  difficulty: z.string(),
});

export default function ProfileForm() {
  const [formState, setFormState] = useState<
    "initial" | "loading" | "final" | "Error"
  >("initial");
  const searchParams = useSearchParams();
  const querydata = searchParams.get("type");
  const [topic, settopic] = useState<string>("");
  const [assignmentname, setassignmentname] = useState<string>("");
  const [noquestions, setnoquestions] = useState<number>(1);
  const [difficulty, setdifficulty] = useState<string>("");
  const [Mcqarray, setMcqarray] = useState<Question[]>([]);
  const [TFarray, setTFarray] = useState<TF[]>([]);
  const [FIBarray, setFIBarray] = useState<TF[]>([]);
  const [text, settext] = useState<string>("");

  useEffect(() => {
    setFormState("initial");
    setMcqarray([]);
    setTFarray([]);
    setFIBarray([]);
  }, [querydata]);

  const functionCallHandler: FunctionCallHandler = async (
    chatMessages,
    functionCall
  ) => {
    if (functionCall.name === "create_mcq") {
      if (functionCall.arguments) {
        const parsedFunctionCallArguments = JSON.parse(functionCall.arguments);
        const questionsArray = parsedFunctionCallArguments.questions;

        setMcqarray(questionsArray);

        console.log(parsedFunctionCallArguments);
      }
    } else if (functionCall.name === "create_true_or_false") {
      if (functionCall.arguments) {
        console.log(functionCall.arguments);
        const parsedFunctionCallArguments = JSON.parse(functionCall.arguments);
        const questionsArray = parsedFunctionCallArguments.questions;

        setTFarray(questionsArray);

        console.log(parsedFunctionCallArguments);
      }
    } else if (functionCall.name === "Create_fill_in_the_blanks") {
      if (functionCall.arguments) {
        console.log(functionCall.arguments);
        const parsedFunctionCallArguments = JSON.parse(functionCall.arguments);
        const questionsArray = parsedFunctionCallArguments.questions;

        setFIBarray(questionsArray);

        console.log(parsedFunctionCallArguments);
      }
    }
  };

  const { append, setMessages, isLoading } = useChat({
    experimental_onFunctionCall: functionCallHandler,
    api: `/api/${querydata}`,
    onResponse: (res) => {
      setFormState("loading");
      if (res.status === 429) {
        console.log("You are being rate limited. Please try again later.");
      }
    },
    onFinish: () => {
      setFormState("final");
      console.log("Successfully generated completion!");
    },
    onError: () => {
      setFormState("Error");
      console.log("There was a Error in your request");
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      topic: "",
      noquestions: 1,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setFormState("loading");
    settopic(values.topic);
    setnoquestions(values.noquestions);
    setdifficulty(values.difficulty);
    setassignmentname(values.name);

    console.log(values.file);

    const allowedTypes = ["application/pdf"];

    if (values.file && !allowedTypes.includes(values.file.type)) {
      toast({
        variant: "destructive",
        title: "Unsuported file",
        description: "Upload only pdf files",
      });
      setFormState("Error");
      return;
    }

    try {
      const storageRef = ref(storage, `pdf/${values.file.name}`);
      const snapshot = await uploadBytes(storageRef, values.file);

      await getDownloadURL(snapshot.ref).then(async (downloadURL) => {
        console.log("File available at", downloadURL);
        await axios
          .post("/api/Extracttext", { downloadURL })
          .then(async (respos) => {
            settext(respos.data);
            console.log(respos.data)
            if (querydata === "Mcq") {
              const prompt = `extract the text related to the topic ${values.topic} and create ${values.noquestions} ${values.difficulty} mcq questions the text is = ${respos.data.extractedString}`;
              setMessages([]);
              await append({ content: prompt, role: "user" });
            } else if (querydata === "TF") {
              const prompt = `extract the text related to the topic ${values.topic} and create ${values.noquestions} ${values.difficulty} true or false questions the text is = ${respos.data.extractedString}`;
              setMessages([]);
              await append({ content: prompt, role: "user" });
            } else if (querydata === "Fillinblanks") {
              const prompt = `extract the text related to the topic ${values.topic} and create ${values.noquestions} ${values.difficulty} Fill in the blanks questions the text is = ${respos.data.extractedString}`;
              setMessages([]);
              await append({ content: prompt, role: "user" });
            } else {
              toast({
                variant: "destructive",
                title: "Uh oh! Something went wrong.",
                description: "There was a problem with your request.",
              });
            }
          });
      });
    } catch (error) {
      console.log(error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem with your request.",
      });
    }
  }

  return (
    <div className={`${styles.grd} mt-3`}>
      <div className={`p-1 ${styles.grd1} `}>
        <div className="space-y-3">
          <div>
            <h3 className="text-lg font-medium">Pdf</h3>
            <p className="text-sm text-muted-foreground">
              Create Quix from just Pdf
            </p>
          </div>
          <Separator className="w-3/6" />
        </div>
        <div className={styles.maxcont}>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Questions</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Ex:Assignment 6"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter ther Assignment name
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Enter the topic name</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Enter the topic to find in the text."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter the topic related to the text
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="file"
                render={({ field: { value, onChange, ...fieldProps } }) => (
                  <FormItem>
                    <FormLabel>Text</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        placeholder="Select a pdf file"
                        {...fieldProps}
                        onChange={(event) =>
                          onChange(event.target.files && event.target.files[0])
                        }
                      />
                    </FormControl>
                    <FormDescription>Select a pdf file</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="noquestions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Questions</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter number of questions"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      This is the number of questions you want.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="difficulty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Difficulty</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Difficulty" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">medium</SelectItem>
                        <SelectItem value="hard">hard</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Controll the difficulty of the questions
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                disabled={isLoading}
                className={`${styles.btsub}`}
              >
                Submit
              </Button>
            </form>
          </Form>
        </div>
      </div>
      {querydata === "Mcq" ? (
        <McqEditor
          formState={formState}
          completion={Mcqarray}
          querydata={querydata}
          topic={topic}
          noquestions={noquestions}
          difficulty={difficulty}
          setFormState={setFormState}
          assignmentname={assignmentname}
        />
      ) : querydata === "TF" ? (
        <TFEditor
          difficulty={difficulty}
          noquestions={noquestions}
          topic={topic}
          querydata={querydata}
          completion={TFarray}
          formState={formState}
          setFormState={setFormState}
          assignmentname={assignmentname}
        />
      ) : querydata === "Fillinblanks" ? (
        <FillinblanksEditor
          difficulty={difficulty}
          noquestions={noquestions}
          topic={topic}
          querydata={querydata}
          completion={FIBarray}
          formState={formState}
          setFormState={setFormState}
          assignmentname={assignmentname}
        />
      ) : null}
    </div>
  );
}
