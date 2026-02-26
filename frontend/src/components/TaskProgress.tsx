import React from 'react';
import type { TaskResponse } from '../services/api';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface TaskProgressProps {
    task: TaskResponse;
    className?: string;
}

export const TaskProgress: React.FC<TaskProgressProps> = ({ task, className }) => {
    const isCompleted = task.state === 'completed';
    const isFailed = task.state === 'failed';
    const isActive = task.state === 'active' || task.state === 'waiting';

    return (
        <div className={cn("w-full bg-dark-800/80 rounded-2xl p-6 border border-white/5", className)}>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    {isActive && <Loader2 className="w-5 h-5 text-primary-400 animate-spin" />}
                    {isCompleted && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                    {isFailed && <XCircle className="w-5 h-5 text-rose-400" />}

                    <span className="text-sm font-medium text-gray-200 uppercase tracking-wider">
                        {task.state}
                    </span>
                </div>

                {isActive && (
                    <span className="text-primary-400 font-bold tabular-nums">
                        {task.progress.toFixed(1)}%
                    </span>
                )}
            </div>

            <div className="h-2 w-full bg-dark-900 rounded-full overflow-hidden">
                <div
                    className={cn(
                        "h-full rounded-full transition-all duration-300 ease-out",
                        isCompleted ? "bg-emerald-500" : isFailed ? "bg-rose-500" : "bg-gradient-to-r from-primary-500 to-fuchsia-500"
                    )}
                    style={{ width: `${isCompleted ? 100 : task.progress}%` }}
                />
            </div>

            {isFailed && task.failedReason && (
                <p className="mt-4 text-xs text-rose-400/80 bg-rose-500/10 p-3 rounded-lg border border-rose-500/20">
                    {task.failedReason}
                </p>
            )}
        </div>
    );
};
