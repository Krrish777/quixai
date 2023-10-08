"use client";

import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from "react-hook-form";
import Link from "next/link";
import styles from "./styles.module.css";
import { ModeToggle } from "@/components/ModeToggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User as FirebaseUser } from "firebase/auth";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Button } from "../ui/button";
import Image from "next/image";
import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { auth } from "@/lib/firebase";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import {
  CreditCard,
  LifeBuoy,
  LogOut,
  Plus,
  Settings,
  User,
} from "lucide-react";

const formSchema = z.object({
  Classname: z
    .string()
    .min(1, {
      message: "Classname must be at least 1 characters.",
    })
    .max(15, {
      message: "Classname must be at most 15 characters.",
    }),
  Section: z
    .string()
    .min(1, {
      message: "Section must be at least 1 characters.",
    })
    .max(15, {
      message: "Section must be at most 15 characters.",
    }),
  Subject: z
    .string()
    .min(1, {
      message: "Subject must be at least 1 characters.",
    })
    .max(15, {
      message: "Subject must be at most 15 characters.",
    }),
});

const formSchema2 = z.object({
  Classcode: z
    .string()
    .min(10, {
      message: "Classcode must be at least 10 characters.",
    })
    .max(40, {
      message: "Classcode must be at most 40 characters.",
    }),
});

