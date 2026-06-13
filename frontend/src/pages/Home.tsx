import { Link } from 'react-router-dom';
import { 
  Map as MapIcon, 
  BookOpen, 
  Users, 
  TrendingUp,
  ArrowRight
} from 'lucide-react';

export default function Home() {

  const features = [
    {
      icon: MapIcon,
      title: '文学地图',
      description: '将古诗词与地理位置结合，循着诗人的足迹，穿越千年时光',
      gradient: 'from-gold/20 to-brown/20',
      iconColor: 'text-brown'
    },
    {
      icon: BookOpen,
      title: '深度阅读',
      description: '逐字逐句，品味诗词之美，留下你的批注与感悟',
      gradient: 'from-moss/20 to-wave/20',
      iconColor: 'text-moss'
    },
    {
      icon: Users,
      title: '班级互动',
      description: '与同窗共读，与老师交流，让学习不再孤单',
      gradient: 'from-violet/20 to-cinnabar/20',
      iconColor: 'text-violet'
    },
    {
      icon: TrendingUp,
      title: '学习成长',
      description: '记录每一点进步，见证你的诗词之旅',
      gradient: 'from-cinnabar/20 to-gold/20',
      iconColor: 'text-cinnabar'
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gold/10 via-transparent to-brown/10" />
        
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-brown/5 rounded-full blur-3xl" />
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-ink mb-6 font-serif tracking-wide">
              诗迹
            </h1>
            <p className="text-xl md:text-2xl text-brown font-medium mb-2 font-serif">
              让文学从真空中落地
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/map" className="btn-poetry text-lg px-8 py-4 flex items-center justify-center gap-2 group">
              探索文学地图
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/register" className="btn-outline text-lg px-8 py-4">
              开始学习
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-ink mb-4 font-serif">与诗词相逢</h2>
            <div className="divider-poetry w-32 mx-auto" />
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index} 
                  className="scroll-card p-8 group hover:-translate-y-2 transition-all duration-500"
                >
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-7 h-7 ${feature.iconColor}`} />
                  </div>
                  <h3 className="text-xl font-bold text-ink mb-3 font-serif">{feature.title}</h3>
                  <p className="text-ink/60 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>


    </div>
  );
}
