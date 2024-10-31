import { NextRequest, NextResponse } from 'next/server';
import { CohereClientV2 } from 'cohere-ai';


export async function POST(request: NextRequest) {
  const { prompt }: { prompt: string } = await request.json();

  const cohere = new CohereClientV2({
    token: '',
  });

  try {
    const response = await cohere.chat({
      model: 'command-r-plus',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    console.log('Cohere response:', response);

    const messageContent = response?.message?.content?.[0]?.text || response?.message?.content;

    if (messageContent) {
      return NextResponse.json({ message: messageContent }, { status: 200 });
    } else {
      return NextResponse.json({ error: 'No message returned from Cohere API.' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error calling Cohere API:', error);
    return NextResponse.json({ error: 'An error occurred while processing your request.' }, { status: 500 });
  }
}
