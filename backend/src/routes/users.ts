
import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        school: true,
        grade: true,
        subject: true,
        avatar: true,
        createdAt: true,
      },
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id/stats', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const [
      totalAnnotations,
      totalEssays,
      totalImitations,
      studyProgress,
    ] = await Promise.all([
      prisma.annotation.count({ where: { userId: id } }),
      prisma.essay.count({ where: { userId: id } }),
      prisma.imitation.count({ where: { userId: id } }),
      prisma.studyProgress.findMany({
        where: { userId: id },
        include: { poem: true },
      }),
    ]);
    
    const masteredCount = studyProgress.filter(p => p.status === 'MASTERED').length;
    const inProgressCount = studyProgress.filter(p => p.status === 'IN_PROGRESS').length;
    
    res.json({
      totalAnnotations,
      totalEssays,
      totalImitations,
      masteredCount,
      inProgressCount,
      totalPoemsStudied: studyProgress.length,
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
