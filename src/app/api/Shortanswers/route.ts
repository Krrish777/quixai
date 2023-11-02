import OpenAI from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';

export const runtime = 'edge';

const openai = new OpenAI({
    apiKey: "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",
});

const functions = [
    {

        name: 'Create_short_question_and_answer',
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
                                description: 'A concise question statement related to the specified topic.',
                            },
                            answer: {
                                type: 'string',
                                description: 'The correct answer to the provided question.',
                            },
                        }
                    },
                },
            },
            required: ['questions', 'question', 'answer'],
        },
    },
];


export async function POST(req: Request): Promise<void | Response> {
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