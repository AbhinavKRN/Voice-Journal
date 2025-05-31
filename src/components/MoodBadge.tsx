import { getMoodColor, getMoodEmoji } from '../utils/helpers';

interface MoodBadgeProps {
  mood: string;
  showEmoji?: boolean;
}

export default function MoodBadge({ mood, showEmoji = true }: MoodBadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${getMoodColor(mood)}`}>
      {showEmoji && <span className="mr-1">{getMoodEmoji(mood)}</span>}
      {mood.charAt(0).toUpperCase() + mood.slice(1)}
    </span>
  );
} 