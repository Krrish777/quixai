"use client";

import { useSearchParams } from "next/navigation";
import React from "react";
import Topic from "./Topic";
import Pdf from "./Pdf";
import Text from "./Text";

const Page = () => {
  const searchParams = useSearchParams();
  const type = searchParams.get("type");

  switch (type) {
    case "topic":
      return <Topic />;
    case "text":
      return <Text />;
    case "pdf":
      return <Pdf />;
    default:
      return <div>Type not supported</div>;
  }
};

export default Page;
