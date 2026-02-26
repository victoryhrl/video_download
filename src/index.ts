import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import videoRoutes from './routes/video.routes';

import './jobs/download.worker'; // Start the BullMQ worker

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/video', videoRoutes);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
