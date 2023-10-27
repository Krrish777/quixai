"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import {
  DocumentData,
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useParams, useSearchParams } from "next/navigation";
import styles from "./styles.module.css";
import { Viewer, Worker } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { toast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface SubmittedAnswer {
  question: string;
  selectedAnswer: string;
  options: string[];
  answer: string;
}

interface SubmittedAssignment {
  id: string;
  studentUUID: string;
  studentEmail: string;
  studentName: string;
  assignmentId: string;
  scoredMarks: number;
  selectedanswer: SubmittedAnswer[];
  totalmarks: number;
  instructions?: string;
  selectedpdf?: string;
  topic?: string;
}

const Page = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [updateingAssignmentId, setUpdateingAssignmentId] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [updateingUserMarks, setupdateingUserMarks] = useState<number>();
  const [updateingTotalMarks, setupdateingTotalMarks] = useState<number>();
  const [updateingUserNewMarks, setupdateingUserNewMarks] = useState<number>();
  const [submittedAssignments, setSubmittedAssignments] = useState<
    SubmittedAssignment[]
  >([]);
  const [selectedProfileAssignment, setSelectedProfileAssignment] =
    useState<SubmittedAssignment | null>(null);

  const params = useParams();
  const searchParams = useSearchParams();
  const type = searchParams.get("type");
  const classid = params.classid;
  const assignmentId = params.assignmentid;
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  async function submittedassignemnt() {
    try {
      const submittedAssignmentsRef = collection(
        db,
        `Classrooms/${classid}/submitted_assignment`
      );

      const submittedAssignmentsQuery = query(
        submittedAssignmentsRef,
        where("assignmentId", "==", assignmentId)
      );

      const submittedAssignmentsSnapshot = await getDocs(
        submittedAssignmentsQuery
      );

      const data: SubmittedAssignment[] = [];
      submittedAssignmentsSnapshot.forEach((doc: DocumentData) => {
        const assignmentData: SubmittedAssignment = {
          id: doc.id,
          ...doc.data(),
        };
        data.push(assignmentData);
      });

      setSubmittedAssignments(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  }

  useEffect(() => {
    if (classid) {
      submittedassignemnt();
    }
  }, [classid, assignmentId]);

  function onupdate(
    assignmentid: string,
    assignmentusermarks: number,
    assignmentTotalmarks: number
  ) {
    setupdateingUserNewMarks(assignmentusermarks);
    setUpdateingAssignmentId(assignmentid);
    setupdateingUserMarks(assignmentusermarks);
    setupdateingTotalMarks(assignmentTotalmarks);
    setOpen(true);
  }

  function profileview(assignmentid: string) {
    const profileAssignment = submittedAssignments.find(
      (assignment) => assignment.id === assignmentid
    );

    setSelectedProfileAssignment(profileAssignment || null);
  }

  function handleupdate() {
    if (updateingAssignmentId === null) {
      alert("No assignment data to update.");
      return;
    }

    if (updateingUserNewMarks === undefined || isNaN(updateingUserNewMarks)) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: `Please enter a valid number for assignment marks.`,
      });
      return;
    }
    if (updateingTotalMarks === undefined || isNaN(updateingTotalMarks)) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: `Total marks are not defined for this assignment.`,
      });
      return;
    }

    if (
      updateingUserNewMarks < 0 ||
      updateingUserNewMarks > updateingTotalMarks
    ) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: `Assignment marks must be between 0 and ${updateingTotalMarks}`,
      });
      return;
    }

    try {
      if (updateingAssignmentId !== undefined) {
        const assignmentRef = doc(
          db,
          `Classrooms/${classid}/submitted_assignment`,
          updateingAssignmentId
        );

        const updateData = {
          scoredMarks: updateingUserNewMarks,
        };

        updateDoc(assignmentRef, updateData)
          .then(() => {
            setOpen(false);
            submittedassignemnt();
            toast({
              title: "Updated sucessfull!",
              description: "Assignment marks updated successfully.",
            });
          })
          .catch((error) => {
            toast({
              variant: "destructive",
              title: "Uh oh! Something went wrong.",
              description: `An error occurred while updating assignment marks.`,
            });
            console.error("Error updating assignment marks:", error);
          });
      } else {
        alert("Assignment ID is undefined.");
      }
    } catch (error) {
      console.error("there was an error updating the marks:", error);
    }
  }
  return (
    <div
      className={`grid grid-cols-[2fr_3fr] gap-5 mt-3 ${styles.cls} ${styles.parent}`}
    >
      <div className={`${styles.gridone}`}>
        <Card>
          <CardHeader className={`col-span-3 ${styles.stdname}`}>
            <CardTitle>Students Marks</CardTitle>
            <CardDescription>List of Student Marks</CardDescription>
          </CardHeader>
          <CardContent className={` ${styles.stdname}`}>
            <div className="space-y-8">
              {loading ? (
                <>
                  <Skeleton className="w-[100%] h-[5rem] rounded-sm" />
                </>
              ) : submittedAssignments.length === 0 ? (
                <div
                  className={`${styles.emptyMessage} p-5 w-full text-center`}
                >
                  No students found
                </div>
              ) : (
                <>
                  {submittedAssignments.map((assignment) => (
                    <div className="flex items-center" key={assignment.id}>
                      <Avatar
                        className={`flex h-9 w-9 items-center justify-center space-y-0 border cursor-pointer ${styles.avt}`}
                        onClick={() => {
                          profileview(assignment.id);
                        }}
                      >
                        <AvatarImage src="/02.png" alt="Avatar" />
                        <AvatarFallback>JL</AvatarFallback>
                      </Avatar>
                      <div
                        className={`ml-4 space-y-1 cursor-pointer ${styles.names}`}
                        onClick={() => {
                          profileview(assignment.id);
                        }}
                      >
                        <div className="text-sm font-medium leading-none ">
                          {assignment.studentName}
                        </div>
                        <div
                          className={`text-sm text-muted-foreground ${styles.email}`}
                        >
                          {assignment.studentEmail}
                        </div>
                      </div>
                      <div
                        className="ml-auto font-medium cursor-pointer"
                        onClick={() => {
                          onupdate(
                            assignment.id,
                            assignment.scoredMarks,
                            assignment.totalmarks
                          );
                        }}
                      >
                        {assignment.scoredMarks}/{assignment.totalmarks}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      <div>
        <Card className="col-span-3">
          <CardHeader className={`col-span-3 ${styles.stdname}`}>
            <CardTitle>Student Selected Answers</CardTitle>
            <CardDescription>
              Click on the student profile to get details marks
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedProfileAssignment !== null ? (
              <div>
                {selectedProfileAssignment?.selectedanswer?.map(
                  (selectedAnswer, index) => {
                    if (type === "Mcq") {
                      return (
                        <div
                          key={index}
                          className="bg-muted p-4 my-4 rounded-lg first:mt-0 last:mb-0"
                        >
                          <div className={`mb-2`}>
                            Question: {selectedAnswer.question}
                          </div>
                          <div className="mb-2">Options:</div>
                          <ul className="list-disc ml-4 mb-1">
                            {selectedAnswer.options.map(
                              (option, optionIndex) => (
                                <li key={optionIndex}>{option}</li>
                              )
                            )}
                          </ul>
                          <div className={`mb-1`}>
                            Selected Answer: {selectedAnswer.selectedAnswer}
                          </div>
                          <div className="mt-2">
                            Correct Answer: {selectedAnswer.answer}
                          </div>
                        </div>
                      );
                    } else if (type === "TF") {
                      return (
                        <div
                          key={index}
                          className="bg-muted p-4 my-4 rounded-lg first:mt-0 last:mb-0"
                        >
                          <div className={`mb-2`}>
                            Question: {selectedAnswer.question}
                          </div>
                          <div className="mt-1">
                            Correct Answer: {selectedAnswer.answer}
                          </div>
                          <div className={`mb-2`}>
                            Selected Answer: {selectedAnswer.selectedAnswer}
                          </div>
                        </div>
                      );
                    } else if (type === "Fillinblanks" || "Shortanswers") {
                      return (
                        <div
                          key={index}
                          className="bg-muted p-4 my-4 rounded-lg first:mt-0 last:mb-0"
                        >
                          <div className={`mb-2`}>
                            Question: {selectedAnswer.question}
                          </div>
                          <div className={`mb-1`}>
                            Selected Answer: {selectedAnswer.selectedAnswer}
                          </div>
                          <div>Answer: {selectedAnswer.answer}</div>
                        </div>
                      );
                    }
                    return null;
                  }
                )}
                {type === "WrittenAssignment" && (
                  <div>
                    <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
                      <div
                        style={{ height: "750px" }}
                        className={styles.pdfwidth}
                      >
                        <Viewer
                          fileUrl={`${selectedProfileAssignment.selectedpdf}`}
                          plugins={[defaultLayoutPluginInstance]}
                        />
                      </div>
                    </Worker>
                  </div>
                )}
              </div>
            ) : (
              <div>No selected answers to display.</div>
            )}
          </CardContent>
        </Card>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[475px]">
          <DialogHeader>
            <DialogTitle>Save preset</DialogTitle>
            <DialogDescription>
              This will save the current playground state as a preset which you
              can access later or share with others.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                autoFocus
                type="number"
                value={updateingUserNewMarks}
                onChange={(e) =>
                  setupdateingUserNewMarks(parseInt(e.target.value))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => handleupdate()}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Page;

// https://thehotcode.com/firebase-gcloud-fix-cors-issues/
// https://www.youtube.com/watch?v=WBpHWm8FL_E
// https://react-pdf-viewer.dev/examples/view-documents-from-remote-servers/
