import { useState, useEffect } from 'react';
import { UrlInput } from './components/UrlInput';
import { TaskProgress } from './components/TaskProgress';
import { submitDownloadTask, getTaskStatus, getStreamUrl, type TaskResponse } from './services/api';
import { PlayCircle, DownloadCloud } from 'lucide-react';

function App() {
  const [activeTask, setActiveTask] = useState<TaskResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Poll for task status
  useEffect(() => {
    let intervalId: number;

    if (activeTask && (activeTask.state === 'active' || activeTask.state === 'waiting')) {
      intervalId = setInterval(async () => {
        try {
          const status = await getTaskStatus(activeTask.taskId);
          setActiveTask(status);

          if (status.state === 'completed' || status.state === 'failed') {
            clearInterval(intervalId);
          }
        } catch (err) {
          console.error('Failed to poll status', err);
        }
      }, 1500) as unknown as number; // poll every 1.5s
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [activeTask?.taskId, activeTask?.state]);

  const handleSubmit = async (url: string) => {
    try {
      setError(null);
      setIsSubmitting(true);
      const res = await submitDownloadTask(url);

      // Initialize the task locally
      setActiveTask({
        taskId: res.taskId,
        state: 'waiting',
        progress: 0
      });

    } catch (err: any) {
      setError(err?.response?.data?.error || err.message || 'Failed to submit task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isCompleted = activeTask?.state === 'completed';

  return (
    <div className="min-h-screen relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      {/* Background Decorators */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full mix-blend-screen filter blur-[128px] animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-fuchsia-500/20 rounded-full mix-blend-screen filter blur-[128px] animate-pulse" style={{ animationDelay: '2s' }} />

      <main className="w-full max-w-3xl relative z-10 flex flex-col items-center">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-white/5 border border-white/10 mb-4 shadow-xl shadow-primary-500/10">
            <DownloadCloud className="w-8 h-8 text-primary-400" />
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-primary-200 to-white pb-2">
            Universal Video Saver
          </h1>
          <p className="text-lg text-gray-400 max-w-xl mx-auto">
            Paste a link from anywhere. We'll download it in the background and stream it instantly in high quality.
          </p>
        </div>

        {/* Action Center */}
        <div className="w-full glass-panel rounded-3xl p-8 mb-8">
          <UrlInput onSubmit={handleSubmit} isLoading={isSubmitting} />

          {error && (
            <div className="mt-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-medium">
              {error}
            </div>
          )}
        </div>

        {/* Progress & Result Area */}
        {activeTask && (
          <div className="w-full space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
            <TaskProgress task={activeTask} />

            {/* Video Player (Appears when completed) */}
            {isCompleted && (
              <div className="w-full glass-panel rounded-3xl overflow-hidden shadow-2xl shadow-primary-500/10 transition-all">
                <div className="bg-dark-900 border-b border-white/5 p-4 flex items-center gap-3">
                  <PlayCircle className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-medium text-gray-200">Ready to Play</h3>
                </div>
                <div className="aspect-video w-full bg-black relative">
                  <video
                    controls
                    autoPlay
                    className="w-full h-full object-contain"
                    src={getStreamUrl(activeTask.taskId)}
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
