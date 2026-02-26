import React, { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { cn } from './TaskProgress';

interface UrlInputProps {
    onSubmit: (url: string) => void;
    isLoading?: boolean;
}

export const UrlInput: React.FC<UrlInputProps> = ({ onSubmit, isLoading }) => {
    const [url, setUrl] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (url.trim()) {
            onSubmit(url.trim());
            setUrl('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400 group-focus-within:text-primary-400 transition-colors" />
            </div>
            <input
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste video URL here (Youtube, Bilibili, TikTok...)"
                disabled={isLoading}
                className={cn(
                    "block w-full pl-12 pr-32 py-4 rounded-2xl",
                    "glass-input text-gray-100 placeholder-gray-500",
                    "text-lg shadow-xl"
                )}
            />
            <div className="absolute inset-y-2 right-2 flex items-center">
                <button
                    type="submit"
                    disabled={isLoading || !url.trim()}
                    className={cn(
                        "px-6 py-2 rounded-xl font-medium transition-all duration-300",
                        "bg-gradient-to-r from-primary-500 to-fuchsia-500 hover:opacity-90 text-white",
                        "disabled:opacity-50 disabled:cursor-not-allowed",
                        "shadow-lg shadow-primary-500/25 flex items-center gap-2"
                    )}
                >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Parse'}
                </button>
            </div>
        </form>
    );
};
