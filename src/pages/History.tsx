import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getHistory } from "@/lib/api";
interface HistoryItem {
  job_id: string;
  student_name: string;
  student_id: string;
  exam_name: string;
  subject: string;
  percentage: number;
  grade: string;
  state: string;
  created_at: string;
  total_marks: number;
  total_marks_obtained: number;
}

const History: React.FC = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchHistory();
  }, [filter]);

    const fetchHistory = async () => {
    try {
        setLoading(true);
        const params = filter !== 'all' ? { status: filter } : {};
        const response = await getHistory(params);
        setHistory(response.data.history);
    } catch (error) {
        console.error('Failed to fetch history:', error);
    } finally {
        setLoading(false);
    }
    };

  const getStateColor = (state: string) => {
    switch (state) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'processing':
      case 'assessing':
      case 'generating_feedback':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A':
        return 'text-green-600 font-bold';
      case 'B':
        return 'text-blue-600 font-bold';
      case 'C':
        return 'text-yellow-600 font-bold';
      case 'D':
      case 'F':
        return 'text-red-600 font-bold';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Test History
          </h1>
          <p className="text-gray-600">
            View and manage your past test submissions
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {['all', 'completed', 'failed', 'processing'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`${
                  filter === tab
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* History Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Loading history...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No history found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Upload a test to get started
            </p>
            <div className="mt-6">
              <button
                onClick={() => navigate('/upload')}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
              >
                Upload Test
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {history.map((item) => (
              <div
                key={item.job_id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/results/${item.job_id}`)}
              >
                <div className="p-6">
                  {/* Status Badge */}
                  <div className="flex justify-between items-start mb-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStateColor(
                        item.state
                      )}`}
                    >
                      {item.state}
                    </span>
                    {item.grade !== 'N/A' && (
                      <span className={`text-2xl ${getGradeColor(item.grade)}`}>
                        {item.grade}
                      </span>
                    )}
                  </div>

                  {/* Student Info */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {item.student_name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    ID: {item.student_id}
                  </p>

                  {/* Exam Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Exam:</span>
                      <span className="font-medium text-gray-900">
                        {item.exam_name}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subject:</span>
                      <span className="font-medium text-gray-900">
                        {item.subject}
                      </span>
                    </div>
                  </div>

                  {/* Score */}
                  {item.state === 'completed' && (
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Score:</span>
                        <div className="text-right">
                          <span className="text-2xl font-bold text-gray-900">
                            {item.percentage.toFixed(1)}%
                          </span>
                          <p className="text-xs text-gray-500">
                            {item.total_marks_obtained.toFixed(1)}/{item.total_marks}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Date */}
<div className="mt-4 text-xs text-gray-400">
  {(() => {
    if (!item.created_at) return 'Date unavailable';
    
    try {
      // Parse the date (handles both ISO strings and timestamps)
      const date = new Date(item.created_at);
      
      // Check if valid
      if (isNaN(date.getTime())) return 'Invalid date';
      
      // Format for India timezone
      return date.toLocaleString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Kolkata',
      });
    } catch (error) {
      console.error('Date parsing error:', error, 'Value:', item.created_at);
      return 'Date error';
    }
  })()}
</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
