import axios from 'axios';

const API_BASE = 'http://localhost:3001/api/video';

export interface TaskResponse {
    taskId: string;
    state: 'active' | 'waiting' | 'completed' | 'failed' | 'delayed';
    progress: number;
    failedReason?: string;
}

export const submitDownloadTask = async (url: string) => {
    const response = await axios.post(`${API_BASE}/download`, { url });
    return response.data;
};

export const getTaskStatus = async (taskId: string): Promise<TaskResponse> => {
    const response = await axios.get(`${API_BASE}/task/${taskId}`);
    return response.data;
};

export const getStreamUrl = (taskId: string) => {
    return `${API_BASE}/stream/${taskId}`;
};
