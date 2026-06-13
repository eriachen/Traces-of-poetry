import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// 获取班级的任务列表
router.get('/class/:classId', async (req: Request, res: Response) => {
  try {
    const { classId } = req.params;
    
    const tasks = await prisma.essayTask.findMany({
      where: { classId },
      include: {
        teacher: { select: { id: true, name: true } },
        submissions: {
          include: { user: { select: { id: true, name: true } } }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // 为每个任务计算进度
    const tasksWithProgress = tasks.map(task => {
      const totalStudents = task.class ? 0 : 0; // 需要从 class 获取
      const totalSubmissions = task.submissions.length;
      
      return {
        ...task,
        totalSubmissions,
        totalStudents: 0
      };
    });
    
    res.json(tasksWithProgress);
  } catch (error) {
    console.error('Get essay tasks error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 创建新任务
router.post('/', async (req: Request, res: Response) => {
  try {
    const { classId, teacherId, title, description, content, dueDate } = req.body;
    
    if (!classId || !teacherId || !title) {
      return res.status(400).json({ error: 'Required fields are missing' });
    }
    
    const task = await prisma.essayTask.create({
      data: {
        classId,
        teacherId,
        title,
        description,
        content,
        dueDate: dueDate ? new Date(dueDate) : null
      }
    });
    
    res.json(task);
  } catch (error) {
    console.error('Create essay task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 获取单个任务的详情
router.get('/:taskId', async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;
    
    const task = await prisma.essayTask.findUnique({
      where: { id: taskId },
      include: {
        teacher: { select: { id: true, name: true, email: true } },
        class: true
      }
    });
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // 获取班级总人数
    const classMembers = await prisma.classMember.count({
      where: { classId: task.classId }
    });
    
    // 获取已提交的人数
    const submittedCount = await prisma.essay.count({
      where: { taskId, type: 'TASK_SUBMISSION' }
    });
    
    res.json({
      ...task,
      totalStudents: classMembers,
      totalSubmissions: submittedCount
    });
  } catch (error) {
    console.error('Get essay task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 关闭任务
router.patch('/:taskId/close', async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;
    
    const task = await prisma.essayTask.update({
      where: { id: taskId },
      data: { isClosed: true }
    });
    
    res.json(task);
  } catch (error) {
    console.error('Close essay task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
