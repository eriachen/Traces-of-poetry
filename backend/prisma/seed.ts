import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const provinces = {
  '北京': { lat: 39.9042, lng: 116.4074 },
  '陕西': { lat: 34.3416, lng: 108.9398 },
  '河南': { lat: 34.7466, lng: 113.6254 },
  '四川': { lat: 30.5728, lng: 104.0668 },
  '江苏': { lat: 32.0603, lng: 118.7969 },
  '浙江': { lat: 30.2741, lng: 120.1551 },
  '湖南': { lat: 28.2000, lng: 112.9388 },
  '湖北': { lat: 30.5928, lng: 114.3055 },
  '江西': { lat: 28.6765, lng: 115.8922 },
  '安徽': { lat: 31.8206, lng: 117.2272 },
  '山东': { lat: 36.6762, lng: 117.0009 },
  '山西': { lat: 37.8706, lng: 112.5489 },
  '河北': { lat: 38.0423, lng: 114.5148 },
  '广东': { lat: 23.1291, lng: 113.2644 },
  '广西': { lat: 22.8154, lng: 108.3275 },
  '云南': { lat: 24.8801, lng: 102.8329 },
  '贵州': { lat: 26.5783, lng: 106.7135 },
  '福建': { lat: 26.0745, lng: 119.2965 },
  '甘肃': { lat: 36.0611, lng: 103.8343 },
  '内蒙古': { lat: 40.8414, lng: 111.7519 },
  '辽宁': { lat: 41.8057, lng: 123.4315 },
  '吉林': { lat: 43.8868, lng: 125.3245 },
  '黑龙江': { lat: 45.8038, lng: 126.5350 },
  '新疆': { lat: 43.7928, lng: 87.6177 },
  '青海': { lat: 36.6171, lng: 101.7782 },
  '宁夏': { lat: 38.4681, lng: 106.2731 },
  '西藏': { lat: 29.6520, lng: 91.1721 },
  '海南': { lat: 20.0442, lng: 110.1989 },
  '台湾': { lat: 25.0330, lng: 121.5654 },
  '重庆': { lat: 29.4316, lng: 106.9123 },
  '天津': { lat: 39.3434, lng: 117.3616 },
  '上海': { lat: 31.2304, lng: 121.4737 },
  '香港': { lat: 22.3193, lng: 114.1694 },
  '澳门': { lat: 22.1987, lng: 113.5439 },
};

