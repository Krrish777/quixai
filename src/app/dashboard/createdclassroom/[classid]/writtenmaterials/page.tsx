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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { db } from "@/lib/firebase";
import { addDoc, collection } from "firebase/firestore";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import clearCachesByServerAction from "../assignment/revalidate";
import { usePathname } from "next/navigation";
const formSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: "Topic must be at least 2 characters.",
    })
    .max(40, {
      message: "Topic must be at most 40 characters.",
    }),
  topic: z
    .string()
    .min(2, {
      message: "Topic must be at least 2 characters.",
    })
    .max(40, {
      message: "Topic must be at most 40 characters.",
    }),
  instructions: z
    .string()
    .min(5, {
      message: "Topic must be at least 5 characters.",
    })
    .max(10000, {
      message: "Topic must be at most 10000 characters.",
    }),
  totalmarks: z.coerce
    .number()
    .gte(10, {
      message: "Min marks should be 10",
    })
    .lte(100, {
      message: "Max marks should be 100",
    }),
});

export default function ProfileForm() {
  const [loading, setloading] = useState(false);
  const pathname = usePathname();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      topic: "",
      instructions: "",
      totalmarks: 10,
    },
  });
  const params = useParams();
  const classid = params.classid;
  const router = useRouter();

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setloading(true);
    const Datatobeadded = {
      assignmentname: values.name,
      topic: values.topic,
      Questiontype: "WrittenAssignment",
      instructions: values.instructions,
      totalmarks: values.totalmarks,
    };
    if (
      values.topic &&
      values.instructions &&
      values.totalmarks &&
      values.name
    ) {
      try {
        await addDoc(
          collection(db, `Classrooms/${classid}/Assignment`),
          Datatobeadded
        ).then(() => {
          clearCachesByServerAction(pathname);
          router.push(`/dashboard/createdclassroom/${classid}/assignment`);
          setloading(false);
        });
      } catch (error) {
        setloading(false);
        console.error(error);
        console.log(Datatobeadded);
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: "There was a problem with your request.",
        });
      }
    } else {
      setloading(false);
      console.log(Datatobeadded);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem with your request.",
      });
    }
  }

  return (
    <div className={styles.cont}>
      <div className="space-y-3">
        <div>
          <h3 className="text-lg font-medium">Written assignment</h3>
          <p className="text-sm text-muted-foreground">
            Submit written assignments
          </p>
        </div>
        <Separator />
      </div>
      <div className={styles.maxcont}>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assignment name</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex:Assignment 6" {...field} />
                  </FormControl>
                  <FormDescription>Enter the Assignment name</FormDescription>
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
                    Enter the Topic of Assignment
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="instructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instructions</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter instructions" {...field} />
                  </FormControl>
                  <FormDescription>Write custom instruction</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="totalmarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Marks</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter assignment marks"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Assign marks for the assignment
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={loading}>
              Submit
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
