import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  BookOpen, 
  MapPin, 
  Calendar, 
  User, 
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Quote
} from 'lucide-react';

interface Poem {
  id: string;
  title: string;
  author: string;
  dynasty: string;
  content: string;
  authorBio?: string;
  createdYear?: string;
  background?: string;
  locationAncient?: string;
  locationModern?: string;
  annotations: Array<{ text: string; note: string }>;
  tags: string[];
  imageryTags: string[];
  emotionTags: string[];
}

export default function PoemDetail() {
  const { id } = useParams<{ id: string }>();
  const [poem, setPoem] = useState<Poem | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [authorPoems, setAuthorPoems] = useState<any[]>([]);

  useEffect(() => {
    if (id) {
      loadPoem(id);
    }
  }, [id]);

  const loadPoem = async (poemId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/poems/${poemId}`);
      const data = await response.json();
      setPoem(data);
      
      if (data.author) {
        const authorResponse = await fetch(`/api/poems/author/${encodeURIComponent(data.author)}`);
        const authorPoemsData = await authorResponse.json();
        setAuthorPoems(authorPoemsData.filter((p: any) => p.id !== poemId));
      }
    } catch (error) {
      console.error('Failed to load poem:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-rice rounded w-1/3 mb-4"></div>
          <div className="h-6 bg-rice rounded w-1/4 mb-8"></div>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-6 bg-rice rounded w-3/4"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!poem) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <p className="text-ink/60">诗词未找到</p>
        <Link to="/map" className="btn-poetry mt-4 inline-block">
          返回地图
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <Link
          to="/map"
          className="flex items-center gap-2 text-ink/60 hover:text-brown mb-8 transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          返回文学地图
        </Link>

        <article className="scroll-card p-8 md:p-12 mb-8 paper-texture">
          <header className="text-center mb-10">
            <h1 className="text-3xl md:text-5xl font-bold text-ink mb-4 font-serif tracking-wider">
              {poem.title}
            </h1>
            <div className="flex items-center justify-center gap-4 text-ink/70 text-sm flex-wrap">
              <span className="flex items-center gap-1.5">
                <User className="w-4.5 h-4.5" />
                {poem.author}
              </span>
              <span className="text-xuan/60">·</span>
              <span className="bg-brown/10 text-brown px-3 py-1 rounded-full text-xs">
                {poem.dynasty}
              </span>
              {poem.createdYear && (
                <>
                  <span className="text-xuan/60">·</span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4.5 h-4.5" />
                    {poem.createdYear}年
                  </span>
                </>
              )}
              {poem.locationModern && (
                <>
                  <span className="text-xuan/60">·</span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4.5 h-4.5" />
                    {poem.locationAncient}（今{poem.locationModern}）
                  </span>
                </>
              )}
            </div>
          </header>

          {/* Poetry Content */}
          <div className="relative mb-12">
            <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-gold via-brown to-gold rounded-full opacity-30" />
            <div className="poetry-text text-center py-8 space-y-3">
              {poem.content.split('\n').map((line, index) => (
                <p key={index} className="tracking-poetry-wide">
                  {line}
                </p>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-3 justify-center mb-10">
            {poem.imageryTags?.map((tag, index) => (
              <span
                key={index}
                className="px-4 py-1.5 bg-gold/10 text-gold rounded-full text-sm border border-gold/20"
              >
                {tag}
              </span>
            ))}
            {poem.emotionTags?.map((tag, index) => (
              <span
                key={index}
                className="px-4 py-1.5 bg-wave/10 text-wave rounded-full text-sm border border-wave/20"
              >
                {tag}
              </span>
            ))}
            {poem.tags?.map((tag, index) => (
              <span
                key={index}
                className="px-4 py-1.5 bg-moss/10 text-moss rounded-full text-sm border border-moss/20"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Background */}
          {poem.background && (
            <div className="mb-10 bg-rice/50 rounded-xl p-6 border border-xuan/20">
              <h3 className="flex items-center gap-2 text-lg font-bold text-ink mb-4 font-serif">
                <Quote className="w-5 h-5 text-gold" />
                创作背景
              </h3>
              <p className="text-ink/80 leading-relaxed pl-1">
                {poem.background}
              </p>
            </div>
          )}

          {/* Annotations */}
          {poem.annotations && poem.annotations.length > 0 && (
            <div className="mb-10">
              <button
                onClick={() => setShowAnnotations(!showAnnotations)}
                className="flex items-center gap-2 text-lg font-bold text-ink mb-4 font-serif"
              >
                <MessageSquare className="w-5 h-5 text-brown" />
                注释
                {showAnnotations ? (
                  <ChevronUp className="w-5 h-5 ml-2" />
                ) : (
                  <ChevronDown className="w-5 h-5 ml-2" />
                )}
              </button>
              {showAnnotations && (
                <div className="pl-1 space-y-3">
                  {poem.annotations.map((annotation, index) => (
                    <div key={index} className="border-l-2 border-gold/40 pl-4 py-2">
                      <span className="font-bold text-brown mr-3">{annotation.text}</span>
                      <span className="text-ink/70">—— {annotation.note}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Author Bio */}
          {poem.authorBio && (
            <div className="bg-gradient-to-r from-gold/5 to-transparent rounded-xl p-6 border border-gold/10">
              <h3 className="flex items-center gap-2 text-lg font-bold text-ink mb-4 font-serif">
                <User className="w-5 h-5 text-gold" />
                诗人简介
              </h3>
              <p className="text-ink/80 leading-relaxed pl-1">
                {poem.authorBio}
              </p>
            </div>
          )}
        </article>

        {/* Author's Other Poems */}
        {authorPoems.length > 0 && (
          <div className="scroll-card p-8">
            <h3 className="text-xl font-bold text-ink mb-6 font-serif flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-brown" />
              {poem.author}的其他作品
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {authorPoems.map((otherPoem) => (
                <Link
                  key={otherPoem.id}
                  to={`/poem/${otherPoem.id}`}
                  className="p-5 border border-xuan/30 rounded-xl hover:border-brown/30 hover:bg-brown/5 transition-all group"
                >
                  <h4 className="font-bold text-ink text-lg mb-1 font-serif group-hover:text-brown transition-colors">
                    {otherPoem.title}
                  </h4>
                  <p className="text-ink/50 text-xs">{otherPoem.dynasty}</p>
                  {otherPoem.locationModern && (
                    <p className="text-ink/40 text-xs mt-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {otherPoem.locationModern}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
