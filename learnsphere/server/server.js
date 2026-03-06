// import express from 'express';
// import cors from 'cors';
// import admin from 'firebase-admin';
// import connectDB from './config/db';
// import adminRoutes from './routes/admin';
// import candidateRoutes from './routes/candidate';

// const app = express();

// admin.initializeApp({
//   credential: admin.credential.cert(require('./serviceAccountKey.json'))
// });

// app.use(cors());
// app.use(express.json());

// connectDB();

// app.use('/api/admin', adminRoutes);
// app.use('/api/candidate', candidateRoutes);

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import adminRoutes from './routes/admin.js';
import candidateRoutes from './routes/candidate.js';
import './config/firebase-admin.js';
import userRoutes from './routes/user.js';
import dotenv from "dotenv";


dotenv.config();

console.log("Loaded FIREBASE_SERVICE_ACCOUNT:", !!process.env.FIREBASE_SERVICE_ACCOUNT);

const app = express();

const corsOptions = {
  origin: process.env.FRONTEND_URL,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
connectDB();

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/candidate', candidateRoutes);
app.use('/api/user', userRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));