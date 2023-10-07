"use client";

import { useParams } from "next/navigation";
import styles from "../styles.module.css";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { auth } from "@/lib/firebase";
import { useEffect, useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { BellIcon, EyeNoneIcon, PersonIcon } from "@radix-ui/react-icons";

type Announcement = {
  Message: string;
  createdAt: number | string;
};

const formSchema = z.object({
  message: z
    .string()
    .min(3, {
      message: "Minimun 3 letters should be there",
    })
    .max(1000, {
      message: "Max 50 letters should be there",
    }),
});

const Announcement = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const params = useParams();
  const classid = params.classid;
  const user = auth.currentUser;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: "",
    },
  });

  const CACHE_KEY = `announcementsData${classid}`;
  const CACHE_EXPIRATION = 10 * 60 * 1000;

  const fetchAnnouncements = async () => {
    try {
      const cachedData = localStorage.getItem(CACHE_KEY);
      const cachedTimestamp = localStorage.getItem(`${CACHE_KEY}_timestamp`);
      const currentTime = new Date().getTime();

      if (
        cachedData &&
        cachedTimestamp &&
        currentTime - parseInt(cachedTimestamp) < CACHE_EXPIRATION
      ) {
        const cachedAnnouncements = JSON.parse(cachedData);
        setAnnouncements(cachedAnnouncements);
      } else {
        const querySnapshot = await getDocs(
          query(
            collection(db, `Classrooms/${classid}/Announcements`),
            orderBy("createdAt", "desc")
          )
        );
        const announcementData: Announcement[] = [];

        querySnapshot.forEach((doc) => {
          const announcement: Announcement = doc.data() as Announcement;

          const formattedDate = new Date(
            announcement.createdAt
          ).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          });

          announcement.createdAt = formattedDate;

          announcementData.push(announcement);
        });

        localStorage.setItem(CACHE_KEY, JSON.stringify(announcementData));
        localStorage.setItem(`${CACHE_KEY}_timestamp`, currentTime.toString());

        setAnnouncements(announcementData);
      }
    } catch (error) {
      console.error("Error fetching announcements:", error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem while fetching announcments",
      });
    }
  };

  useEffect(() => {
    if (classid) {
      fetchAnnouncements();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classid]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (user && classid) {
      const Datatobeadded: Announcement = {
        Message: values.message,
        createdAt: Date.now(),
      };

      try {
        await addDoc(
          collection(db, `Classrooms/${classid}/Announcements`),
          Datatobeadded
        ).then(() => {
          toast({
            title: "Announcement sent!",
            description: "Announcement was Sucessfull sent",
          });
        });
      } catch (error) {
        console.error("Error updating document");
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: "There was a problem with your request",
        });
      } finally {
        localStorage.removeItem(CACHE_KEY);
        localStorage.removeItem(`${CACHE_KEY}_timestamp`);
        fetchAnnouncements();
      }
    } else {
      console.log("No user is currently authenticated or classid is missing");
      toast({
        title: "No user authenticated",
        description: "Pls login and try again",
      });
    }
  }

  return (
    <div className="p-2 flex gap-3 flex-col">
      <Card>
        <CardHeader>
          <CardTitle>Send a Announcement</CardTitle>
          <CardDescription>Anyone in the class can view it.</CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className={`flex ${styles.inp}`}
              >
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormControl>
                        <Input placeholder="Enter the message" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="shrink-0">
                  Send Announcement
                </Button>
              </form>
            </Form>
          </div>
          <Separator className="my-4" />
          <div className="space-y-4">
            {/* <h3 className="text-lg font-medium">Announcemnts :</h3> */}
            {announcements.map((announcement, index) => (
              <div className="grid gap-6 bg-accent rounded-sm p-2" key={index}>
                <div className="cursor-pointer">
                  <div className="text-muted-foreground text-[15px]">
                    Announcement :
                  </div>
                  <div className="text-muted-foreground text-[13px]">
                  {new Date(announcement.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </div>
                  <div className="text-muted-foreground text-[15px] hover:text-foreground">
                    {announcement.Message.charAt(0).toUpperCase() +
                      announcement.Message.slice(1)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Announcement;
