export interface User {
  id: string;
  email: string;
}

export interface JournalEntry {
  id: string;
  created_at: string;
  user_id: string;
  transcript: string;
  ai_response: string;
  mood: string;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface MoodData {
  labels: string[];
  datasets: {
    data: number[];
    backgroundColor: string[];
  }[];
}

export interface MoodTrendData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    tension: number;
  }[];
}

export interface WeeklyMoodData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
  }[];
} 