import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAnnotation } from '../contexts/AnnotationContext';
import { useActivity } from '../contexts/ActivityContext';
import { Navigate } from 'react-router-dom';
import { 
  BookOpen, 
  FileText, 
  Edit3, 
  Calendar,
  Trophy,
  CheckSquare,
  PlusCircle,
  TrendingUp,
  X,
  Book
} from 'lucide-react';
import ActivityHeatmap from '../components/ActivityHeatmap';

export default function Profile() {
  const { user } = useAuth();
  const { annotations, loading, loadUserAnnotations } = useAnnotation();
  const { activities } = useActivity();
  const [showAnnotations, setShowAnnotations] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadUserAnnotations(user.id);
    }
  }, [user?.id, loadUserAnnotations]);

  if (!user) {
    return <Navigate to="/login" />;
  }

  const totalPractices = activities.filter(a => a.type === 'practice').reduce((sum, a) => sum + a.count, 0);
  const totalEntries = activities.filter(a => a.type === 'entry').reduce((sum, a) => sum + a.count, 0);
  const totalResearch = activities.filter(a => a.type === 'research').reduce((sum, a) => sum + a.count, 0);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
      <div className="scroll-card p-8 mb-8 paper-texture">
        <div className="flex flex-col md:flex-row items-start gap-8">
          <div className="w-24 h-24 bg-gradient-to-br from-brown to-gold rounded-2xl flex items-center justify-center text-white text-4xl font-bold shadow-ink shrink-0">
            {user.name?.charAt(0) || '?'}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h1 className="text-2xl md:text-3xl font-bold text-ink font-serif">
                {user.name}
              </h1>
              <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                user.role === 'teacher' 
                  ? 'bg-wave/15 text-wave border border-wave/20' 
                  : 'bg-moss/15 text-moss border border-moss/20'
              }`}>
                {user.role === 'teacher' ? '教师' : '学生'}
              </span>
            </div>
            <p className="text-ink/70 mb-4">{user.email}</p>
            {(user.school || user.grade || user.subject) && (
              <div className="flex flex-wrap gap-4 text-sm text-ink/60">
                {user.school && (
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-4.5 h-4.5" />
                    {user.school}
                  </span>
                )}
                {user.grade && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4.5 h-4.5" />
                    {user.grade}
                  </span>
                )}
                {user.subject && (
                  <span className="flex items-center gap-1.5">
                    <Edit3 className="w-4.5 h-4.5" />
                    {user.subject}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="scroll-card p-6 text-center group hover:-translate-y-1 transition-all">
          <div className="w-14 h-14 bg-gradient-to-br from-gold to-brown rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <CheckSquare className="w-7 h-7 text-white" />
          </div>
          <div className="text-3xl font-bold text-ink mb-1 font-serif">
            {totalPractices}
          </div>
          <div className="text-ink/60 text-sm">
            做题次数
          </div>
        </div>

        <div 
          className="scroll-card p-6 text-center group hover:-translate-y-1 transition-all cursor-pointer"
          onClick={() => setShowAnnotations(true)}
        >
          <div className="w-14 h-14 bg-gradient-to-br from-moss to-wave rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <FileText className="w-7 h-7 text-white" />
          </div>
          <div className="text-3xl font-bold text-ink mb-1 font-serif">
            {annotations.length}
          </div>
          <div className="text-ink/60 text-sm">
            批注数量
          </div>
          {annotations.length > 0 && (
            <div className="text-xs text-moss mt-2 font-serif">
              点击查看所有批注
            </div>
          )}
        </div>

        <div className="scroll-card p-6 text-center group hover:-translate-y-1 transition-all">
          <div className="w-14 h-14 bg-gradient-to-br from-wave to-violet rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <PlusCircle className="w-7 h-7 text-white" />
          </div>
          <div className="text-3xl font-bold text-ink mb-1 font-serif">
            {totalEntries}
          </div>
          <div className="text-ink/60 text-sm">
            录入数据
          </div>
        </div>

        <div className="scroll-card p-6 text-center group hover:-translate-y-1 transition-all">
          <div className="w-14 h-14 bg-gradient-to-br from-violet to-cinnabar rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <TrendingUp className="w-7 h-7 text-white" />
          </div>
          <div className="text-3xl font-bold text-ink mb-1 font-serif">
            {totalResearch}
          </div>
          <div className="text-ink/60 text-sm">
            研究学习
          </div>
        </div>
      </div>

      <ActivityHeatmap />

      {showAnnotations && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-paper rounded-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-xuan flex items-center justify-between">
              <h3 className="text-xl font-bold text-ink font-serif flex items-center gap-2">
                <FileText className="w-5 h-5" />
                我的批注
              </h3>
              <button
                onClick={() => setShowAnnotations(false)}
                className="p-2 rounded-full hover:bg-rice"
              >
                <X className="w-5 h-5 text-ink/70" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {loading ? (
                <div className="text-center py-8">
                  <p className="text-ink/50 font-serif">加载中...</p>
                </div>
              ) : annotations.length === 0 ? (
                <div className="text-center py-8">
                  <Book className="w-12 h-12 mx-auto mb-4 text-ink/30" />
                  <p className="text-ink/50 font-serif">暂无批注</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {annotations.map(anno => (
                    <div key={anno.id} className="scroll-card p-5">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Book className="w-4 h-4 text-brown" />
                          <span className="font-semibold text-ink font-serif">
                            {anno.poem?.title || '未知诗词'}
                          </span>
                          {anno.poem?.author && (
                            <span className="text-ink/60 text-sm font-serif">
                              · {anno.poem.author}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-ink/50 font-serif">
                          {anno.isPublic ? '公开' : '私密'}
                        </span>
                      </div>
                      <p className="text-deepInk font-serif mb-2">
                        {anno.content}
                      </p>
                      <p className="text-xs text-ink/50 font-serif">
                        {new Date(anno.createdAt).toLocaleString('zh-CN')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
