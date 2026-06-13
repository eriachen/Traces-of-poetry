
import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

const router = Router();
const prisma = new PrismaClient();

function generateInviteCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, teacherId } = req.body;
    
    if (!name || !teacherId) {
      return res.status(400).json({ error: 'Name and teacherId are required' });
    }
    
    const inviteCode = generateInviteCode();
    
    const classData = await prisma.class.create({
      data: {
        name,
        teacherId,
        inviteCode,
      },
    });
    
    await prisma.classMember.create({
      data: {
        userId: teacherId,
        classId: classData.id,
      },
    });
    
    res.json(classData);
  } catch (error) {
    console.error('Create class error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/join', async (req: Request, res: Response) => {
  try {
    const { inviteCode, userId } = req.body;
    
    if (!inviteCode || !userId) {
      return res.status(400).json({ error: 'Invite code and userId are required' });
    }
    
    const classData = await prisma.class.findUnique({
      where: { inviteCode },
      include: { teacher: true },
    });
    
    if (!classData) {
      return res.status(404).json({ error: 'Invalid invite code' });
    }
    
    const existingMember = await prisma.classMember.findUnique({
      where: {
        userId_classId: {
          userId,
          classId: classData.id,
        },
      },
    });
    
    if (existingMember) {
      return res.status(400).json({ error: 'Already a member of this class' });
    }
    
    await prisma.classMember.create({
      data: {
        userId,
        classId: classData.id,
      },
    });
    
    res.json({ success: true, class: classData });
  } catch (error) {
    console.error('Join class error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/user/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    const memberships = await prisma.classMember.findMany({
      where: { userId },
      include: {
        class: {
          include: {
            teacher: {
              select: { id: true, name: true },
            },
            _count: {
              select: { members: true },
            },
          },
        },
      },
    });
    
    const classes = memberships.map(m => ({
      ...m.class,
      memberCount: m.class._count.members,
    }));
    
    res.json(classes);
  } catch (error) {
    console.error('Get user classes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:classId', async (req: Request, res: Response) => {
  try {
    const { classId } = req.params;
    
    const classData = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        teacher: {
          select: { id: true, name: true, email: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, role: true },
            },
          },
        },
      },
    });
    
    if (!classData) {
      return res.status(404).json({ error: 'Class not found' });
    }
    
    res.json(classData);
  } catch (error) {
    console.error('Get class error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 获取班级成员
router.get('/:classId/members', async (req: Request, res: Response) => {
  try {
    const { classId } = req.params;
    
    const classMembers = await prisma.classMember.findMany({
      where: { classId },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });
    
    const members = classMembers.map(m => ({
      id: m.user.id,
      email: m.user.email,
      name: m.user.name,
      role: m.user.role,
      joinedAt: m.joinedAt
    }));
    
    res.json(members);
  } catch (error) {
    console.error('Get class members error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 移除学生
router.delete('/:classId/members/:userId', async (req: Request, res: Response) => {
  try {
    const { classId, userId } = req.params;
    
    await prisma.classMember.delete({
      where: {
        userId_classId: {
          userId,
          classId,
        },
      },
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Remove class member error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 添加学生
router.post('/:classId/members', async (req: Request, res: Response) => {
  try {
    const { classId } = req.params;
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    const user = await prisma.user.findUnique({
      where: { email },
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const existingMember = await prisma.classMember.findUnique({
      where: {
        userId_classId: {
          userId: user.id,
          classId,
        },
      },
    });
    
    if (existingMember) {
      return res.status(400).json({ error: 'User is already a member of this class' });
    }
    
    await prisma.classMember.create({
      data: {
        userId: user.id,
        classId,
      },
    });
    
    res.json({ success: true, user });
  } catch (error) {
    console.error('Add class member error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
