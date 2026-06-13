import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// 获取用户的所有批注
router.get('/user/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    const annotations = await prisma.annotation.findMany({
      where: { userId },
      include: { poem: true },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(annotations);
  } catch (error) {
    console.error('Get user annotations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 获取某首诗的所有批注
router.get('/poem/:poemId', async (req: Request, res: Response) => {
  try {
    const { poemId } = req.params;
    
    const annotations = await prisma.annotation.findMany({
      where: { poemId },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(annotations);
  } catch (error) {
    console.error('Get poem annotations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 创建新批注
router.post('/', async (req: Request, res: Response) => {
  try {
    const { poemId, userId, content, isPublic, startPos = 0, endPos = 0 } = req.body;
    
    if (!poemId || !userId || !content) {
      return res.status(400).json({ error: 'Required fields are missing' });
    }
    
    const annotation = await prisma.annotation.create({
      data: {
        poemId,
        userId,
        content,
        isPublic: isPublic || false,
        startPos,
        endPos
      }
    });
    
    res.json(annotation);
  } catch (error) {
    console.error('Create annotation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 更新批注
router.put('/:annotationId', async (req: Request, res: Response) => {
  try {
    const { annotationId } = req.params;
    const { content, isPublic } = req.body;
    
    const updatedData: any = {};
    if (content) updatedData.content = content;
    if (isPublic !== undefined) updatedData.isPublic = isPublic;
    
    const annotation = await prisma.annotation.update({
      where: { id: annotationId },
      data: updatedData
    });
    
    res.json(annotation);
  } catch (error) {
    console.error('Update annotation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 删除批注
router.delete('/:annotationId', async (req: Request, res: Response) => {
  try {
    const { annotationId } = req.params;
    
    await prisma.annotation.delete({
      where: { id: annotationId }
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Delete annotation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
