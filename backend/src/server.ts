import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import authRoute from './routes/auth';
import poemsRoute from './routes/poems';
import classesRoute from './routes/classes';
import usersRoute from './routes/users';
import essayTasksRoute from './routes/essay-tasks';
import essaysRoute from './routes/essays';
import annotationsRoute from './routes/annotations';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoute);
app.use('/api/poems', poemsRoute);
app.use('/api/classes', classesRoute);
app.use('/api/users', usersRoute);
app.use('/api/essay-tasks', essayTasksRoute);
app.use('/api/essays', essaysRoute);
app.use('/api/annotations', annotationsRoute);

async function main() {
  try {
    await prisma.$connect();
    console.log('Database connected successfully');
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to connect to database:', error);
    process.exit(1);
  }
}

main();

export default app;
