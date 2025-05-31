export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getMoodColor = (mood: string): string => {
  const colors: Record<string, string> = {
    happy: 'bg-green-100 text-green-800',
    excited: 'bg-blue-100 text-blue-800',
    neutral: 'bg-gray-100 text-gray-800',
    anxious: 'bg-yellow-100 text-yellow-800',
    sad: 'bg-red-100 text-red-800',
  };
  return colors[mood] || 'bg-gray-100 text-gray-800';
};

export const getMoodEmoji = (mood: string): string => {
  const emojis: Record<string, string> = {
    happy: '😊',
    excited: '🎉',
    neutral: '😐',
    anxious: '😰',
    sad: '😢',
  };
  return emojis[mood] || '😐';
};

export const generateSummary = (entries: Array<{ transcript: string; mood: string }>): string => {
  if (entries.length === 0) return 'No entries to summarize.';

  const moodCounts = entries.reduce((acc, entry) => {
    acc[entry.mood] = (acc[entry.mood] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const dominantMood = Object.entries(moodCounts).reduce((a, b) => 
    (b[1] > a[1] ? b : a)
  )[0];

  return `Based on your recent entries, you've been feeling ${dominantMood} lately. Keep up the good work with your journaling practice!`;
};

export const exportToPDF = async (entries: Array<{ transcript: string; ai_response: string; created_at: string }>): Promise<void> => {
  // This is a placeholder for PDF export functionality
  // You would typically use a library like jsPDF or html2pdf here
  console.log('Exporting to PDF:', entries);
}; 