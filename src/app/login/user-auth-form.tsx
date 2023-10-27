"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { cn } from "@/lib/utils";
import { Icons } from "@/components/ui/Icons";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);

  async function signInWithProvider(provider: any) {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        console.log(result.user);
        await fetch("/api/login", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${await result.user.getIdToken()}`,
          },
        }).then(() => {
          toast({
            description: "Login Sucessfull",
          });
          router.push("/dashboard");
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem with your request.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <Button
        variant="outline"
        type="button"
        onClick={() => signInWithProvider(new GoogleAuthProvider())}
        disabled={isLoading}
      >
        {isLoading ? (
          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Icons.google className="mr-2 h-4 w-4" />
        )}
        Google
      </Button>
      {/* <Button
        variant="outline"
        type="button"
        onClick={() => signInWithProvider(new GithubAuthProvider())}
        disabled={isLoading}
      >
        {isLoading ? (
          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Icons.gitHub className="mr-2 h-4 w-4" />
        )}
        Github
      </Button> */}
    </div>
  );
}
