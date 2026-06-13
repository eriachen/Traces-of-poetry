import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const router = Router();
const prisma = new PrismaClient();

const dynastyOptions = ['先秦', '汉', '唐', '宋', '元', '明', '清', '近现代'];

// Helper to parse JSON fields safely
function parsePoem(poem: any) {
  return {
    ...poem,
    annotations: poem.builtinAnnotations ? JSON.parse(poem.builtinAnnotations) : [],
    tags: poem.tags ? JSON.parse(poem.tags) : [],
    imageryTags: poem.imageryTags ? JSON.parse(poem.imageryTags) : [],
    emotionTags: poem.emotionTags ? JSON.parse(poem.emotionTags) : [],
  };
}

router.get('/', async (req: Request, res: Response) => {
  try {
    const { dynasty, classId, search, imageryTag, emotionTag } = req.query;
    
    const where: any = {
      OR: [
        { source: 'INTERNAL' },
        ...(classId ? [{ source: 'USER', classId: classId as string }] : [])
      ]
    };
    
    if (dynasty && typeof dynasty === 'string') {
      const dynasties = dynasty.split(',');
      where.dynasty = { in: dynasties };
    }
    
    if (search && typeof search === 'string') {
      where.OR = [
        { title: { contains: search } },
        { author: { contains: search } },
        { content: { contains: search } },
      ];
    }
    
    const poems = await prisma.poem.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    
    const mappedPoems = poems.map(parsePoem);
    
    // Filter by tags if needed
    let filteredPoems = mappedPoems;
    if (imageryTag && typeof imageryTag === 'string') {
      filteredPoems = filteredPoems.filter(p => p.imageryTags.includes(imageryTag));
    }
    if (emotionTag && typeof emotionTag === 'string') {
      filteredPoems = filteredPoems.filter(p => p.emotionTags.includes(emotionTag));
    }
    
    res.json(filteredPoems);
  } catch (error) {
    console.error('Get poems error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/map-data', async (req: Request, res: Response) => {
  try {
    const { dynasty, classId } = req.query;
    
    const where: any = {
      OR: [
        { source: 'INTERNAL' },
        ...(classId ? [{ source: 'USER', classId: classId as string }] : [])
      ],
      locationLat: { not: null },
      locationLng: { not: null },
    };
    
    if (dynasty && typeof dynasty === 'string' && dynasty !== 'all') {
      const dynasties = dynasty.split(',');
      where.dynasty = { in: dynasties };
    }
    
    const poems = await prisma.poem.findMany({
      where,
      select: {
        id: true,
        title: true,
        author: true,
        dynasty: true,
        locationModern: true,
        locationLat: true,
        locationLng: true,
        imageryTags: true,
        emotionTags: true,
      },
    });
    
    const provinceData: Record<string, any> = {};
    
    poems.forEach(poem => {
      if (poem.locationModern) {
        if (!provinceData[poem.locationModern]) {
          provinceData[poem.locationModern] = {
            province: poem.locationModern,
            lat: poem.locationLat,
            lng: poem.locationLng,
            count: 0,
            poems: [],
          };
        }
        const parsedPoem = {
          ...poem,
          imageryTags: poem.imageryTags ? JSON.parse(poem.imageryTags) : [],
          emotionTags: poem.emotionTags ? JSON.parse(poem.emotionTags) : [],
        };
        provinceData[poem.locationModern].count++;
        provinceData[poem.locationModern].poems.push(parsedPoem);
      }
    });
    
    res.json(Object.values(provinceData));
  } catch (error) {
    console.error('Get map data error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const poem = await prisma.poem.findUnique({
      where: { id },
    });
    
    if (!poem) {
      return res.status(404).json({ error: 'Poem not found' });
    }
    
    const mappedPoem = parsePoem(poem);
    res.json(mappedPoem);
  } catch (error) {
    console.error('Get poem error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/author/:author', async (req: Request, res: Response) => {
  try {
    const { author } = req.params;
    
    const poems = await prisma.poem.findMany({
      where: {
        author,
        OR: [
          { source: 'INTERNAL' },
        ],
      },
      orderBy: { createdYear: 'asc' },
    });
    
    const mappedPoems = poems.map(parsePoem);
    res.json(mappedPoems);
  } catch (error) {
    console.error('Get author poems error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 创建新诗词
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      title,
      author,
      dynasty,
      content,
      locationAncient,
      locationModern,
      tags,
      authorBio,
      background,
      createdBy,
      classId
    } = req.body;

    if (!title || !author || !dynasty || !content || !locationModern) {
      return res.status(400).json({ error: 'Required fields are missing' });
    }

    // 省份坐标映射
    const provinceCoords: Record<string, { lat: number; lng: number }> = {
      '北京': { lat: 39.9, lng: 116.4 },
      '天津': { lat: 39.1, lng: 117.2 },
      '河北': { lat: 38.0, lng: 114.5 },
      '山西': { lat: 37.8, lng: 112.5 },
      '内蒙古': { lat: 40.8, lng: 111.7 },
      '辽宁': { lat: 41.8, lng: 123.4 },
      '吉林': { lat: 43.9, lng: 125.3 },
      '黑龙江': { lat: 45.7, lng: 126.6 },
      '上海': { lat: 31.2, lng: 121.5 },
      '江苏': { lat: 32.1, lng: 118.8 },
      '浙江': { lat: 30.3, lng: 120.2 },
      '安徽': { lat: 31.8, lng: 117.3 },
      '福建': { lat: 26.1, lng: 119.3 },
      '江西': { lat: 28.7, lng: 115.9 },
      '山东': { lat: 36.7, lng: 117.0 },
      '河南': { lat: 34.8, lng: 113.6 },
      '湖北': { lat: 30.6, lng: 114.3 },
      '湖南': { lat: 28.2, lng: 113.0 },
      '广东': { lat: 23.1, lng: 113.3 },
      '广西': { lat: 22.8, lng: 108.3 },
      '海南': { lat: 20.0, lng: 110.3 },
      '重庆': { lat: 29.5, lng: 106.5 },
      '四川': { lat: 30.7, lng: 104.1 },
      '贵州': { lat: 26.6, lng: 106.7 },
      '云南': { lat: 25.0, lng: 102.7 },
      '西藏': { lat: 29.6, lng: 91.1 },
      '陕西': { lat: 34.3, lng: 108.9 },
      '甘肃': { lat: 36.1, lng: 103.8 },
      '青海': { lat: 36.6, lng: 101.8 },
      '宁夏': { lat: 38.5, lng: 106.3 },
      '新疆': { lat: 43.8, lng: 87.6 },
      '香港': { lat: 22.3, lng: 114.2 },
      '澳门': { lat: 22.2, lng: 113.5 },
      '台湾': { lat: 25.0, lng: 121.5 }
    };

    const coords = provinceCoords[locationModern] || { lat: 35.0, lng: 110.0 };

    const poemData: any = {
      title,
      author,
      dynasty,
      content,
      locationAncient,
      locationModern,
      locationLat: coords.lat,
      locationLng: coords.lng,
      tags: tags ? JSON.stringify(tags) : null,
      authorBio,
      background,
      source: 'USER',
      createdBy
    };

    if (classId) {
      poemData.classId = classId;
    }

    const poem = await prisma.poem.create({
      data: poemData
    });

    const mappedPoem = parsePoem(poem);
    res.json(mappedPoem);
  } catch (error) {
    console.error('Create poem error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
