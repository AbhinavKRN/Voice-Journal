import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import PageContainer from '../components/PageContainer';
import LoadingSpinner from '../components/LoadingSpinner';
import { transcribeAudio, getAIResponse, analyzeMood, generateImage } from '../services/ai';
import { supabase } from '../lib/supabase';
import type { Message } from '../types';
import logo from '../assets/voice-journal-icon.png';
import jsPDF from 'jspdf';

export default function Journal() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    setMessages([
      {
        role: 'assistant',
        content: 'Hello! I\'m here to listen and chat with you. How are you feeling today?',
      },
    ]);
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Error accessing microphone. Please ensure you have granted microphone permissions.');
    }
  };

  const stopRecording = async () => {
    if (!mediaRecorderRef.current) return;

    return new Promise<void>((resolve) => {
      mediaRecorderRef.current!.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setIsProcessing(true);

        try {
          const transcribedText = await transcribeAudio(audioBlob);
          setTranscript(transcribedText);

          const mood = await analyzeMood(transcribedText);

          const newMessages: Message[] = [
            ...messages,
            { role: 'user', content: transcribedText },
          ];
          const aiResponse = await getAIResponse(newMessages);
          setMessages([...newMessages, { role: 'assistant', content: aiResponse }]);

          if (user) {
            const { error } = await supabase.from('journal_entries').insert({
              user_id: user.id,
              transcript: transcribedText,
              ai_response: aiResponse,
              mood: mood,
              audio_url: URL.createObjectURL(audioBlob),
              metadata: {},
            });
            if (error) throw error;
          }
        } catch (error) {
          console.error('Error processing audio:', error);
          alert('Error processing your journal entry. Please try again.');
        } finally {
          setIsProcessing(false);
          resolve();
        }
      };

      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
    });
  };

  const handleGenerateImage = async () => {
    if (!transcript) return;
    setImageLoading(true);
    try {
      const imagePrompt = `Create an artistic image depicting your day: ${transcript}`;
      const imageUrl = await generateImage(imagePrompt);
      setGeneratedImage(imageUrl);
      if (user) {
        const { data, error } = await supabase
          .from('journal_entries')
          .select('id')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1);
        if (!error && data && data.length > 0) {
          await supabase.from('journal_entries').update({
            metadata: { image_url: imageUrl },
          }).eq('id', data[0].id);
        }
      }
    } catch (error) {
      alert('Error generating image. Please try again.');
    } finally {
      setImageLoading(false);
    }
  };

  function toDataURL(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.crossOrigin = 'Anonymous';
      img.onload = function () {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = function () {
        reject(new Error('Could not load image for PDF export'));
      };
      img.src = url;
    });
  }

  const handleExportPDF = async () => {
    if (!generatedImage) return;
    const doc = new jsPDF();
    let y = 10;
    if (transcript) {
      doc.setFontSize(16);
      doc.text('Journal Entry', 10, y);
      y += 10;
      doc.setFontSize(12);
      doc.text(doc.splitTextToSize(transcript, 180), 10, y);
      y += 30;
    }
    doc.setFontSize(16);
    doc.text('Visual Representation', 10, y);
    y += 10;
    try {
      const dataUrl = await toDataURL(generatedImage);
      doc.addImage(dataUrl, 'PNG', 10, y, 180, 90);
      doc.save('journal-entry.pdf');
    } catch (err) {
      alert('Failed to export image to PDF. Try downloading the image first.');
    }
  };

  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-center mb-4">
            <img src={logo} alt="Voice Journal Logo" className="h-10 w-auto" />
          </div>
          
          {/* Recording Controls */}
          <div className="flex justify-center mb-6">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isProcessing}
              className={`btn-primary ${isRecording ? 'bg-red-500 hover:bg-red-600 dark:bg-red-700 dark:hover:bg-red-800' : ''}`}
            >
              {isRecording ? 'Stop Recording' : 'Start Recording'}
            </button>
          </div>

          {isProcessing && (
            <div className="text-center mb-6">
              <LoadingSpinner />
              <p className="mt-2 text-gray-600 dark:text-gray-300">Processing your journal entry...</p>
            </div>
          )}

          {transcript && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">Your Entry</h3>
              <p className="text-gray-700 dark:text-gray-200">{transcript}</p>
            </div>
          )}

          {transcript && !generatedImage && (
            <div className="mb-6 flex flex-col items-center gap-2">
              <button
                onClick={handleGenerateImage}
                className="btn-primary px-6 py-2 text-lg font-semibold"
                disabled={imageLoading}
              >
                {imageLoading ? 'Generating Image...' : 'Generate Image Depicting Your Day'}
              </button>
              <span className="text-sm text-gray-500 dark:text-gray-400">This may take 5-10 seconds. Please wait while your image is processed.</span>
            </div>
          )}
          {generatedImage && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">Visual Representation of Your Day</h3>
              <img
                src={generatedImage}
                alt="AI-generated visualization"
                className="rounded-lg shadow-md max-w-full h-auto"
              />
              <button
                onClick={handleExportPDF}
                className="btn-primary mt-4 px-6 py-2 text-lg font-semibold"
              >
                Export as PDF
              </button>
            </div>
          )}

          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg ${
                  message.role === 'assistant'
                    ? 'bg-blue-50 dark:bg-blue-900 ml-4'
                    : 'bg-gray-50 dark:bg-gray-700 mr-4'
                }`}
              >
                <p className="text-gray-700 dark:text-gray-200">{message.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageContainer>
  );
} 