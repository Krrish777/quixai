"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Separator } from "@/components/ui/separator";
import * as z from "zod";
import { useForm } from "react-hook-form";
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
import { useCompletion } from "ai/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import QuestionEditor from "./QuestionEditor";
import { useState } from "react";

type Question = {
  question: string;
  options: string[];
  answer: string;
}[];

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

type FormData = {
  topic: string;
  noquestions: number;
  difficulty: string;
};

export default function ProfileForm() {
  const [formState, setFormState] = useState<"initial" | "loading" | "final">("initial");
  const { complete, completion, isLoading } = useCompletion({
    api: "/api/completion",
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
  });
  const [questionData, setQuestionData] = useState<{ questions: Question }>({
    questions: [],
  });
  const searchParams = useSearchParams();
  const querydata = searchParams.get("type");
  const pathname = usePathname();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: "",
      noquestions: 3,
    },
  });

  // useEffect(() => {
  //   if (formData) {
  //     console.log("formData", formData);
  //   }
  // }, [formData]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setFormState("initial");
    await complete(values.topic);
    console.log(completion)
    // let prompt=values.topic
    // const completion = await complete(prompt);

    // setFormData(values);
    // console.log("formData", formData);
    // console.log(values);
    // console.log(querydata);
  }

  return (
    <div className={`${styles.grd}`}>
      <div className={`p-1`}>
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
              <Button type="submit" disabled={isLoading}>Submit</Button>
            </form>
          </Form>
        </div>
      </div>
      <QuestionEditor
       formState={formState}
        completion={completion}
      />
    </div>
  );
}
