"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import styles from "./styles.module.css";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { toast } from "@/components/ui/use-toast";
import CryptoJS from "crypto-js";
import { Skeleton } from "@/components/ui/skeleton";

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
  const [loading, setLoading] = useState(true);

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
      setLoading(false);
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

  return (
    <div className={` overflow-hidden ${styles.tbc}`}>
      {loading ? (
        <Skeleton className="w-[100%] h-[5rem] mt-4 rounded-sm" />
      ) : materials.length === 0 ? (
        <div className={`${styles.emptyMessage} p-5 mt-10 w-full text-center`}>
          No materials found
        </div>
      ) : (
        <Table>
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
      )}
    </div>
  );
}
