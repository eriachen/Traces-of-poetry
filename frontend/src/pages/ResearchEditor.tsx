import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, BookOpen, Quote, Lock, Users, Globe, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { usePoetry } from '../contexts/PoetryContext';
import { useActivity } from '../contexts/ActivityContext';

interface FormData {
  title: string;
  content: string;
  type: string;
  visibility: string;
  citedPoems: string[];
  taskId?: string;
}

export default function ResearchEditor() {
  const { user } = useAuth();
  const { getAllPoems } = usePoetry();
  const { recordActivity } = useActivity();
  const navigate = useNavigate();
  
  const [showPoemSelector, setShowPoemSelector] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editorSelection, setEditorSelection] = useState({ start: 0, end: 0 });
  
  const [formData, setFormData] = useState<FormData>({
    title: '',
    content: '',
    type: 'GENERAL',
    visibility: 'PRIVATE',
    citedPoems: []
  });
  
  const allPoems = getAllPoems();

  const visibilityOptions = [
    { value: 'PRIVATE', label: '仅自己可见', icon: Lock, description: '只有你可以看到这篇文章' },
    { value: 'CLASS', label: '班级可见', icon: Users, description: '你所在班级的成员可以看到' },
    { value: 'PUBLIC', label: '全平台可见', icon: Globe, description: '所有用户都可以看到这篇文章' },
  ];

  const typeOptions = [
    { value: 'GENERAL', label: '随感' },
    { value: 'RESEARCH', label: '研究论文' },
    { value: 'REFLECTION', label: '读后感' },
  ];

  const filteredPoems = allPoems.filter(poem => 
    poem.title?.includes(searchTerm) || 
    poem.author?.includes(searchTerm)
  );

  const addCitedPoem = (poemId: string) => {
    if (!formData.citedPoems.includes(poemId)) {
      setFormData(prev => ({
        ...prev,
        citedPoems: [...prev.citedPoems, poemId]
      }));
    }
    setShowPoemSelector(false);
  };

  const removeCitedPoem = (poemId: string) => {
    setFormData(prev => ({
      ...prev,
      citedPoems: prev.citedPoems.filter(id => id !== poemId)
    }));
  };

  const insertQuote = () => {
    setShowPoemSelector(true);
  };

  const insertQuoteAtCursor = (poem: any) => {
    const textarea = document.getElementById('content') as HTMLTextAreaElement;
    if (textarea) {
      const before = formData.content.substring(0, editorSelection.start);
      const after = formData.content.substring(editorSelection.end);
      const poemContent = Array.isArray(poem.content) ? poem.content.join('\n') : poem.content;
      const quote = '\n\n【' + poem.title + ' - ' + poem.author + '】\n' + poemContent + '\n\n';
      const newContent = before + quote + after;
      
      setFormData(prev => {
        let updatedCitedPoems;
        if (prev.citedPoems.includes(poem.id)) {
          updatedCitedPoems = prev.citedPoems;
        } else {
          updatedCitedPoems = [...prev.citedPoems, poem.id];
        }
        
        return {
          ...prev,
          content: newContent,
          citedPoems: updatedCitedPoems
        };
      });
    }
    setShowPoemSelector(false);
  };

  const handleSelectionChange = () => {
    const textarea = document.getElementById('content') as HTMLTextAreaElement;
    if (textarea) {
      setEditorSelection({
        start: textarea.selectionStart,
        end: textarea.selectionEnd
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      alert('请先登录');
      return;
    }
    
    console.log('Saving essay:', {
      title: formData.title,
      content: formData.content,
      type: formData.type,
      visibility: formData.visibility,
      userId: user.id,
      isDraft: false,
    });
    
    try {
      const response = await fetch('http://localhost:3001/api/essays', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          type: formData.type,
          visibility: formData.visibility,
          userId: user.id,
          isDraft: false,
        }),
      });
      
      const result = await response.json();
      console.log('Save response:', result);
      
      if (response.ok) {
        recordActivity('research');
        alert('文章保存成功！');
        navigate('/research');
      } else {
        let msg = result.error || '请重试';
        alert('保存失败：' + msg);
      }
    } catch (error) {
      console.error('Failed to save essay:', error);
      let errorMsg = '请重试';
      if (error instanceof Error) {
        errorMsg = error.message;
      }
      alert('保存失败：' + errorMsg);
    }
  };

  const getCitedPoemTitle = (poemId: string) => {
    const poem = allPoems.find(p => p.id === poemId);
    return poem?.title || '';
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate('/research')}
        className="flex items-center gap-2 mb-6 text-gray-600 hover:text-gray-800 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span style={{ fontFamily: '\'Noto Serif SC\', serif' }}>返回研究学习</span>
      </button>

      <div className="scroll-card p-8">
        <h1 
          className="text-3xl font-bold mb-8"
          style={{ 
            color: '#2A1E14',
            fontFamily: '\'Noto Serif SC\', serif',
            textAlign: 'center'
          }}
        >
          创作研究文章
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label 
              className="block mb-2 font-semibold"
              style={{ color: '#2A1E14', fontFamily: '\'Noto Serif SC\', serif' }}
            >
              文章标题 <span style={{ color: '#8C5E38' }}>*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-3 rounded-lg border text-xl"
              style={{ 
                borderColor: '#D4C4A8',
                fontFamily: '\'Noto Serif SC\', serif',
                backgroundColor: '#FAF5EA'
              }}
              placeholder="请输入文章标题..."
            />
          </div>

          <div>
            <label 
              className="block mb-3 font-semibold"
              style={{ color: '#2A1E14', fontFamily: '\'Noto Serif SC\', serif' }}
            >
              文章类型
            </label>
            <div className="flex gap-3">
              {typeOptions.map(type => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, type: type.value }))}
                  className="flex-1 px-4 py-3 rounded-lg border transition-all"
                  style={{
                    borderColor: formData.type === type.value ? '#8C5E38' : '#D4C4A8',
                    backgroundColor: formData.type === type.value ? '#F5F0E8' : '#FAF5EA',
                    fontFamily: '\'Noto Serif SC\', serif'
                  }}
                >
                  <span style={{ color: formData.type === type.value ? '#8C5E38' : '#2A1E14' }}>
                    {type.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label 
                className="font-semibold"
                style={{ color: '#2A1E14', fontFamily: '\'Noto Serif SC\', serif' }}
              >
                引用诗词
              </label>
            </div>
            
            {formData.citedPoems.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.citedPoems.map(poemId => (
                  <span
                    key={poemId}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm"
                    style={{ 
                      backgroundColor: '#EDE8DF',
                      color: '#6B5744',
                      fontFamily: '\'Noto Serif SC\', serif'
                    }}
                  >
                    <Quote className="w-4 h-4" />
                    {getCitedPoemTitle(poemId)}
                    <button
                      type="button"
                      onClick={() => removeCitedPoem(poemId)}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            
            <button
              type="button"
              onClick={insertQuote}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border-dashed border-2"
              style={{ 
                borderColor: '#D4C4A8',
                color: '#8C5E38',
                fontFamily: '\'Noto Serif SC\', serif'
              }}
            >
              <Quote className="w-4 h-4" />
              插入诗词引用
            </button>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label 
                className="block font-semibold"
                style={{ color: '#2A1E14', fontFamily: '\'Noto Serif SC\', serif' }}
              >
                正文内容 <span style={{ color: '#8C5E38' }}>*</span>
              </label>
              <div className="text-sm text-gray-500" style={{ fontFamily: '\'Noto Serif SC\', serif' }}>
                选中文字位置可快速插入诗词
              </div>
            </div>
            <textarea
              id="content"
              required
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              onSelect={handleSelectionChange}
              rows={14}
              className="w-full px-4 py-3 rounded-lg border resize-none"
              style={{ 
                borderColor: '#D4C4A8',
                fontFamily: '\'Noto Serif SC\', serif',
                backgroundColor: '#FAF5EA',
                lineHeight: '1.8',
                fontSize: '16px'
              }}
              placeholder="在此撰写你的研究文章..."
            />
          </div>

          <div>
            <label 
              className="block mb-3 font-semibold"
              style={{ color: '#2A1E14', fontFamily: '\'Noto Serif SC\', serif' }}
            >
              可见性设置
            </label>
            <div className="grid gap-3">
              {visibilityOptions.map(option => {
                const Icon = option.icon;
                return (
                  <label
                    key={option.value}
                    className="flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all"
                    style={{
                      borderColor: formData.visibility === option.value ? '#8C5E38' : '#D4C4A8',
                      backgroundColor: formData.visibility === option.value ? '#F5F0E8' : '#FAF5EA'
                    }}
                  >
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                        style={{
                          borderColor: formData.visibility === option.value ? '#8C5E38' : '#B8B0A8',
                          backgroundColor: formData.visibility === option.value ? '#8C5E38' : 'transparent'
                        }}>
                        {formData.visibility === option.value && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="w-4 h-4" style={{ color: formData.visibility === option.value ? '#8C5E38' : '#6B5744' }} />
                        <span 
                          className="font-semibold"
                          style={{ 
                            color: formData.visibility === option.value ? '#8C5E38' : '#2A1E14',
                            fontFamily: '\'Noto Serif SC\', serif'
                          }}
                        >
                          {option.label}
                        </span>
                      </div>
                      <p className="text-sm" style={{ color: '#6B5744', fontFamily: '\'Noto Serif SC\', serif' }}>
                        {option.description}
                      </p>
                    </div>
                    <input
                      type="radio"
                      name="visibility"
                      value={option.value}
                      checked={formData.visibility === option.value}
                      onChange={(e) => setFormData(prev => ({ ...prev, visibility: e.target.value }))}
                      className="sr-only"
                    />
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex justify-center gap-4 pt-6">
            <button
              type="button"
              onClick={() => navigate('/research')}
              className="px-4 py-2 rounded-lg border"
              style={{ 
                borderColor: '#D4C4A8', 
                color: '#6B5744', 
                fontFamily: '\'Noto Serif SC\', serif' 
              }}
            >
              取消
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-8 py-3 rounded-lg text-white text-lg font-semibold transition-transform hover:scale-105"
              style={{ 
                backgroundColor: '#8C5E38', 
                fontFamily: '\'Noto Serif SC\', serif' 
              }}
            >
              <Save className="w-5 h-5" />
              保存文章
            </button>
          </div>
        </form>
      </div>

      {showPoemSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b" style={{ borderColor: '#D4C4A8' }}>
              <div className="flex items-center justify-between">
                <h3 
                  className="text-xl font-bold"
                  style={{ color: '#2A1E14', fontFamily: '\'Noto Serif SC\', serif' }}
                >
                  选择要引用的诗词
                </h3>
                <button
                  onClick={() => setShowPoemSelector(false)}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <X className="w-5 h-5" style={{ color: '#4A2C1F' }} />
                </button>
              </div>
            </div>
            <div className="p-4 border-b" style={{ borderColor: '#D4C4A8' }}>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="搜索诗词标题或作者..."
                className="w-full px-4 py-2 rounded-lg border"
                style={{ 
                  borderColor: '#D4C4A8',
                  fontFamily: '\'Noto Serif SC\', serif',
                  backgroundColor: '#FAF5EA'
                }}
              />
            </div>
            <div className="p-4 max-h-[50vh] overflow-y-auto">
              {filteredPoems.length === 0 ? (
                <p className="text-center py-8 text-gray-500" style={{ fontFamily: '\'Noto Serif SC\', serif' }}>
                  未找到匹配的诗词
                </p>
              ) : (
                <div className="space-y-3">
                  {filteredPoems.map(poem => (
                    <div
                      key={poem.id}
                      onClick={() => insertQuoteAtCursor(poem)}
                      className="p-4 rounded-lg border hover:border-amber-400 hover:bg-amber-50 transition-all cursor-pointer"
                      style={{ borderColor: formData.citedPoems.includes(poem.id) ? '#8C5E38' : '#D4C4A8' }}
                    >
                      <div className="font-semibold" style={{ color: '#2A1E14', fontFamily: '\'Noto Serif SC\', serif' }}>
                        {poem.title}
                      </div>
                      <div className="text-sm mb-2" style={{ color: '#6B5744', fontFamily: '\'Noto Serif SC\', serif' }}>
                        {poem.author} · {poem.dynasty}
                      </div>
                      <div className="text-sm italic" style={{ color: '#4A2C1F', fontFamily: '\'Noto Serif SC\', serif', lineHeight: '1.6' }}>
                        {Array.isArray(poem.content) ? poem.content[0] : poem.content?.split('\n')[0]}...
                      </div>
                      {formData.citedPoems.includes(poem.id) && (
                        <div className="mt-2 text-xs text-amber-700" style={{ fontFamily: '\'Noto Serif SC\', serif' }}>
                          ✓ 已引用
                        </div>
                      )}
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
