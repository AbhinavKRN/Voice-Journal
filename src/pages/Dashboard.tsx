import { Link as RouterLink } from 'react-router-dom';
import PageContainer from '../components/PageContainer';

export default function Dashboard() {
  return (
    <PageContainer>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <RouterLink
          to="/journal"
          className="card hover:shadow-lg transition-shadow duration-200"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">New Journal Entry</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Record your thoughts and start a conversation with your AI companion.
          </p>
        </RouterLink>
        <RouterLink
          to="/history"
          className="card hover:shadow-lg transition-shadow duration-200"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Journal History</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Review your past entries and conversations.
          </p>
        </RouterLink>
        <RouterLink
          to="/insights"
          className="card hover:shadow-lg transition-shadow duration-200"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Insights</h2>
          <p className="text-gray-600 dark:text-gray-300">
            View patterns, mood trends, and personalized insights.
          </p>
        </RouterLink>
      </div>
    </PageContainer>
  );
} 