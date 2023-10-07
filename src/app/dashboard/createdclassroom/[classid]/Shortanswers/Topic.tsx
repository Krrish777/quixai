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
import { useEffect, useState } from "react";
import Editor from "./Editor";
import { FunctionCallHandler } from "ai";

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
    .min(1, {
      message: "Topic must be at least 5 characters.",
    })
    .max(30, {
      message: "Topic must be at most 15 characters.",
    }),
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
  const searchParams = useSearchParams();
  const querydata = searchParams.get("type");
  const [name, setname] = useState<string>("");
  const [topic, settopic] = useState<string>("");
  const [noquestions, setnoquestions] = useState<number>(3);
  const [difficulty, setdifficulty] = useState<string>("");
  const [shortanswersarray, setshortanswersarray] = useState<Question[]>([]);

  useEffect(() => {
    setFormState("initial");
    setshortanswersarray([]);
  }, [querydata]);

  const functionCallHandler: FunctionCallHandler = async (
    chatMessages,
    functionCall
  ) => {
    if (functionCall.name === "Create_short_question_and_answer") {
      if (functionCall.arguments) {
        console.log(functionCall.arguments);
        const parsedFunctionCallArguments = JSON.parse(functionCall.arguments);
        const questionsArray = parsedFunctionCallArguments.questions;
        setshortanswersarray(questionsArray);
        console.log(parsedFunctionCallArguments);
      }
    }
  };

  const { append, setMessages, isLoading } = useChat({
    experimental_onFunctionCall: functionCallHandler,
    api: "/api/Shortanswers",
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
    defaultValues: {},
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setFormState("initial");
    setname(values.name);
    settopic(values.topic);
    setnoquestions(values.noquestions);
    setdifficulty(values.difficulty);

    if (querydata === "topic") {
      const prompt = `create ${values.noquestions} ${values.difficulty} short question and answer type question about topic ${values.topic}`;
      setMessages([]);
      await append({ content: prompt, role: "user" });
    }
  }

  return (
    <div className={`${styles.grd} mt-3`}>
      <div className={`p-1 ${styles.grd1}`}>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">Topic</h3>
            <p className="text-sm text-muted-foreground">
              Create Quix from just Topic name
            </p>
          </div>
          <Separator className="w-3/6" />
        </div>
        <div className={styles.maxcont}>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assignmnet name</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex:Assignment 6" {...field} />
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
      <Editor
        difficulty={difficulty}
        noquestions={noquestions}
        topic={topic}
        name={name}
        querydata={querydata}
        completion={shortanswersarray}
        formState={formState}
        setFormState={setFormState}
      />
    </div>
  );
}
