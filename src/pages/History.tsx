import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createClient } from '@supabase/supabase-js';
import PageContainer from '../components/PageContainer';
import LoadingSpinner from '../components/LoadingSpinner';
import JournalEntryCard from '../components/JournalEntryCard';
import type { JournalEntry } from '../types';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function History() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [moodFilter, setMoodFilter] = useState('all');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    fetchEntries();
  }, [user, navigate]);

  const fetchEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error('Error fetching entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch = entry.transcript.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.ai_response.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMood = moodFilter === 'all' || entry.mood === moodFilter;
    return matchesSearch && matchesMood;
  });

  return (
    <PageContainer>
      <div className="space-y-6">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search entries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field flex-1 bg-white dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
          />
          <select
            value={moodFilter}
            onChange={(e) => setMoodFilter(e.target.value)}
            className="input-field w-48 bg-white dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
          >
            <option value="all">All Moods</option>
            <option value="happy">Happy</option>
            <option value="sad">Sad</option>
            <option value="neutral">Neutral</option>
            <option value="anxious">Anxious</option>
            <option value="excited">Excited</option>
          </select>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : filteredEntries.length === 0 ? (
          <div className="text-center text-gray-600 dark:text-gray-300">No entries found</div>
        ) : (
          <div className="space-y-6">
            {filteredEntries.map((entry) => (
              <JournalEntryCard key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
} 