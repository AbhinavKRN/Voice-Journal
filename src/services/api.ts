import { createClient } from '@supabase/supabase-js';
import type { JournalEntry, Message } from '../types';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
  const formData = new FormData();
  formData.append('file', audioBlob, 'audio.wav');
  formData.append('model', 'whisper-1');

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Transcription failed');
  }

  const data = await response.json();
  return data.text;
};

export const getAIResponse = async (messages: Message[]): Promise<string> => {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an empathetic AI journaling companion. Help the user reflect on their thoughts and feelings. Ask thoughtful follow-up questions and provide gentle guidance.',
        },
        ...messages,
      ],
    }),
  });

  if (!response.ok) {
    throw new Error('AI response failed');
  }

  const data = await response.json();
  return data.choices[0].message.content;
};

export const saveJournalEntry = async (
  userId: string,
  transcript: string,
  aiResponse: string,
  mood: string
): Promise<JournalEntry> => {
  const { data, error } = await supabase
    .from('journal_entries')
    .insert([
      {
        user_id: userId,
        transcript,
        ai_response: aiResponse,
        mood,
      },
    ])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const getJournalEntries = async (userId: string): Promise<JournalEntry[]> => {
  const { data, error } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
};

export const analyzeMood = async (text: string): Promise<string> => {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'Analyze the emotional tone of the following text and respond with exactly one of these moods: happy, excited, neutral, anxious, sad.',
        },
        {
          role: 'user',
          content: text,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error('Mood analysis failed');
  }

  const data = await response.json();
  return data.choices[0].message.content.toLowerCase();
}; 