const poems = [
  {
    title: '静夜思',
    author: '李白',
    dynasty: '唐',
    content: '床前明月光，疑是地上霜。\n举头望明月，低头思故乡。',
    authorBio: '李白（701年－762年），字太白，号青莲居士，唐朝伟大的浪漫主义诗人，被后人誉为"诗仙"。',
    createdYear: '725',
    background: '这首诗写于唐玄宗开元十四年（726年），李白当时在扬州旅舍，一个月明星稀的夜晚，他抬头望见天空一轮皓月，思乡之情油然而生，写下了这首传诵千古的名诗。',
    locationAncient: '扬州',
    locationModern: '江苏',
    builtinAnnotations: [
      { text: '床前', note: '井栏。古代井栏有数米高，成方框形围住井口，防止人跌入井内。' },
      { text: '疑', note: '怀疑。' },
      { text: '举头', note: '抬头。' },
    ],
    tags: ['必修一', '思乡', '月亮'],
    imageryTags: ['月亮', '霜'],
    emotionTags: ['思乡怀人'],
  },
  {
    title: '望庐山瀑布',
    author: '李白',
    dynasty: '唐',
    content: '日照香炉生紫烟，遥看瀑布挂前川。\n飞流直下三千尺，疑是银河落九天。',
    authorBio: '李白（701年－762年），字太白，号青莲居士，唐朝伟大的浪漫主义诗人，被后人誉为"诗仙"。',
    createdYear: '725',
    background: '这首诗一般认为是唐玄宗开元十三年（725年）前后李白出游金陵途中初游庐山时所作。',
    locationAncient: '庐山',
    locationModern: '江西',
    builtinAnnotations: [
      { text: '香炉', note: '指香炉峰，庐山西北部的一座高峰。' },
      { text: '紫烟', note: '日光透过云雾，远望如紫色的烟云。' },
      { text: '九天', note: '天的最高处，形容极高。' },
    ],
    tags: ['必修二', '山水'],
    imageryTags: ['瀑布', '山', '太阳', '银河'],
    emotionTags: ['隐逸恬淡'],
  },
  {
    title: '春望',
    author: '杜甫',
    dynasty: '唐',
    content: '国破山河在，城春草木深。\n感时花溅泪，恨别鸟惊心。\n烽火连三月，家书抵万金。\n白头搔更短，浑欲不胜簪。',
    authorBio: '杜甫（712年－770年），字子美，自号少陵野老，唐代伟大的现实主义诗人，与李白合称"李杜"。',
    createdYear: '757',
    background: '这首诗写于唐肃宗至德二年（757年）春。当时长安被安史叛军焚掠一空，满目凄凉。杜甫眼见山河依旧而国破家亡，春回大地却满城荒凉，在此身历逆境、思家情切之际，不禁触景伤情，发出深重的忧伤和感慨。',
    locationAncient: '长安',
    locationModern: '陕西',
    builtinAnnotations: [
      { text: '国破', note: '国都沦陷。' },
      { text: '感时', note: '感伤时局。' },
      { text: '烽火', note: '古时边防报警的烟火，这里指安史之乱的战火。' },
      { text: '不胜簪', note: '连簪子都插不住了。' },
    ],
    tags: ['必修三', '爱国', '战乱'],
    imageryTags: ['山河', '花', '鸟', '烽火'],
    emotionTags: ['忧国忧民', '物哀伤感'],
  },
  {
    title: '茅屋为秋风所破歌',
    author: '杜甫',
    dynasty: '唐',
    content: '八月秋高风怒号，卷我屋上三重茅。\n茅飞渡江洒江郊，高者挂罥长林梢，下者飘转沉塘坳。\n南村群童欺我老无力，忍能对面为盗贼。\n公然抱茅入竹去，唇焦口燥呼不得，归来倚杖自叹息。\n俄顷风定云墨色，秋天漠漠向昏黑。\n布衾多年冷似铁，娇儿恶卧踏里裂。\n床头屋漏无干处，雨脚如麻未断绝。\n自经丧乱少睡眠，长夜沾湿何由彻！\n安得广厦千万间，大庇天下寒士俱欢颜！\n风雨不动安如山。\n呜呼！何时眼前突兀见此屋，吾庐独破受冻死亦足！',
    authorBio: '杜甫（712年－770年），字子美，自号少陵野老，唐代伟大的现实主义诗人。',
    createdYear: '761',
    background: '唐肃宗上元二年（761年）的秋天，大风破屋，大雨又接踵而至，诗人长夜难眠，感慨万千，写下了这篇脍炙人口的诗篇。',
    locationAncient: '成都',
    locationModern: '四川',
    builtinAnnotations: [
      { text: '三重茅', note: '几层茅草。' },
      { text: '挂罥', note: '悬挂，缠绕。' },
      { text: '俄顷', note: '一会儿。' },
      { text: '广厦', note: '宽敞的房屋。' },
    ],
    tags: ['必修三', '忧国忧民'],
    imageryTags: ['秋风', '茅屋', '雨'],
    emotionTags: ['忧国忧民'],
  },
  {
    title: '水调歌头·明月几时有',
    author: '苏轼',
    dynasty: '宋',
    content: '明月几时有？把酒问青天。\n不知天上宫阙，今夕是何年。\n我欲乘风归去，又恐琼楼玉宇，高处不胜寒。\n起舞弄清影，何似在人间。\n转朱阁，低绮户，照无眠。\n不应有恨，何事长向别时圆？\n人有悲欢离合，月有阴晴圆缺，此事古难全。\n但愿人长久，千里共婵娟。',
    authorBio: '苏轼（1037年－1101年），字子瞻，又字和仲，号东坡居士，北宋著名文学家、书法家、画家。',
    createdYear: '1076',
    background: '这首词是苏轼于宋神宗熙宁九年（1076年）中秋在密州时所作。当时苏轼因反对王安石变法，被贬谪到密州已有七年，与弟弟苏辙也分别七年之久。',
    locationAncient: '密州',
    locationModern: '山东',
    builtinAnnotations: [
      { text: '宫阙', note: '宫殿。' },
      { text: '琼楼玉宇', note: '美玉砌成的楼宇，指想象中的月中仙宫。' },
      { text: '婵娟', note: '指月亮。' },
    ],
    tags: ['必修四', '中秋', '思念'],
    imageryTags: ['月亮', '酒', '青天'],
    emotionTags: ['思乡怀人', '物哀伤感'],
  },
  {
    title: '念奴娇·赤壁怀古',
    author: '苏轼',
    dynasty: '宋',
    content: '大江东去，浪淘尽，千古风流人物。\n故垒西边，人道是，三国周郎赤壁。\n乱石穿空，惊涛拍岸，卷起千堆雪。\n江山如画，一时多少豪杰。\n遥想公瑾当年，小乔初嫁了，雄姿英发。\n羽扇纶巾，谈笑间，樯橹灰飞烟灭。\n故国神游，多情应笑我，早生华发。\n人生如梦，一尊还酹江月。',
    authorBio: '苏轼（1037年－1101年），字子瞻，又字和仲，号东坡居士，北宋著名文学家、书法家、画家。',
    createdYear: '1082',
    background: '这首词是苏轼被贬谪黄州时所作，借古抒怀，表达了他对历史英雄人物的景仰和对自己壮志未酬的感慨。',
    locationAncient: '黄州',
    locationModern: '湖北',
    builtinAnnotations: [
      { text: '故垒', note: '古时军队营垒的遗迹。' },
      { text: '纶巾', note: '古代配有青丝带的头巾。' },
      { text: '樯橹', note: '这里代指曹操的水军战船。' },
    ],
    tags: ['必修四', '怀古'],
    imageryTags: ['江', '石', '月'],
    emotionTags: ['史事怀古'],
  },
  {
    title: '登鹳雀楼',
    author: '王之涣',
    dynasty: '唐',
    content: '白日依山尽，黄河入海流。\n欲穷千里目，更上一层楼。',
    authorBio: '王之涣（688年－742年），字季凌，唐代诗人。',
    createdYear: '723',
    background: '这首诗写诗人在登高望远中表现出来的不凡的胸襟抱负，反映了盛唐时期人们积极向上的进取精神。',
    locationAncient: '蒲州',
    locationModern: '山西',
    builtinAnnotations: [
      { text: '白日', note: '太阳。' },
      { text: '尽', note: '消失。' },
      { text: '穷', note: '尽，使达到极点。' },
    ],
    tags: ['必修一', '哲理'],
    imageryTags: ['太阳', '山', '黄河', '楼'],
    emotionTags: ['壮志豪情'],
  },
  {
    title: '黄鹤楼',
    author: '崔颢',
    dynasty: '唐',
    content: '昔人已乘黄鹤去，此地空余黄鹤楼。\n黄鹤一去不复返，白云千载空悠悠。\n晴川历历汉阳树，芳草萋萋鹦鹉洲。\n日暮乡关何处是？烟波江上使人愁。',
    authorBio: '崔颢（704年－754年），唐代诗人。',
    createdYear: '728',
    background: '这首诗是吊古怀乡之佳作。诗人登临古迹黄鹤楼，泛览眼前景物，即景而生情，诗兴大作，脱口而出，一泻千里。',
    locationAncient: '黄鹤楼',
    locationModern: '湖北',
    builtinAnnotations: [
      { text: '昔人', note: '指传说中的仙人子安。' },
      { text: '悠悠', note: '飘荡的样子。' },
      { text: '乡关', note: '故乡家园。' },
    ],
    tags: ['必修二', '思乡', '怀古'],
    imageryTags: ['黄鹤', '白云', '江', '芳草'],
    emotionTags: ['思乡怀人', '史事怀古'],
  },
];

