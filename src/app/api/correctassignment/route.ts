import OpenAI from "openai";
import { OpenAIStream, StreamingTextResponse } from "ai";

export const runtime = "edge";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const functions = [
  {
    name: "assign_marks_for_each_studentAnswer",
    parameters: {
      type: "object",
      properties: {
        grade: {
          type: "array",
          description:
            "marks and remarks for each question in order of question",
          items: {
            type: "object",
            properties: {

              marks: {
                type: "number",
                description: "Marks for the particular studentAnswer",
              },
              remarks: {
                type: "string",
                description: "Remarks for the particular studentAnswer",
              },
            },
          },
        },
      },
      required: ["grade", "marks", "remarks"],
    },
  },
];

export async function POST(req: Request) {
  const { messages } = await req.json();
  console.log(messages)
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      stream: true,
      messages,
      functions,
      // temperature:0,
      // top_p:0
    });
    // console.log(messages);
    const stream = OpenAIStream(response);
    return new StreamingTextResponse(stream);
  } catch (error) {
    console.log(error);
    return new Response("there was a error", { status: 500 });
  }
}
