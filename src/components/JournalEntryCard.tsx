import { formatDate } from '../utils/helpers';
import MoodBadge from './MoodBadge';
import type { JournalEntry } from '../types';

interface JournalEntryCardProps {
  entry: JournalEntry;
}

export default function JournalEntryCard({ entry }: JournalEntryCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 space-y-4">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <span className="text-sm text-gray-500 dark:text-gray-300">
            {formatDate(entry.created_at)}
          </span>
          <MoodBadge mood={entry.mood} />
        </div>
      </div>
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-300">Your Entry:</h3>
          <p className="mt-1 text-gray-900 dark:text-gray-100">{entry.transcript}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-300">AI Response:</h3>
          <p className="mt-1 text-gray-900 dark:text-gray-100">{entry.ai_response}</p>
        </div>
      </div>
    </div>
  );
} 