async function main() {
  console.log('Start seeding...');
  
  // 创建测试用户
  console.log('Creating test users...');
  const hashedPassword = await bcrypt.hash('123456', 10);
  
  const existingStudent = await prisma.user.findUnique({
    where: { email: 'student@shiji.com' },
  });
  
  if (!existingStudent) {
    await prisma.user.create({
      data: {
        email: 'student@shiji.com',
        password: hashedPassword,
        name: '李同学',
        role: 'STUDENT',
        school: '诗迹中学',
        grade: '高一',
      }
    });
    console.log(`Created student user: student@shiji.com (password: 123456)`);
  } else {
    console.log(`Student user already exists: student@shiji.com`);
  }
  
  const existingTeacher = await prisma.user.findUnique({
    where: { email: 'teacher@shiji.com' },
  });
  
  if (!existingTeacher) {
    await prisma.user.create({
      data: {
        email: 'teacher@shiji.com',
        password: hashedPassword,
        name: '王老师',
        role: 'TEACHER',
        school: '诗迹中学',
        subject: '语文',
      }
    });
    console.log(`Created teacher user: teacher@shiji.com (password: 123456)`);
  } else {
    console.log(`Teacher user already exists: teacher@shiji.com`);
  }
  
  for (const poem of poems) {
    const existingPoem = await prisma.poem.findFirst({
      where: { title: poem.title, author: poem.author },
    });
    
    if (!existingPoem) {
      const province = provinces[poem.locationModern as keyof typeof provinces];
      
      await prisma.poem.create({
        data: {
          title: poem.title,
          author: poem.author,
          dynasty: poem.dynasty,
          content: poem.content,
          authorBio: poem.authorBio,
          createdYear: poem.createdYear,
          background: poem.background,
          locationAncient: poem.locationAncient,
          locationModern: poem.locationModern,
          builtinAnnotations: JSON.stringify(poem.builtinAnnotations),
          tags: JSON.stringify(poem.tags),
          imageryTags: JSON.stringify(poem.imageryTags),
          emotionTags: JSON.stringify(poem.emotionTags),
          locationLat: province?.lat,
          locationLng: province?.lng,
          source: 'INTERNAL',
        },
      });
      
      console.log(`Created poem: ${poem.title}`);
    } else {
      console.log(`Poem already exists: ${poem.title}`);
    }
  }
  
  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
