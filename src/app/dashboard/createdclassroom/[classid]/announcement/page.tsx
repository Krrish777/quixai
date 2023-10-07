"use client";

import { useParams } from "next/navigation";
import styles from "../styles.module.css";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
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
import { User, onAuthStateChanged } from "firebase/auth";
import CryptoJS from "crypto-js";

type Announcement = {
  id?: string;
  Message: string;
  createdAt: number | string;
};

const formSchema = z.object({
  message: z
    .string()
    .min(10, {
      message: "Minimun 10 letters should be there",
    })
    .max(1000, {
      message: "Max 50 letters should be there",
    }),
});

const Announcement = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [user, setuser] = useState<User | null>(null);
  const params = useParams();
  const classid = params.classid;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });

  const fetchAnnouncements = async () => {
    const CACHE_EXPIRATION = 10 * 60 * 1000;
    const currentTime = new Date().getTime();

    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        setuser(authUser);
        const CACHE_KEY = `${authUser.uid.slice(
          0,
          5
        )}announcementsData${classid}`;
        const cachedData = localStorage.getItem(CACHE_KEY);
        const cachedTimestamp = localStorage.getItem(`${CACHE_KEY}_timestamp`);

        if (
          cachedData &&
          cachedTimestamp &&
          currentTime - parseInt(cachedTimestamp) < CACHE_EXPIRATION
        ) {
          const decryptedBytes = CryptoJS.AES.decrypt(cachedData, CACHE_KEY);
          const decryptedData = decryptedBytes.toString(CryptoJS.enc.Utf8);

          const parsedData = JSON.parse(decryptedData) as Announcement[];
          setAnnouncements(parsedData);
        } else {
          try {
            const q = query(
              collection(db, `Classrooms/${classid}/Announcements`),
              orderBy("createdAt", "desc")
            );

            const querySnapshot = await getDocs(q);

            const classroomsData: Announcement[] = [];
            querySnapshot.forEach((doc) => {
              classroomsData.push({
                id: doc.id,
                ...doc.data(),
              } as Announcement);
            });

            const dataToEncrypt = JSON.stringify(classroomsData);
            const encryptedData = CryptoJS.AES.encrypt(
              dataToEncrypt,
              CACHE_KEY
            ).toString();

            localStorage.setItem(CACHE_KEY, encryptedData);
            localStorage.setItem(
              `${CACHE_KEY}_timestamp`,
              currentTime.toString()
            );

            setAnnouncements(classroomsData);
          } catch (error) {
            toast({
              variant: "destructive",
              title: "Uh oh! Something went wrong.",
              description: "There was a problem with your request.",
            });
          }
        }
      } else {
        toast({
          title: "No user authenticated",
          description: "Please login and try again",
        });
        console.log("No user is currently authenticated");
      }
    });

    return () => {
      unsubscribe();
    };
  };

  useEffect(() => {
    if (classid) {
      fetchAnnouncements();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classid]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (user && classid) {
      const CACHE_KEY = `${user.uid.slice(0, 5)}announcementsData${classid}`;
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
          form.setValue("message", "");
        });
      } catch (error) {
        console.error("Error sending announcement");
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
            {announcements.map((announcement, index) => (
              <div className="grid gap-6 bg-accent rounded-sm p-2" key={index}>
                <div className="cursor-pointer">
                  <div className="text-muted-foreground text-[15px]">
                    Announcement :
                  </div>
                  <div className="text-muted-foreground text-[13px]">
                    {new Date(announcement.createdAt).toLocaleDateString(
                      undefined,
                      { year: "numeric", month: "short", day: "numeric" }
                    )}
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
