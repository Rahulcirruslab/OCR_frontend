import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSavedFiles, reprocessFile } from '@/lib/api';
import { FileText, RefreshCw, Calendar, User } from 'lucide-react';
import { motion } from 'framer-motion';

interface SavedFile {
  job_id: string;
  file_name: string;
  file_size: number;
  student_name: string;
  student_id: string;
  exam_name: string;
  subject: string;
  uploaded_at: string;
  state: string;
  percentage: number;
}

const SavedFiles: React.FC = () => {
  const [files, setFiles] = useState<SavedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [reprocessing, setReprocessing] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSavedFiles();
  }, []);

  const fetchSavedFiles = async () => {
    try {
      setLoading(true);
      const response = await getSavedFiles();
      setFiles(response.data.files);
    } catch (error) {
      console.error('Failed to fetch saved files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReprocess = async (jobId: string) => {
    try {
      setReprocessing(jobId);
      const response = await reprocessFile(jobId);
      const newJobId = response.data.new_job_id;
      
      navigate(`/results/${newJobId}`);
    } catch (error) {
      console.error('Failed to reprocess file:', error);
      alert('Failed to reprocess file');
    } finally {
      setReprocessing(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getStateColor = (state: string) => {
    switch (state) {
      case 'completed':
        return 'bg-green-500/20 text-green-600 border border-green-500/30';
      case 'failed':
        return 'bg-red-500/20 text-red-600 border border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-600 border border-gray-500/30';
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold gradient-text mb-2">
              Saved Files
            </h1>
            <p className="text-muted-foreground">
              View and reprocess previously uploaded test papers
            </p>
          </div>

          {/* Files Grid */}
          {loading ? (
            <div className="text-center py-12">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="inline-block h-12 w-12 border-4 border-primary border-t-transparent rounded-full"
              />
              <p className="mt-4 text-muted-foreground">Loading files...</p>
            </div>
          ) : files.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card rounded-2xl p-12 text-center"
            >
              <FileText className="mx-auto h-16 w-16 text-primary mb-4 glow-primary" />
              <h3 className="text-xl font-semibold mb-2">No saved files</h3>
              <p className="text-muted-foreground mb-6">
                Upload a test to get started
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/upload')}
                className="px-6 py-3 gradient-primary text-white font-medium rounded-lg shadow-lg"
              >
                Upload Test
              </motion.button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {files.map((file, index) => (
                <motion.div
                  key={file.job_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card rounded-xl p-6 hover:scale-[1.02] transition-all"
                >
                  {/* File Icon and Name */}
                  <div className="flex items-start mb-4">
                    <FileText className="h-10 w-10 text-primary mr-3 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold truncate">
                        {file.file_name}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.file_size)}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStateColor(
                        file.state
                      )}`}
                    >
                      {file.state}
                    </span>
                  </div>

                  {/* Student Info */}
                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <User className="h-4 w-4 mr-2 text-primary" />
                      <span className="truncate">{file.student_name}</span>
                      <span className="ml-1 text-xs">({file.student_id})</span>
                    </div>
                    <div className="text-muted-foreground">
                      <strong className="text-foreground">Exam:</strong> {file.exam_name}
                    </div>
                    <div className="text-muted-foreground">
                      <strong className="text-foreground">Subject:</strong> {file.subject}
                    </div>
                  </div>

                  {/* Date */}
                  <div className="flex items-center text-xs text-muted-foreground mb-4">
                    <Calendar className="h-4 w-4 mr-1 text-primary" />
                    {(() => {
                      if (!file.uploaded_at) return 'Date unavailable';
                      
                      try {
                        const date = new Date(file.uploaded_at);
                        
                        if (isNaN(date.getTime())) return 'Invalid date';
                        
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
                        console.error('Date parsing error:', error);
                        return 'Date unavailable';
                      }
                    })()}
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate(`/results/${file.job_id}`)}
                      className="flex-1 px-3 py-2 text-sm font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors border border-primary/20"
                    >
                      View Results
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleReprocess(file.job_id)}
                      disabled={reprocessing === file.job_id}
                      className="px-3 py-2 text-sm font-medium text-white gradient-primary rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {reprocessing === file.job_id ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default SavedFiles;
