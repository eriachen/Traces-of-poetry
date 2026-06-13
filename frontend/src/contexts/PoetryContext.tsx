import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const API_BASE = 'http://localhost:3001/api';

// 省份与坐标的映射
export const provinceCoords: Record<string, { lat: number; lng: number }> = {
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

// 所有朝代列表
export const allDynasties = ['全部', '唐', '宋', '元', '明', '清'];

// 基础诗词接口
export interface Poem {
  id: string;
  title: string;
  author: string;
  dynasty: string;
  content: string[];
  province: string;
  city: string;
  tags: string[];
  year?: string;
  locationLat?: number;
  locationLng?: number;
  isUserAdded?: boolean;
  addedBy?: string;
  isClassPoem?: boolean;
  classId?: string;
  createdAt?: Date;
}

// 诗人游历点
export interface TravelPoint {
  id: string;
  city: string;
  province: string;
  lat: number;
  lng: number;
  year: number;
  period: string;
  poems: Poem[];
}

// 诗人数据
export interface Poet {
  id: string;
  name: string;
  dynasty: string;
  birthYear: number;
  deathYear: number;
  avatar: string;
  color: string;
  travelPoints: TravelPoint[];
  isUserAdded?: boolean;
  addedBy?: string;
  isClassPoem?: boolean;
  classId?: string;
}

// 内置诗词
const builtInPoems: Poem[] = [
  {
    id: 'poem-1',
    title: '静夜思',
    author: '李白',
    dynasty: '唐',
    content: ['床前明月光', '疑是地上霜', '举头望明月', '低头思故乡'],
    province: '江苏',
    city: '扬州',
    tags: ['思乡', '月亮'],
    locationLat: 32.40,
    locationLng: 119.43
  },
  {
    id: 'poem-2',
    title: '春望',
    author: '杜甫',
    dynasty: '唐',
    content: ['国破山河在', '城春草木深', '感时花溅泪', '恨别鸟惊心'],
    province: '陕西',
    city: '长安',
    tags: ['爱国', '战乱'],
    locationLat: 34.3416,
    locationLng: 108.9398
  },
  {
    id: 'poem-3',
    title: '黄鹤楼送孟浩然之广陵',
    author: '李白',
    dynasty: '唐',
    content: ['故人西辞黄鹤楼', '烟花三月下扬州', '孤帆远影碧空尽', '唯见长江天际流'],
    province: '湖北',
    city: '武汉',
    tags: ['送别', '友情'],
    locationLat: 30.5852,
    locationLng: 114.3023
  },
  {
    id: 'poem-4',
    title: '望庐山瀑布',
    author: '李白',
    dynasty: '唐',
    content: ['日照香炉生紫烟', '遥看瀑布挂前川', '飞流直下三千尺', '疑是银河落九天'],
    province: '江西',
    city: '庐山',
    tags: ['山水', '景色'],
    locationLat: 29.5974,
    locationLng: 115.9987
  },
  {
    id: 'poem-5',
    title: '登鹳雀楼',
    author: '王之涣',
    dynasty: '唐',
    content: ['白日依山尽', '黄河入海流', '欲穷千里目', '更上一层楼'],
    province: '山西',
    city: '永济',
    tags: ['哲理', '景色'],
    locationLat: 34.8735,
    locationLng: 110.4578
  },
  {
    id: 'poem-6',
    title: '题西林壁',
    author: '苏轼',
    dynasty: '宋',
    content: ['横看成岭侧成峰', '远近高低各不同', '不识庐山真面目', '只缘身在此山中'],
    province: '江西',
    city: '庐山',
    tags: ['哲理', '山水'],
    locationLat: 29.5974,
    locationLng: 115.9987
  },
  {
    id: 'poem-7',
    title: '饮湖上初晴后雨',
    author: '苏轼',
    dynasty: '宋',
    content: ['水光潋滟晴方好', '山色空蒙雨亦奇', '欲把西湖比西子', '淡妆浓抹总相宜'],
    province: '浙江',
    city: '杭州',
    tags: ['西湖', '景色'],
    locationLat: 30.2500,
    locationLng: 120.1500
  },
  {
    id: 'poem-8',
    title: '枫桥夜泊',
    author: '张继',
    dynasty: '唐',
    content: ['月落乌啼霜满天', '江枫渔火对愁眠', '姑苏城外寒山寺', '夜半钟声到客船'],
    province: '江苏',
    city: '苏州',
    tags: ['思乡', '夜景'],
    locationLat: 31.3040,
    locationLng: 120.6283
  },
  {
    id: 'poem-9',
    title: '钱塘湖春行',
    author: '白居易',
    dynasty: '唐',
    content: ['孤山寺北贾亭西', '水面初平云脚低', '几处早莺争暖树', '谁家新燕啄春泥'],
    province: '浙江',
    city: '杭州',
    tags: ['西湖', '春天'],
    locationLat: 30.2500,
    locationLng: 120.1500
  },
  {
    id: 'poem-10',
    title: '望岳',
    author: '杜甫',
    dynasty: '唐',
    content: ['岱宗夫如何', '齐鲁青未了', '造化钟神秀', '阴阳割昏晓'],
    province: '山东',
    city: '泰安',
    tags: ['泰山', '励志'],
    locationLat: 36.1903,
    locationLng: 117.1008
  },
  {
    id: 'poem-11',
    title: '游山西村',
    author: '陆游',
    dynasty: '宋',
    content: ['莫笑农家腊酒浑', '丰年留客足鸡豚', '山重水复疑无路', '柳暗花明又一村'],
    province: '山西',
    city: '临汾',
    tags: ['田园', '哲理'],
    locationLat: 36.0890,
    locationLng: 111.5139
  },
  {
    id: 'poem-12',
    title: '泊船瓜洲',
    author: '王安石',
    dynasty: '宋',
    content: ['京口瓜洲一水间', '钟山只隔数重山', '春风又绿江南岸', '明月何时照我还'],
    province: '江苏',
    city: '扬州',
    tags: ['思乡', '春天'],
    locationLat: 32.3000,
    locationLng: 119.4000
  }
];

// 内置诗人数据
const builtInPoets: Poet[] = [
  {
    id: 'libai',
    name: '李白',
    dynasty: '唐',
    birthYear: 701,
    deathYear: 762,
    avatar: '李',
    color: '#FF6347',
    travelPoints: [
      {
        id: 'tp-1',
        city: '武汉',
        province: '湖北',
        lat: 30.5852,
        lng: 114.3023,
        year: 725,
        period: '出蜀漫游',
        poems: [builtInPoems[2]]
      },
      {
        id: 'tp-2',
        city: '庐山',
        province: '江西',
        lat: 29.5974,
        lng: 115.9987,
        year: 730,
        period: '游历',
        poems: [builtInPoems[3]]
      },
      {
        id: 'tp-3',
        city: '扬州',
        province: '江苏',
        lat: 32.4000,
        lng: 119.4300,
        year: 745,
        period: '漫游',
        poems: [builtInPoems[0]]
      }
    ]
  },
  {
    id: 'dubu',
    name: '杜甫',
    dynasty: '唐',
    birthYear: 712,
    deathYear: 770,
    avatar: '杜',
    color: '#8B4513',
    travelPoints: [
      {
        id: 'tp-5',
        city: '泰安',
        province: '山东',
        lat: 36.1903,
        lng: 117.1008,
        year: 736,
        period: '漫游',
        poems: [builtInPoems[9]]
      },
      {
        id: 'tp-6',
        city: '长安',
        province: '陕西',
        lat: 34.3416,
        lng: 108.9398,
        year: 757,
        period: '安史之乱',
        poems: [builtInPoems[1]]
      }
    ]
  },
  {
    id: 'sushi',
    name: '苏轼',
    dynasty: '宋',
    birthYear: 1037,
    deathYear: 1101,
    avatar: '苏',
    color: '#4169E1',
    travelPoints: [
      {
        id: 'tp-7',
        city: '杭州',
        province: '浙江',
        lat: 30.2500,
        lng: 120.1500,
        year: 1071,
        period: '通判杭州',
        poems: [builtInPoems[6], builtInPoems[8]]
      },
      {
        id: 'tp-8',
        city: '庐山',
        province: '江西',
        lat: 29.5974,
        lng: 115.9987,
        year: 1084,
        period: '游庐山',
        poems: [builtInPoems[5]]
      }
    ]
  },
  {
    id: 'luyou',
    name: '陆游',
    dynasty: '宋',
    birthYear: 1125,
    deathYear: 1210,
    avatar: '陆',
    color: '#32CD32',
    travelPoints: [
      {
        id: 'tp-9',
        city: '临汾',
        province: '山西',
        lat: 36.0890,
        lng: 111.5139,
        year: 1167,
        period: '罢归',
        poems: [builtInPoems[10]]
      }
    ]
  },
  {
    id: 'wanganshi',
    name: '王安石',
    dynasty: '宋',
    birthYear: 1021,
    deathYear: 1086,
    avatar: '王',
    color: '#9932CC',
    travelPoints: [
      {
        id: 'tp-10',
        city: '扬州',
        province: '江苏',
        lat: 32.3000,
        lng: 119.4000,
        year: 1070,
        period: '罢相',
        poems: [builtInPoems[11]]
      }
    ]
  },
  {
    id: 'baijuyi',
    name: '白居易',
    dynasty: '唐',
    birthYear: 772,
    deathYear: 846,
    avatar: '白',
    color: '#FFD700',
    travelPoints: [
      {
        id: 'tp-11',
        city: '杭州',
        province: '浙江',
        lat: 30.2500,
        lng: 120.1500,
        year: 822,
        period: '任刺史',
        poems: [builtInPoems[8]]
      }
    ]
  },
  {
    id: 'zhangji',
    name: '张继',
    dynasty: '唐',
    birthYear: 715,
    deathYear: 779,
    avatar: '张',
    color: '#FF4500',
    travelPoints: [
      {
        id: 'tp-12',
        city: '苏州',
        province: '江苏',
        lat: 31.3040,
        lng: 120.6283,
        year: 753,
        period: '落第',
        poems: [builtInPoems[7]]
      }
    ]
  },
  {
    id: 'wangzhihuan',
    name: '王之涣',
    dynasty: '唐',
    birthYear: 688,
    deathYear: 742,
    avatar: '王',
    color: '#20B2AA',
    travelPoints: [
      {
        id: 'tp-13',
        city: '永济',
        province: '山西',
        lat: 34.8735,
        lng: 110.4578,
        year: 720,
        period: '游历',
        poems: [builtInPoems[4]]
      }
    ]
  }
];

interface PoetryContextType {
  userPoets: Poet[];
  userPoems: Poem[];
  classPoets: Record<string, Poet[]>;
  classPoems: Record<string, Poem[]>;
  addPoem: (poem: any, userId?: string) => Promise<Poem>;
  addClassPoem: (classId: string, poem: any, userId?: string) => Promise<Poem>;
  getPoems: (filters?: { dynasty?: string, classId?: string }) => Promise<Poem[]>;
  getProvinceCoordinates: (province: string) => { lat: number; lng: number };
  getAllPoets: (classId?: string) => Poet[];
  getAllPoems: (classId?: string) => Poem[];
  addTravelPointToPoet: (poetName: string, province: string, city: string, poem: Poem) => void;
}

const PoetryContext = createContext<PoetryContextType | undefined>(undefined);

export const PoetryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userPoets, setUserPoets] = useState<Poet[]>([]);
  const [userPoems, setUserPoems] = useState<Poem[]>([]);
  const [classPoets, setClassPoets] = useState<Record<string, Poet[]>>({});
  const [classPoems, setClassPoems] = useState<Record<string, Poem[]>>({});
  const [allPoemsData, setAllPoemsData] = useState<Poem[]>([]);
  const [localBuiltInPoets, setLocalBuiltInPoets] = useState<Poet[]>([]);

  const getProvinceCoordinates = (province: string) => {
    return provinceCoords[province] || { lat: 35.0, lng: 110.0 };
  };

  // 从 API 加载数据并匹配本地诗词和诗人
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch(`${API_BASE}/poems`);
        if (response.ok) {
          const apiPoems = await response.json();
          const processedPoems = apiPoems.map((p: any) => ({
            ...p,
            content: p.content ? p.content.split('\n').filter((l: string) => l.trim()) : [],
            province: p.locationModern || '',
            city: p.locationAncient || ''
          }));

          // 创建诗词匹配映射：标题+作者 -> 后端诗词
          const poemMap = new Map<string, any>();
          processedPoems.forEach((p: any) => {
            const key = `${p.title}-${p.author}`;
            poemMap.set(key, p);
          });

          // 更新本地诗词（主要是替换ID为后端UUID）
          const updatedBuiltInPoems = builtInPoems.map(poem => {
            const key = `${poem.title}-${poem.author}`;
            const matchedPoem = poemMap.get(key);
            if (matchedPoem) {
              return { ...poem, id: matchedPoem.id };
            }
            return poem;
          });

          // 更新诗人游历路线中的诗词ID
          const updatedPoets = builtInPoets.map(poet => ({
            ...poet,
            travelPoints: poet.travelPoints.map(tp => ({
              ...tp,
              poems: tp.poems.map(poem => {
                const key = `${poem.title}-${poem.author}`;
                const matchedPoem = poemMap.get(key);
                if (matchedPoem) {
                  return { ...poem, id: matchedPoem.id };
                }
                return poem;
              })
            }))
          }));

          setLocalBuiltInPoets(updatedPoets);
          setAllPoemsData([...updatedBuiltInPoems, ...processedPoems]);
        } else {
          setLocalBuiltInPoets(builtInPoets);
          setAllPoemsData(builtInPoems);
        }
      } catch (error) {
        console.error('Load poems error:', error);
        setLocalBuiltInPoets(builtInPoets);
        setAllPoemsData(builtInPoems);
      }
    };
    loadData();
  }, []);

  const addPoem = useCallback(async (poemData: any, userId?: string): Promise<Poem> => {
    try {
      const response = await fetch(`${API_BASE}/poems`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...poemData,
          createdBy: userId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create poem');
      }

      const poemFromApi = await response.json();
      const newPoem: Poem = {
        ...poemFromApi,
        content: poemData.content ? poemData.content.split('\n').filter((l: string) => l.trim()) : [],
        province: poemData.locationModern || '',
        city: poemData.locationAncient || '',
        isUserAdded: true,
        addedBy: userId
      };
      
      setUserPoems(prev => [...prev, newPoem]);
      
      // 自动更新诗人游历路线
      if (poemData.author && poemData.locationModern) {
        // 直接在本地更新，不依赖 addTravelPointToPoet（避免依赖循环）
        setLocalBuiltInPoets(prevPoets => {
          const updatedPoets = [...prevPoets];
          const poetIndex = updatedPoets.findIndex(p => p.name === poemData.author);
          
          if (poetIndex === -1) {
            // 诗人不存在，创建新诗人
            const newPoet: Poet = {
              id: `poet-${Date.now()}`,
              name: poemData.author,
              dynasty: poemData.dynasty,
              birthYear: 0,
              deathYear: 0,
              avatar: poemData.author.charAt(0),
              color: '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0'),
              travelPoints: []
            };
            
            const coords = provinceCoords[poemData.locationModern] || { lat: 35.0, lng: 110.0 };
            const newTravelPoint = {
              id: `tp-${Date.now()}`,
              city: poemData.locationAncient || poemData.locationModern,
              province: poemData.locationModern,
              lat: coords.lat,
              lng: coords.lng,
              year: new Date().getFullYear(),
              period: '新增',
              poems: [newPoem]
            };
            
            newPoet.travelPoints.push(newTravelPoint);
            updatedPoets.push(newPoet);
          } else {
            // 诗人存在，检查是否已有该省份的游历点
            const poet = updatedPoets[poetIndex];
            const existingPoint = poet.travelPoints.find(tp => 
              tp.province === poemData.locationModern || tp.city === poemData.locationAncient
            );
            
            if (existingPoint) {
              // 已有该省份的游历点，添加诗词
              existingPoint.poems.push(newPoem);
            } else {
              // 没有该省份的游历点，新增到最后
              const coords = provinceCoords[poemData.locationModern] || { lat: 35.0, lng: 110.0 };
              const newTravelPoint = {
                id: `tp-${Date.now()}`,
                city: poemData.locationAncient || poemData.locationModern,
                province: poemData.locationModern,
                lat: coords.lat,
                lng: coords.lng,
                year: new Date().getFullYear(),
                period: '新增',
                poems: [newPoem]
              };
              
              poet.travelPoints.push(newTravelPoint);
            }
          }
          
          return updatedPoets;
        });
        
        setAllPoemsData(prev => [...prev, newPoem]);
      } else {
        setAllPoemsData(prev => [...prev, newPoem]);
      }
      
      return newPoem;
    } catch (error) {
      console.error('Create poem error:', error);
      throw error;
    }
  }, []);

  const addClassPoem = useCallback(async (classId: string, poemData: any, userId?: string): Promise<Poem> => {
    try {
      const response = await fetch(`${API_BASE}/poems`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...poemData,
          classId,
          createdBy: userId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create poem');
      }

      const poemFromApi = await response.json();
      const newPoem: Poem = {
        ...poemFromApi,
        content: poemData.content ? poemData.content.split('\n').filter((l: string) => l.trim()) : [],
        province: poemData.locationModern || '',
        city: poemData.locationAncient || '',
        isUserAdded: true,
        isClassPoem: true,
        classId,
        addedBy: userId
      };
      
      setClassPoems(prev => ({
        ...prev,
        [classId]: [...(prev[classId] || []), newPoem]
      }));
      
      // 自动更新诗人游历路线
      if (poemData.author && poemData.locationModern) {
        setLocalBuiltInPoets(prevPoets => {
          const updatedPoets = [...prevPoets];
          const poetIndex = updatedPoets.findIndex(p => p.name === poemData.author);
          
          if (poetIndex === -1) {
            const newPoet: Poet = {
              id: `poet-${Date.now()}`,
              name: poemData.author,
              dynasty: poemData.dynasty,
              birthYear: 0,
              deathYear: 0,
              avatar: poemData.author.charAt(0),
              color: '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0'),
              travelPoints: []
            };
            
            const coords = provinceCoords[poemData.locationModern] || { lat: 35.0, lng: 110.0 };
            const newTravelPoint = {
              id: `tp-${Date.now()}`,
              city: poemData.locationAncient || poemData.locationModern,
              province: poemData.locationModern,
              lat: coords.lat,
              lng: coords.lng,
              year: new Date().getFullYear(),
              period: '新增',
              poems: [newPoem]
            };
            
            newPoet.travelPoints.push(newTravelPoint);
            updatedPoets.push(newPoet);
          } else {
            const poet = updatedPoets[poetIndex];
            const existingPoint = poet.travelPoints.find(tp => 
              tp.province === poemData.locationModern || tp.city === poemData.locationAncient
            );
            
            if (existingPoint) {
              existingPoint.poems.push(newPoem);
            } else {
              const coords = provinceCoords[poemData.locationModern] || { lat: 35.0, lng: 110.0 };
              const newTravelPoint = {
                id: `tp-${Date.now()}`,
                city: poemData.locationAncient || poemData.locationModern,
                province: poemData.locationModern,
                lat: coords.lat,
                lng: coords.lng,
                year: new Date().getFullYear(),
                period: '新增',
                poems: [newPoem]
              };
              
              poet.travelPoints.push(newTravelPoint);
            }
          }
          
          return updatedPoets;
        });
        
        setAllPoemsData(prev => [...prev, newPoem]);
      } else {
        setAllPoemsData(prev => [...prev, newPoem]);
      }
      
      return newPoem;
    } catch (error) {
      console.error('Create class poem error:', error);
      throw error;
    }
  }, []);

  const getPoems = useCallback(async (filters?: { dynasty?: string, classId?: string }): Promise<Poem[]> => {
    try {
      let url = `${API_BASE}/poems`;
      const params = new URLSearchParams();
      
      if (filters?.dynasty && filters.dynasty !== '全部') {
        params.append('dynasty', filters.dynasty);
      }
      
      if (filters?.classId) {
        params.append('classId', filters.classId);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to get poems');
      }
      
      const apiPoems = await response.json();
      return apiPoems.map((p: any) => ({
        ...p,
        content: p.content ? p.content.split('\n').filter((l: string) => l.trim()) : [],
        province: p.locationModern || '',
        city: p.locationAncient || ''
      }));
    } catch (error) {
      console.error('Get poems error:', error);
      return [];
    }
  }, []);

  const getAllPoets = useCallback((classId?: string) => {
    return localBuiltInPoets;
  }, [localBuiltInPoets]);

  const getAllPoems = useCallback((classId?: string) => {
    if (classId) {
      const classPoemList = classPoems[classId] || [];
      return [...builtInPoems, ...classPoemList];
    }
    return allPoemsData;
  }, [allPoemsData, classPoems]);

  const addTravelPointToPoet = useCallback((poetName: string, province: string, city: string, poem: Poem) => {
    setLocalBuiltInPoets(prevPoets => {
      const updatedPoets = [...prevPoets];
      const poetIndex = updatedPoets.findIndex(p => p.name === poetName);
      
      if (poetIndex === -1) {
        // 诗人不存在，创建新诗人
        const newPoet: Poet = {
          id: `poet-${Date.now()}`,
          name: poetName,
          dynasty: poem.dynasty,
          birthYear: 0,
          deathYear: 0,
          avatar: poetName.charAt(0),
          color: '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0'),
          travelPoints: []
        };
        
        const coords = getProvinceCoordinates(province);
        const newTravelPoint = {
          id: `tp-${Date.now()}`,
          city: city || province,
          province: province,
          lat: coords.lat,
          lng: coords.lng,
          year: new Date().getFullYear(),
          period: '新增',
          poems: [poem]
        };
        
        newPoet.travelPoints.push(newTravelPoint);
        updatedPoets.push(newPoet);
      } else {
        // 诗人存在，检查是否已有该省份的游历点
        const poet = updatedPoets[poetIndex];
        const existingPoint = poet.travelPoints.find(tp => 
          tp.province === province || tp.city === city
        );
        
        if (existingPoint) {
          // 已有该省份的游历点，添加诗词
          existingPoint.poems.push(poem);
        } else {
          // 没有该省份的游历点，新增到最后
          const coords = getProvinceCoordinates(province);
          const newTravelPoint = {
            id: `tp-${Date.now()}`,
            city: city || province,
            province: province,
            lat: coords.lat,
            lng: coords.lng,
            year: new Date().getFullYear(),
            period: '新增',
            poems: [poem]
          };
          
          poet.travelPoints.push(newTravelPoint);
        }
      }
      
      return updatedPoets;
    });
    
    // 同时更新诗词列表
    setAllPoemsData(prev => [...prev, poem]);
  }, []);

  return (
    <PoetryContext.Provider value={{
      userPoets,
      userPoems,
      classPoets,
      classPoems,
      addPoem,
      addClassPoem,
      getPoems,
      getProvinceCoordinates,
      getAllPoets,
      getAllPoems,
      addTravelPointToPoet
    }}>
      {children}
    </PoetryContext.Provider>
  );
};

export const usePoetry = () => {
  const context = useContext(PoetryContext);
  if (context === undefined) {
    throw new Error('usePoetry must be used within a PoetryProvider');
  }
  return context;
};
