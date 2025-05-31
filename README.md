# Voice Journal

A voice-first journaling web app where users speak their thoughts and an AI companion helps them reflect, process emotions, and gain insights through natural conversation.

## Features

- 🎤 Voice recording and transcription using OpenAI Whisper
- 💬 AI companion (GPT-4) for meaningful, supportive conversations
- 🖼️ Visual image generation of your day using DALL-E 3
- 📊 Mood tracking and emotional insights
- 📈 Visual analytics and patterns
- 🔒 Secure authentication and storage with Supabase
- 💾 Persistent storage of journal entries, audio, and metadata
- 🌗 Dark/light theme support (Tailwind CSS)
- 📱 Responsive design for all devices

## Tech Stack

- **React + TypeScript** (frontend)
- **Tailwind CSS** for styling
- **Supabase** for authentication, database, and storage
- **OpenAI API**:
  - Whisper (voice-to-text)
  - GPT-4 (AI chat, mood analysis)
  - DALL-E 3 (image generation)
- **Chart.js** for data visualization
- **jsPDF** for PDF export

## Prerequisites

- Node.js 16+ and npm
- Supabase account
- OpenAI API key

## Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd voice-journal
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment variables:**
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_OPENAI_API_KEY=your_openai_api_key
   ```

4. **Supabase setup:**
   - Create a new project in Supabase
   - Run the full schema in [`supabase/schema.sql`](./supabase/schema.sql) to set up tables, policies, triggers, and types
   - Enable Row Level Security (RLS) as defined in the schema

5. **Start the development server:**
   ```bash
   npm run dev
   ```

## How It Works

- **Voice Recording:** Users record journal entries in the browser. Audio is sent to OpenAI Whisper for transcription.
- **AI Companion:** The transcript is sent to GPT-4, which responds as a supportive friend. Mood is analyzed using a separate GPT-4 prompt.
- **Image Generation:** Users can generate an artistic image of their day using DALL-E 3, based on their journal entry.
- **Data Storage:** All data (entries, moods, images, audio URLs) is securely stored in Supabase.
- **Analytics:** Mood and entry data is visualized with Chart.js.

## Project Structure

```
src/
  ├── components/     # Reusable UI components
  ├── contexts/       # React contexts (auth, etc.)
  ├── pages/          # Page components
  ├── services/       # API and AI service functions
  ├── types/          # TypeScript type definitions
  ├── utils/          # Utility functions
  ├── App.tsx         # Main app component
  └── main.tsx        # Entry point
supabase/
  └── schema.sql      # Full database schema and policies
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Acknowledgments

- OpenAI for Whisper, GPT-4, and DALL-E APIs
- Supabase for backend infrastructure
- React and Tailwind CSS communities
