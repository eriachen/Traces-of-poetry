import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, BookOpen, Calendar, Eye, Lock, Users, Globe, Quote } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { usePoetry } from '../contexts/PoetryContext';

interface Essay {
  id: string;
  title: string;
  content: string;
  type: string;
  visibility: string;
  createdAt: Date;
  userId: string;
}

export default function ResearchList() {
  const { user } = useAuth();
  const { getAllPoems } = usePoetry();
  const navigate = useNavigate();
  const [essays, setEssays] = useState<Essay[]>([]);
  const [loading, setLoading] = useState(true);
  
  const allPoems = getAllPoems();

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'GENERAL': '随感',
      'RESEARCH': '研究论文',
      'REFLECTION': '读后感',
    };
    return labels[type] || type;
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'PRIVATE':
        return <Lock className="w-4 h-4" />;
      case 'CLASS':
        return <Users className="w-4 h-4" />;
      case 'PUBLIC':
        return <Globe className="w-4 h-4" />;
      default:
        return <Lock className="w-4 h-4" />;
    }
  };

  const getVisibilityLabel = (visibility: string) => {
    const labels: Record<string, string> = {
      'PRIVATE': '仅自己可见',
      'CLASS': '班级可见',
      'PUBLIC': '全平台可见',
    };
    return labels[visibility] || visibility;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  useEffect(() => {
    const loadEssays = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      
      try {
        const response = await fetch(`http://localhost:3001/api/essays/user/${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setEssays(data);
        }
      } catch (error) {
        console.error('Failed to load essays:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadEssays();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p style={{ fontFamily: '\'Noto Serif SC\', serif' }}>加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => navigate('/study')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span style={{ fontFamily: '\'Noto Serif SC\', serif' }}>返回学习</span>
        </button>
        
        <button
          onClick={() => navigate('/research/new')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-white"
          style={{ backgroundColor: '#8C5E38', fontFamily: '\'Noto Serif SC\', serif' }}
        >
          <Plus className="w-5 h-5" />
          开始创作
        </button>
      </div>

      <div className="mb-8">
        <h1 
          className="text-3xl font-bold mb-2"
          style={{ color: '#2A1E14', fontFamily: '\'Noto Serif SC\', serif' }}
        >
          研究学习
        </h1>
        <p 
          className="text-gray-600"
          style={{ fontFamily: '\'Noto Serif SC\', serif' }}
        >
          记录你的学习心得、研究发现和感悟
        </p>
      </div>

      {essays.length === 0 ? (
        <div className="scroll-card p-12 text-center">
          <BookOpen className="w-16 h-16 mx-auto mb-6" style={{ color: '#D4C4A8' }} />
          <h3 
            className="text-xl font-bold mb-2"
            style={{ color: '#2A1E14', fontFamily: '\'Noto Serif SC\', serif' }}
          >
            还没有文章
          </h3>
          <p 
            className="text-gray-600 mb-8"
            style={{ fontFamily: '\'Noto Serif SC\', serif' }}
          >
            开始创作你的第一篇研究学习文章吧！
          </p>
          <button
            onClick={() => navigate('/research/new')}
            className="flex items-center gap-2 px-6 py-3 rounded-lg text-white mx-auto"
            style={{ backgroundColor: '#8C5E38', fontFamily: '\'Noto Serif SC\', serif' }}
          >
            <Plus className="w-5 h-5" />
            开始创作
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {essays.map((essay) => (
            <div 
              key={essay.id}
              className="scroll-card p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 
                    className="text-xl font-bold mb-2"
                    style={{ color: '#2A1E14', fontFamily: '\'Noto Serif SC\', serif' }}
                  >
                    {essay.title}
                  </h3>
                  <div className="flex items-center gap-4 text-sm mb-3" style={{ color: '#6B5744' }}>
                    <span className="flex items-center gap-1" style={{ fontFamily: '\'Noto Serif SC\', serif' }}>
                      <Calendar className="w-4 h-4" />
                      {formatDate(essay.createdAt)}
                    </span>
                    <span 
                      className="px-3 py-1 rounded-full text-xs"
                      style={{ 
                        backgroundColor: '#EDE8DF', 
                        color: '#6B5744', 
                        fontFamily: '\'Noto Serif SC\', serif' 
                      }}
                    >
                      {getTypeLabel(essay.type)}
                    </span>
                    <span className="flex items-center gap-1" style={{ fontFamily: '\'Noto Serif SC\', serif' }}>
                      {getVisibilityIcon(essay.visibility)}
                      {getVisibilityLabel(essay.visibility)}
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={() => navigate(`/research/${essay.id}`)}
                  className="flex items-center gap-1 px-4 py-2 rounded-lg border"
                  style={{ 
                    borderColor: '#D4C4A8', 
                    color: '#6B5744', 
                    fontFamily: '\'Noto Serif SC\', serif' 
                  }}
                >
                  <Eye className="w-4 h-4" />
                  查看
                </button>
              </div>
              
              <p 
                className="mb-4 line-clamp-3"
                style={{ color: '#4A2C1F', fontFamily: '\'Noto Serif SC\', serif', lineHeight: '1.8' }}
              >
                {essay.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
