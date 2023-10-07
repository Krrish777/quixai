"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Separator } from "@/components/ui/separator";
import * as z from "zod";
import { set, useForm } from "react-hook-form";
import { Button, buttonVariants } from "@/components/ui/button";
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
import McqEditor from "./McqEditor";
import { useEffect, useState } from "react";
import TFEditor from "./TFeditor";
import FillinblanksEditor from "./FillinblanksEditor";
import { FunctionCallHandler } from "ai";
import { cn } from "@/lib/utils";

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
  topic: z
    .string()
    .min(5, {
      message: "Topic must be at least 5 characters.",
    })
    .max(30, {
      message: "Topic must be at most 15 characters.",
    }),
  noquestions: z.coerce
    .number()
    .gte(3, {
      message: "Number of questions must be at least 3.",
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

  const [topic, settopic] = useState<string>("");
  const [noquestions, setnoquestions] = useState<number>(3);
  const [difficulty, setdifficulty] = useState<string>("");
  const [type, settype] = useState("Mcq");
  const [Mcqarray, setMcqarray] = useState<Question[]>([]);
  const [TFarray, setTFarray] = useState<TF[]>([]);
  const [FIBarray, setFIBarray] = useState<TF[]>([]);

  useEffect(() => {
    setFormState("initial");
    setMcqarray([]);
    setTFarray([]);
    setFIBarray([]);
  }, []);

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
    api: `/api/${type}`,
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
      // topic: "",
      // noquestions: 3,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    setFormState("initial");
    settopic(values.topic);
    setnoquestions(values.noquestions);
    setdifficulty(values.difficulty);

    if (type === "Mcq") {
      const prompt = `create ${values.noquestions} ${values.difficulty} mcq about topic ${values.topic}`;
      setMessages([]);
      await append({ content: prompt, role: "user" });
    } else if (type === "TF") {
      const prompt = `create ${values.noquestions} ${values.difficulty} true or false questions about topic ${values.topic}`;
      setMessages([]);
      await append({ content: prompt, role: "user" });
    } else if (type === "Fillinblanks") {
      const prompt = `create ${values.noquestions} ${values.difficulty} Fill in the blanks question about topic ${values.topic}`;
      setMessages([]);
      await append({ content: prompt, role: "user" });
    }
  }

  return (
    /////add stop
    <div className={`${styles.grd} mt-3`}>
      <div className={`p-1 ${styles.grd1}`}>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">Topic</h3>
            <p className="text-sm text-muted-foreground">
              Create Quix from just Topic name
            </p>
          </div>
          <div
            className={`flex space-x-2 inline-flex  justify-center rounded-md bg-muted p-1 text-muted-foreground place-items-center ${styles.tabs} mb-3`}
          >
            <div
              onClick={() => {
                settype("Mcq");
                setFormState("initial");
              }}
              className={cn(
                buttonVariants({ variant: "ghost" }),
                type === "Mcq"
                  ? "hover:bg-muted bg-background text-foreground shadow-sm"
                  : "hover:bg-transparent ",
                "justify-start cursor-pointer"
              )}
            >
              Mcq
            </div>
            <div
              onClick={() => {
                settype("TF");
                setFormState("initial");
              }}
              className={cn(
                buttonVariants({ variant: "ghost" }),
                type === "TF"
                  ? "hover:bg-muted bg-background text-foreground shadow-sm"
                  : "hover:bg-transparent ",
                "justify-start cursor-pointer "
              )}
            >
              True or false
            </div>
            <div
              onClick={() => {
                settype("Fillinblanks");
                setFormState("initial");
              }}
              className={cn(
                buttonVariants({ variant: "ghost" }),
                type === "Fillinblanks"
                  ? "hover:bg-muted bg-background text-foreground shadow-sm"
                  : "hover:bg-transparent ",
                "justify-start cursor-pointer"
              )}
            >
              Fill in blanks
            </div>
            <div
              onClick={() => {
                settype("Shortanswers");
                setFormState("initial");
              }}
              className={cn(
                buttonVariants({ variant: "ghost" }),
                type === "Shortanswers"
                  ? "hover:bg-muted bg-background text-foreground shadow-sm"
                  : "hover:bg-transparent ",
                "justify-start cursor-pointer"
              )}
            >
              Short answers
            </div>
          </div>
          <Separator className="w-3/6" />
        </div>
        <div className={styles.maxcont}>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Topic</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter topic" {...field} />
                    </FormControl>
                    <FormDescription>
                      Explain in 3 or 5 words for better results
                    </FormDescription>
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
      {type === "Mcq" ? (
        <McqEditor
          formState={formState}
          completion={Mcqarray}
          querydata={type}
          topic={topic}
          noquestions={noquestions}
          difficulty={difficulty}
          setFormState={setFormState}
        />
      ) : type === "TF" ? (
        <TFEditor
          difficulty={difficulty}
          noquestions={noquestions}
          topic={topic}
          querydata={type}
          completion={TFarray}
          formState={formState}
          setFormState={setFormState}
        />
      ) : type === "Fillinblanks" ? (
        <FillinblanksEditor
          difficulty={difficulty}
          noquestions={noquestions}
          topic={topic}
          querydata={type}
          completion={FIBarray}
          formState={formState}
          setFormState={setFormState}
        />
      ) : null}
    </div>
  );
}
