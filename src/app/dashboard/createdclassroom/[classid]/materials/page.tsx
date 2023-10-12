"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import styles from "./styles.module.css";
import * as z from "zod";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth, db, storage } from "@/lib/firebase";
import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import { toast } from "@/components/ui/use-toast";
import CryptoJS from "crypto-js";
import { getBlob, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";

interface materials {
  id?: string;
  context: string;
  file: string;
  createdAt: number;
}

export default function InpuMaterialtFile() {
  const [user, setuser] = useState<User | null>(null);
  const [materials, setmaterials] = useState<materials[]>([]);
  const params = useParams();
  const classid = params.classid;

  const fetchAnnouncements = useCallback(async () => {
    const CACHE_EXPIRATION = 10 * 60 * 1000;
    const currentTime = new Date().getTime();

    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        setuser(authUser);
        const CACHE_KEY = `${authUser.uid.slice(0, 5)}materials${classid}`;
        const cachedData = localStorage.getItem(CACHE_KEY);
        const cachedTimestamp = localStorage.getItem(`${CACHE_KEY}_timestamp`);

        if (
          cachedData &&
          cachedTimestamp &&
          currentTime - parseInt(cachedTimestamp) < CACHE_EXPIRATION
        ) {
          const decryptedBytes = CryptoJS.AES.decrypt(cachedData, CACHE_KEY);
          const decryptedData = decryptedBytes.toString(CryptoJS.enc.Utf8);

          const parsedData = JSON.parse(decryptedData) as materials[];
          setmaterials(parsedData);
        } else {
          try {
            const q = query(
              collection(db, `Classrooms/${classid}/materials`),
              orderBy("createdAt", "desc")
            );

            const querySnapshot = await getDocs(q);

            const classroomsData: materials[] = [];
            querySnapshot.forEach((doc) => {
              classroomsData.push({
                id: doc.id,
                ...doc.data(),
              } as materials);
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

            setmaterials(classroomsData);
          } catch (error) {
            console.log(error);
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
  }, [classid]);

  useEffect(() => {
    if (classid) {
      fetchAnnouncements();
    }
  }, [classid, fetchAnnouncements]);

  const formSchema = z.object({
    file: z.instanceof(File),
    context: z
      .string()
      .min(2, {
        message: "Context must be at least 2 characters.",
      })
      .max(40, {
        message: "Context must be at most 40 characters.",
      }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      context: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!values.file) {
      alert("no file selected");
      return null;
    }

    if (!classid) {
      alert("No class name");
      return null;
    }

    const allowedTypes = ["application/pdf"];

    if (values.file && !allowedTypes.includes(values.file.type)) {
      toast({
        variant: "destructive",
        title: "Unsuported file",
        description: "Temporirarly we support only pdf files",
      });
      return;
    }

    try {
      const id = uuidv4();
      const storageRef = ref(storage, `${classid}/materials/${id}`);
      const snapshot = await uploadBytes(storageRef, values.file);

      await getDownloadURL(snapshot.ref)
        .then(async (downloadURL) => {
          console.log("File available at", downloadURL);
          if (user && classid) {
            const CACHE_KEY = `${user.uid.slice(0, 5)}materials${classid}`;

            const Datatobeadded: materials = {
              context: values.context,
              file: downloadURL,
              createdAt: Date.now(),
            };

            try {
              await addDoc(
                collection(db, `Classrooms/${classid}/materials`),
                Datatobeadded
              ).then(() => {
                toast({
                  title: "Announcement sent!",
                  description: "Announcement was Sucessfull sent",
                });
                form.setValue("context", "");
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
            console.log(
              "No user is currently authenticated or classid is missing"
            );
            toast({
              title: "No user authenticated",
              description: "Pls login and try again",
            });
          }
        })
        .catch((error) => {
          console.log(error);
          toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: "There was a problem with your request.",
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
    <div className={` overflow-hidden ${styles.tbc}`}>
      <div className="flex flex-col gap-5">
        <Separator />
        <div>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className={`flex-row flex items-center gap-2 ${styles.inps}`}
            >
              <FormField
                control={form.control}
                name="file"
                render={({ field: { value, onChange, ...fieldProps } }) => (
                  <FormItem className="w-full">
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
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="context"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Enter the conext to send"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className={`${styles.btsub}`}>
                Submit
              </Button>
            </form>
          </Form>
        </div>
        <Separator />
      </div>
      <Table>
        {/* <TableCaption>Materials for refrences</TableCaption> */}
        <TableHeader>
          <TableRow>
            <TableHead>Context</TableHead>
            <TableHead>View Material</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {materials.map((material) => (
            <TableRow key={material.id}>
              <TableCell>{material.context}</TableCell>
              <TableCell className="font-medium">
                <a href={material.file} download>
                  &nbsp; View Material
                </a>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
