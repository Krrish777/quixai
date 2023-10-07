import OpenAI from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';

export const runtime = 'edge';

const openai = new OpenAI({
  apiKey: "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",
});

const functions = [
  {
    name: 'create_mcq',
    parameters: {
      type: 'object',
      properties: {
        questions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              question: {
                type: 'string',
                description: 'The question related to the topic or given data.',
              },
              options: {
                type: 'array',
                description: 'An array of four options related to the question.',
                items: {
                  type: 'string',
                },
              },
              answer: {
                type: 'string',
                description: 'The correct answer chosen from one of the options.',
              },
            }
          },
        },
      },
      required: ['questions', 'question', 'topic', 'options', 'answer'],
    },
  },
];

export async function POST(req: Request) {
  const { messages } = await req.json();
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      stream: true,
      messages,
      functions,
    });

    const stream = OpenAIStream(response);
    return new StreamingTextResponse(stream);
  } catch (error) {
    console.log(error);
    return new Response("there was a error", { status: 500 });
  }
}


// const data = {
//   Mcq: `You are a super intelligent quiz bot. I will give you a topic and you will have to create 10 mcq questions in json form eg={"questions":[{"question":"In which country was Elon Musk born?","options":["United States","Canada","South Africa","Australia"],"answer":"South Africa"}]}. I want you to only reply with the json output and nothing else. Do not write explanations.The json should be in single straight line with no space between brackets or words.There should be atleast 4 different options with different meaning and among them a correct answer for the question in json and the answer must be the correct option from the option list.The question and answer provided must be authentic and correct, If you don't have accurate or up-to-data data about the topic to create questions and provide with accurate answers don't respond anything and don't generate hypothetical data.Topic is = primss algorithm`,
//   "T/F": "This is the data for True/False Questions.",
//   Shortanswers: "This is the data for Short Answer Questions.",
// };