import type { Message } from '../types';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1';

export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  const formData = new FormData();
  formData.append('file', audioBlob, 'audio.webm');
  formData.append('model', 'whisper-1');

  try {
    const response = await fetch(`${OPENAI_API_URL}/audio/transcriptions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Transcription failed');
    }

    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error('Error transcribing audio:', error);
    throw error;
  }
}

export async function getAIResponse(messages: Message[]): Promise<string> {
  const systemPrompt = {
    role: 'system',
    content: `You are an AI assistant who is a supportive, caring, and informal friend. For everyday journaling, respond with warmth, empathy, and casual, friendly language—like a close friend who listens, encourages, and sometimes shares relatable stories or uplifting thoughts. Use emojis and light humor if appropriate. Only switch to a more serious, safety-focused tone if the user is in crisis or asks for help with mental health emergencies. Never sound like a bot or therapist unless absolutely necessary for safety. Never provide medical diagnoses or prescriptions. Always prioritize the user's well-being and make them feel heard and valued.`
  };
  try {
    const response = await fetch(`${OPENAI_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [systemPrompt, ...messages.map(msg => ({
          role: msg.role,
          content: msg.content,
        }))],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error('AI response failed');
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error getting AI response:', error);
    throw error;
  }
}

export async function generateImage(prompt: string): Promise<string> {
  try {
    const response = await fetch(`${OPENAI_API_URL}/images/generations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: prompt,
        n: 1,
        size: '1024x1024',
        response_format: 'b64_json',
      }),
    });

    if (!response.ok) {
      throw new Error('Image generation failed');
    }

    const data = await response.json();
    const base64 = data.data[0].b64_json;
    return `data:image/png;base64,${base64}`;
  } catch (error) {
    console.error('Error generating image:', error);
    throw error;
  }
}

export async function analyzeMood(text: string): Promise<string> {
  try {
    const response = await fetch(`${OPENAI_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a mood analyzer. Analyze the following text and respond with exactly one of these moods: happy, excited, neutral, anxious, sad. Only respond with the mood, nothing else.',
          },
          {
            role: 'user',
            content: text,
          },
        ],
        temperature: 0.3,
        max_tokens: 10,
      }),
    });

    if (!response.ok) {
      throw new Error('Mood analysis failed');
    }

    const data = await response.json();
    return data.choices[0].message.content.trim().toLowerCase();
  } catch (error) {
    console.error('Error analyzing mood:', error);
    throw error;
  }
} 