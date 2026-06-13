import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// 获取用户的研究列表
router.get('/user/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    const essays = await prisma.essay.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(essays);
  } catch (error) {
    console.error('Get user essays error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 获取单个研究
router.get('/:essayId', async (req: Request, res: Response) => {
  try {
    const { essayId } = req.params;
    
    const essay = await prisma.essay.findUnique({
      where: { id: essayId }
    });
    
    if (!essay) {
      return res.status(404).json({ error: 'Essay not found' });
    }
    
    res.json(essay);
  } catch (error) {
    console.error('Get essay error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 创建新研究
router.post('/', async (req: Request, res: Response) => {
  try {
    console.log('Create essay request:', req.body);
    const { title, content, userId, visibility, type, taskId, isDraft } = req.body;
    
    if (!title || !content || !userId) {
      console.log('Missing required fields:', { title, content, userId });
      return res.status(400).json({ error: 'Required fields are missing' });
    }
    
    const essay = await prisma.essay.create({
      data: {
        title,
        content,
        userId,
        visibility: visibility || 'PRIVATE',
        type: type || 'GENERAL',
        taskId,
        isDraft: isDraft !== undefined ? isDraft : true,
      }
    });
    
    console.log('Essay created:', essay);
    res.json(essay);
  } catch (error) {
    console.error('Create essay error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 更新研究
router.put('/:essayId', async (req: Request, res: Response) => {
  try {
    const { essayId } = req.params;
    const { title, content, visibility, type, isDraft } = req.body;
    
    const updatedData: any = {};
    if (title) updatedData.title = title;
    if (content) updatedData.content = content;
    if (visibility) updatedData.visibility = visibility;
    if (type) updatedData.type = type;
    if (isDraft !== undefined) updatedData.isDraft = isDraft;
    
    const essay = await prisma.essay.update({
      where: { id: essayId },
      data: updatedData
    });
    
    res.json(essay);
  } catch (error) {
    console.error('Update essay error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 添加评论
router.post('/:essayId/comments', async (req: Request, res: Response) => {
  try {
    const { essayId } = req.params;
    const { authorId, content, isTeacher, isStarred, visibility } = req.body;
    
    const comment = await prisma.comment.create({
      data: {
        essayId,
        authorId,
        content,
        isTeacher: isTeacher || false,
        isStarred: isStarred || false,
        visibility: visibility || 'AUTHOR'
      }
    });
    
    res.json(comment);
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 加精/取消加精
router.patch('/:essayId/comments/:commentId/star', async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;
    const { isStarred } = req.body;
    
    const comment = await prisma.comment.update({
      where: { id: commentId },
      data: { isStarred: isStarred || false }
    });
    
    res.json(comment);
  } catch (error) {
    console.error('Toggle star error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
