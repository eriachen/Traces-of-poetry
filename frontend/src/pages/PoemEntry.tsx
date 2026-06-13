import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Plus, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { usePoetry } from '../contexts/PoetryContext';
import { useActivity } from '../contexts/ActivityContext';

interface FormData {
  title: string;
  author: string;
  dynasty: string;
  content: string;
  locationAncient: string;
  locationModern: string;
  tags: string[];
  background: string;
  authorBio: string;
}

export default function PoemEntry() {
  const { user } = useAuth();
  const { addPoem, addClassPoem } = usePoetry();
  const { recordActivity } = useActivity();
  const navigate = useNavigate();
  const { classId } = useParams<{ classId?: string }>();
  const [tagInput, setTagInput] = useState('');

  const dynasties = ['先秦', '两汉', '魏晋', '南北朝', '五代', '唐', '宋', '辽金', '元', '明', '清'];
  const provinces = [
    '北京', '天津', '河北', '山西', '内蒙古',
    '辽宁', '吉林', '黑龙江', '上海', '江苏',
    '浙江', '安徽', '福建', '江西', '山东',
    '河南', '湖北', '湖南', '广东', '广西',
    '海南', '重庆', '四川', '贵州', '云南',
    '西藏', '陕西', '甘肃', '青海', '宁夏',
    '新疆', '香港', '澳门', '台湾'
  ];

  const [formData, setFormData] = useState<FormData>({
    title: '',
    author: '',
    dynasty: '',
    content: '',
    locationAncient: '',
    locationModern: '',
    tags: [],
    background: '',
    authorBio: ''
  });

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const poemData = {
      title: formData.title,
      author: formData.author,
      dynasty: formData.dynasty,
      content: formData.content,
      locationAncient: formData.locationAncient,
      locationModern: formData.locationModern,
      tags: formData.tags,
      authorBio: formData.authorBio,
      background: formData.background
    };

    try {
      if (classId) {
        await addClassPoem(classId, poemData, user?.id);
      } else {
        await addPoem(poemData, user?.id);
      }

      recordActivity('entry');
      alert('诗词录入成功！');
      if (classId) {
        navigate(`/class/${classId}/map`);
      } else {
        navigate('/map');
      }
    } catch (error) {
      alert('诗词录入失败，请稍后重试');
      console.error(error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate(classId ? `/class/${classId}/map` : '/map')}
        className="flex items-center gap-2 mb-6 text-gray-600 hover:text-gray-700"
      >
        <ArrowLeft className="w-5 h-5" />
        <span style={{ fontFamily: "'Noto Serif SC', serif" }}>返回地图</span>
      </button>

      <div className="scroll-card p-8">
        <h1
          className="text-3xl font-bold mb-8"
          style={{
            color: '#2A1E14',
            fontFamily: "'Noto Serif SC', serif",
            textAlign: 'center'
          }}
        >
          {classId ? '班级诗词录入' : '诗词数据录入'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 基本信息 */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label
                className="block mb-2 font-semibold"
                style={{ color: '#2A1E14', fontFamily: "'Noto Serif SC', serif" }}
              >
                诗词标题 <span style={{ color: '#8C5E38' }}>*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-4 py-3 rounded-lg border"
                style={{
                  borderColor: '#D4C4A8',
                  fontFamily: "'Noto Serif SC', serif",
                  backgroundColor: '#FAF5EA'
                }}
                placeholder="例如：静夜思"
              />
            </div>

            <div>
              <label
                className="block mb-2 font-semibold"
                style={{ color: '#2A1E14', fontFamily: "'Noto Serif SC', serif" }}
              >
                作者 <span style={{ color: '#8C5E38' }}>*</span>
              </label>
              <input
                type="text"
                required
                value={formData.author}
                onChange={(e) => handleInputChange('author', e.target.value)}
                className="w-full px-4 py-3 rounded-lg border"
                style={{
                  borderColor: '#D4C4A8',
                  fontFamily: "'Noto Serif SC', serif",
                  backgroundColor: '#FAF5EA'
                }}
                placeholder="例如：李白"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label
                className="block mb-2 font-semibold"
                style={{ color: '#2A1E14', fontFamily: "'Noto Serif SC', serif" }}
              >
                朝代 <span style={{ color: '#8C5E38' }}>*</span>
              </label>
              <select
                required
                value={formData.dynasty}
                onChange={(e) => handleInputChange('dynasty', e.target.value)}
                className="w-full px-4 py-3 rounded-lg border"
                style={{
                  borderColor: '#D4C4A8',
                  fontFamily: "'Noto Serif SC', serif",
                  backgroundColor: '#FAF5EA'
                }}
              >
                <option value="">请选择朝代</option>
                {dynasties.map(dynasty => (
                  <option key={dynasty} value={dynasty}>{dynasty}</option>
                ))}
              </select>
            </div>

            <div>
              <label
                className="block mb-2 font-semibold"
                style={{ color: '#2A1E14', fontFamily: "'Noto Serif SC', serif" }}
              >
                今所在省份 <span style={{ color: '#8C5E38' }}>*</span>
              </label>
              <select
                required
                value={formData.locationModern}
                onChange={(e) => handleInputChange('locationModern', e.target.value)}
                className="w-full px-4 py-3 rounded-lg border"
                style={{
                  borderColor: '#D4C4A8',
                  fontFamily: "'Noto Serif SC', serif",
                  backgroundColor: '#FAF5EA'
                }}
              >
                <option value="">请选择省份</option>
                {provinces.map(province => (
                  <option key={province} value={province}>{province}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label
              className="block mb-2 font-semibold"
              style={{ color: '#2A1E14', fontFamily: "'Noto Serif SC', serif" }}
            >
              古代地名
            </label>
            <input
              type="text"
              value={formData.locationAncient}
              onChange={(e) => handleInputChange('locationAncient', e.target.value)}
              className="w-full px-4 py-3 rounded-lg border"
              style={{
                borderColor: '#D4C4A8',
                fontFamily: "'Noto Serif SC', serif",
                backgroundColor: '#FAF5EA'
              }}
              placeholder="例如：眉州"
            />
          </div>

          {/* 诗词内容 */}
          <div>
            <label
              className="block mb-2 font-semibold"
              style={{ color: '#2A1E14', fontFamily: "'Noto Serif SC', serif" }}
            >
              诗词内容 <span style={{ color: '#8C5E38' }}>*</span>
              <span className="text-sm font-normal text-gray-500 ml-2" style={{ fontFamily: "'Noto Serif SC', serif" }}>
                每句一行
              </span>
            </label>
            <textarea
              required
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              rows={6}
              className="w-full px-4 py-3 rounded-lg border resize-none"
              style={{
                borderColor: '#D4C4A8',
                fontFamily: "'Noto Serif SC', serif",
                backgroundColor: '#FAF5EA',
                lineHeight: '2'
              }}
              placeholder="例如：&#10;床前明月光&#10;疑是地上霜&#10;举头望明月&#10;低头思故乡"
            />
          </div>

          {/* 标签 */}
          <div>
            <label
              className="block mb-2 font-semibold"
              style={{ color: '#2A1E14', fontFamily: "'Noto Serif SC', serif" }}
            >
              标签
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.tags.map(tag => (
                <span
                  key={tag}
                  className="flex items-center gap-1 px-3 py-1 rounded-full text-sm"
                  style={{
                    backgroundColor: '#EDE8DF',
                    color: '#6B5744',
                    fontFamily: "'Noto Serif SC', serif"
                  }}
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 hover:text-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1 px-4 py-3 rounded-lg border"
                style={{
                  borderColor: '#D4C4A8',
                  fontFamily: "'Noto Serif SC', serif",
                  backgroundColor: '#FAF5EA'
                }}
                placeholder="输入标签后按回车或点击添加"
              />
              <button
                type="button"
                onClick={addTag}
                className="flex items-center gap-1 px-4 py-3 rounded-lg text-white"
                style={{
                  backgroundColor: '#8C5E38',
                  fontFamily: "'Noto Serif SC', serif"
                }}
              >
                <Plus className="w-4 h-4" />
                添加
              </button>
            </div>
          </div>

          {/* 作者简介 */}
          <div>
            <label
              className="block mb-2 font-semibold"
              style={{ color: '#2A1E14', fontFamily: "'Noto Serif SC', serif" }}
            >
              作者简介
            </label>
            <textarea
              value={formData.authorBio}
              onChange={(e) => handleInputChange('authorBio', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-lg border resize-none"
              style={{
                borderColor: '#D4C4A8',
                fontFamily: "'Noto Serif SC', serif",
                backgroundColor: '#FAF5EA'
              }}
              placeholder="简要介绍作者的生平..."
            />
          </div>

          {/* 创作背景 */}
          <div>
            <label
              className="block mb-2 font-semibold"
              style={{ color: '#2A1E14', fontFamily: "'Noto Serif SC', serif" }}
            >
              创作背景
            </label>
            <textarea
              value={formData.background}
              onChange={(e) => handleInputChange('background', e.target.value)}
              rows={4}
              className="w-full px-4 py-3 rounded-lg border resize-none"
              style={{
                borderColor: '#D4C4A8',
                fontFamily: "'Noto Serif SC', serif",
                backgroundColor: '#FAF5EA'
              }}
              placeholder="介绍这首诗词的创作背景..."
            />
          </div>

          {/* 提交按钮 */}
          <div className="flex justify-center pt-6">
            <button
              type="submit"
              className="flex items-center gap-2 px-8 py-3 rounded-lg text-white text-lg font-semibold transition-transform hover:scale-105"
              style={{
                backgroundColor: '#8C5E38',
                fontFamily: "'Noto Serif SC', serif"
              }}
            >
              <Save className="w-5 h-5" />
              保存数据
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
