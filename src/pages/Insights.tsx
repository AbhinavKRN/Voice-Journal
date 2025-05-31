import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createClient } from '@supabase/supabase-js';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import PageContainer from '../components/PageContainer';
import LoadingSpinner from '../components/LoadingSpinner';
import type { JournalEntry } from '../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function Insights() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  const isDark = typeof window !== 'undefined' && window.document.documentElement.classList.contains('dark');

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
        .order('created_at', { ascending: true });

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error('Error fetching entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMoodData = () => {
    const moodCounts = entries.reduce((acc, entry) => {
      acc[entry.mood] = (acc[entry.mood] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      labels: Object.keys(moodCounts),
      datasets: [
        {
          data: Object.values(moodCounts),
          backgroundColor: [
            '#60A5FA', // blue
            '#34D399', // green
            '#FBBF24', // yellow
            '#F87171', // red
            '#A78BFA', // purple
          ],
        },
      ],
    };
  };

  const getMoodTrendData = () => {
    const last7Days = entries.slice(-7);
    const dates = last7Days.map(entry => 
      new Date(entry.created_at).toLocaleDateString('en-US', { weekday: 'short' })
    );
    const moods = last7Days.map(entry => entry.mood);

    return {
      labels: dates,
      datasets: [
        {
          label: 'Mood Trend',
          data: moods.map(mood => {
            const moodValues: Record<string, number> = {
              'happy': 5,
              'excited': 4,
              'neutral': 3,
              'anxious': 2,
              'sad': 1,
            };
            return moodValues[mood] || 3;
          }),
          borderColor: '#60A5FA',
          tension: 0.4,
        },
      ],
    };
  };

  const getWeeklyMoodDistribution = () => {
    const moodCounts = entries.reduce((acc, entry) => {
      const day = new Date(entry.created_at).toLocaleDateString('en-US', { weekday: 'long' });
      if (!acc[day]) {
        acc[day] = {};
      }
      acc[day][entry.mood] = (acc[day][entry.mood] || 0) + 1;
      return acc;
    }, {} as Record<string, Record<string, number>>);

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const moods = ['happy', 'excited', 'neutral', 'anxious', 'sad'];

    return {
      labels: days,
      datasets: moods.map((mood, index) => ({
        label: mood,
        data: days.map(day => moodCounts[day]?.[mood] || 0),
        backgroundColor: [
          '#60A5FA',
          '#34D399',
          '#FBBF24',
          '#F87171',
          '#A78BFA',
        ][index],
      })),
    };
  };

  return (
    <PageContainer>
      {loading ? (
        <LoadingSpinner />
      ) : entries.length === 0 ? (
        <div className="text-center text-gray-600 dark:text-gray-300">No entries found</div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Mood Distribution</h2>
            <div className="h-64">
              <Doughnut data={getMoodData()} options={{
                plugins: {
                  legend: {
                    labels: { color: isDark ? '#fff' : '#222' },
                  },
                  title: {
                    color: isDark ? '#fff' : '#222',
                  },
                },
              }} />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Mood Trend (Last 7 Days)</h2>
            <div className="h-64">
              <Line
                data={getMoodTrendData()}
                options={{
                  plugins: {
                    legend: {
                      labels: { color: isDark ? '#fff' : '#222' },
                    },
                    title: {
                      color: isDark ? '#fff' : '#222',
                    },
                  },
                  scales: {
                    y: {
                      min: 0,
                      max: 6,
                      ticks: {
                        stepSize: 1,
                        color: isDark ? '#fff' : '#222',
                        callback: (value) => {
                          const labels: Record<number, string> = {
                            5: 'Happy',
                            4: 'Excited',
                            3: 'Neutral',
                            2: 'Anxious',
                            1: 'Sad',
                          };
                          return labels[value as number] || '';
                        },
                      },
                      grid: { color: isDark ? '#444' : '#e5e7eb' },
                    },
                    x: {
                      ticks: { color: isDark ? '#fff' : '#222' },
                      grid: { color: isDark ? '#444' : '#e5e7eb' },
                    },
                  },
                }}
              />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 lg:col-span-2">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Weekly Mood Distribution</h2>
            <div className="h-64">
              <Bar
                data={getWeeklyMoodDistribution()}
                options={{
                  plugins: {
                    legend: {
                      labels: { color: isDark ? '#fff' : '#222' },
                    },
                    title: {
                      color: isDark ? '#fff' : '#222',
                    },
                  },
                  scales: {
                    x: {
                      stacked: true,
                      ticks: { color: isDark ? '#fff' : '#222' },
                      grid: { color: isDark ? '#444' : '#e5e7eb' },
                    },
                    y: {
                      stacked: true,
                      ticks: { color: isDark ? '#fff' : '#222' },
                      grid: { color: isDark ? '#444' : '#e5e7eb' },
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
} 