export const Dashboard = ({ children }: any) => {
  const [isclose, setisclose] = useState<boolean>(true);
  const [open, setOpen] = useState<boolean>(false);
  const [joinopen, setjoinopen] = useState<boolean>(false);
  const router = useRouter();
  const [user, setUser] = useState<FirebaseUser | null>(null);

  React.useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        setUser(authUser);
      } else {
        setUser(null);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });

  const form2 = useForm<z.infer<typeof formSchema2>>({
    resolver: zodResolver(formSchema2),
    defaultValues: {},
  });

  type classroomroom = {
    Classname: string;
    TeacherName: string;
    TeacherEmail: string;
    TeacherUid: string;
    Section: string;
    Subject: string;
    Createdby: string;
    Createddata: number;
    students: string[];
  };

  async function Createform(values: z.infer<typeof formSchema>) {
    if (user) {
      if (user.displayName && user.uid && user.email) {
        const CACHE_KEY = `${user.uid.slice(0, 5)}CreatedclassroomsData`;

        const Datatobeadded: classroomroom = {
          Classname: values.Classname,
          TeacherName: user.displayName,
          TeacherUid: user.uid,
          TeacherEmail: user.email,
          Section: values.Section,
          Subject: values.Subject,
          Createdby: user.uid,
          Createddata: Date.now(),
          students: [],
        };

        try {
          await addDoc(collection(db, "Classrooms"), Datatobeadded).then(() => {
            toast({
              title: "Class created!",
              description: "Your request to create class was Sucessfull",
            });
          });
        } catch (error) {
          console.log(error);
          toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: "There was a problem with your request.",
          });
        } finally {
          setOpen(false);
          localStorage.removeItem(CACHE_KEY);
          localStorage.removeItem(`${CACHE_KEY}_timestamp`);
        }
      } else {
        console.log(
          "User does not have an email or name. Please try using another account or try again later."
        );
        toast({
          title: "Account error",
          description:
            "User does not have an email or name. Please try using another account or try again later.",
        });
      }
    } else {
      console.log("No user is currently authenticated");
      toast({
        title: "No user authenticated",
        description: "Pls login and try again",
      });
      setOpen(false);
    }
  }

  async function Joinform(values: z.infer<typeof formSchema2>) {
    if (user) {
      if (user.uid && user.email && user.displayName) {
        const CACHE_KEY = `${user.uid.slice(0, 5)}JoinedclassroomsData`;
        try {
          const classroomRef = doc(db, "Classrooms", values.Classcode);
          await updateDoc(classroomRef, {
            students: arrayUnion({ uid: user.uid, name: user.displayName }),
          }).then(() => {
            toast({
              title: "Class joined !",
              description: "Your request to Join the class was Sucessfull",
            });
          });
        } catch (error) {
          console.error("Error updating document:", error);
          toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description:
              "There was a problem with your request,Check whether the class Exists and try later",
          });
        } finally {
          setjoinopen(false);
          localStorage.removeItem(CACHE_KEY);
          localStorage.removeItem(`${CACHE_KEY}_timestamp`);
        }
      } else {
        console.log(
          "User does not have an email or name. Please try using another account or try again later."
        );
        toast({
          title: "Account error",
          description:
            "User does not have an email or name. Please try using another account or try again later.",
        });
      }
    } else {
      console.log("No user is currently authenticated");
      toast({
        title: "No user authenticated",
        description: "Pls login and try again",
      });
      setjoinopen(false);
    }
  }

  async function signOutUser() {
    await signOut(auth).then(async () => {
      await fetch("/api/signOut", {
        method: "POST",
      }).then((response) => {
        if (response.status === 200) {
          router.push("/");
          toast({
            description: "Sign out sucessfull!",
          });
        }
      });
    });
  }

  return (
    <div>
      <div className={styles.container}>
        <div className={styles.navbar}>
          <div className={`${styles.nav1}`}>
            <div className={styles.close} onClick={() => setisclose(!isclose)}>
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 15 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1.5 3C1.22386 3 1 3.22386 1 3.5C1 3.77614 1.22386 4 1.5 4H13.5C13.7761 4 14 3.77614 14 3.5C14 3.22386 13.7761 3 13.5 3H1.5ZM1 7.5C1 7.22386 1.22386 7 1.5 7H13.5C13.7761 7 14 7.22386 14 7.5C14 7.77614 13.7761 8 13.5 8H1.5C1.22386 8 1 7.77614 1 7.5ZM1 11.5C1 11.2239 1.22386 11 1.5 11H13.5C13.7761 11 14 11.2239 14 11.5C14 11.7761 13.7761 12 13.5 12H1.5C1.22386 12 1 11.7761 1 11.5Z"
                  fill="currentColor"
                  fillRule="evenodd"
                  clipRule="evenodd"
                ></path>
              </svg>
            </div>
            <div className={`${styles.icon} `}>
              <Image src="/logo.png" alt="logo" width={30} height={30} />
              <div className={styles.name}>
                <div>Quix</div>
                <div className={styles.smallname}>.ai</div>
              </div>
            </div>
          </div>

          <div className={styles.icons}>
            <Popover>
              <PopoverTrigger>
                <Plus width="25" height="25" />
              </PopoverTrigger>
              <PopoverContent>
                <div className=" p-1 hover:bg-secondary/80 rounded-sm cursor-pointer">
                  <Dialog onOpenChange={setjoinopen} open={joinopen}>
                    <DialogTrigger>Join Class</DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Join a Class</DialogTitle>
                        <DialogDescription>
                          Enter the class-code to join the class
                        </DialogDescription>
                      </DialogHeader>
                      <Form {...form2}>
                        <form
                          onSubmit={form2.handleSubmit(Joinform)}
                          className="space-y-5"
                        >
                          <FormField
                            control={form2.control}
                            name="Classcode"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Class Code</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Ex: X6TGSSJ7"
                                    {...field}
                                  />
                                </FormControl>
                                <FormDescription>
                                  Ask your teacher for the class code, then
                                  enter it here.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button type="submit">Submit</Button>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="p-1 hover:bg-secondary/80 rounded-sm cursor-pointer">
                  <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger>Create Class</DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Create a Class</DialogTitle>
                        <DialogDescription>
                          Create a Class by providing the following details
                        </DialogDescription>
                      </DialogHeader>

                      <Form {...form}>
                        <form
                          onSubmit={form.handleSubmit(Createform)}
                          className="space-y-3"
                        >
                          <FormField
                            control={form.control}
                            name="Classname"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Class name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Ex: Bca" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="Section"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Section</FormLabel>
                                <FormControl>
                                  <Input placeholder="Ex: A2" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="Subject"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Subject</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Ex: Javascript"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button type="submit">Submit</Button>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
              </PopoverContent>
            </Popover>
            <ModeToggle></ModeToggle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={
                        user?.photoURL ??
                        "https://avatars.githubusercontent.com/u/124599?v=4"
                      }
                      alt="profileimage"
                    />
                    <AvatarFallback>CH</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.displayName}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <Link href="/profile">
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuItem>
                    <LifeBuoy className="mr-2 h-4 w-4" />
                    <span>Support</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuItem>
                  <CreditCard className="mr-2 h-4 w-4" />
                  <span>Billing</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOutUser}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      <div className={styles.split}>
        <div className={`${styles.grid} `}>
          <div className={`${styles.grid1} ${isclose ? styles.cc : ""} `}>
            <div className={styles.fun}>
              <Link href="/dashboard" onClick={() => setisclose(true)}>
                Create Quix
              </Link>
              <Link
                href="/dashboard/createdclassroom"
                onClick={() => setisclose(true)}
              >
                Created Classroom
              </Link>
              <Link
                href="/dashboard/joinedclassroom"
                onClick={() => setisclose(true)}
              >
                Joined Classroom
              </Link>
              <Link
                href="/dashboard/transcation"
                onClick={() => setisclose(true)}
              >
                Transcations
              </Link>
              <Link
                href="/dashboard/helpsupport"
                onClick={() => setisclose(true)}
              >
                Help & Support
              </Link>
              <Link href="/dashboard/settings" onClick={() => setisclose(true)}>
                Setting
              </Link>
            </div>
          </div>
          <div
            className={` ${styles.grid2} ${!isclose ? styles.cover : ""} 
            `}
            onClick={() => {
              !isclose && setisclose(!isclose);
            }}
          >
            <div className={`${!isclose ? styles.gg : ""}`}>{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
