import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, Mail, Lock, User, School, GraduationCap, ArrowLeft } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    role: 'student' as 'student' | 'teacher',
    phone: '',
    school: '',
    grade: '',
    subject: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    if (formData.password.length < 6) {
      setError('密码长度至少6位');
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...data } = formData;
      // 将role转换为大写以匹配后端
      await register({ ...data, role: data.role.toUpperCase() as 'STUDENT' | 'TEACHER' });
      navigate('/');
    } catch (err) {
      setError('注册失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="max-w-lg w-full">
        <Link to="/" className="flex items-center gap-2 text-ink/60 hover:text-brown mb-8 transition-colors group">
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          返回首页
        </Link>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-brown to-gold rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-ink">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-ink font-serif">开始你的诗迹之旅</h2>
          <p className="text-ink/60 mt-2">创建账号，探索诗词之美</p>
        </div>

        <div className="scroll-card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-cinnabar/10 border border-cinnabar/20 text-cinnabar px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-ink mb-2 font-serif">
                  姓名
                </label>
                <div className="relative">
                  <User className="w-5 h-5 text-xuan absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    className="input-poetry w-full pl-12"
                    placeholder="请输入姓名"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-ink mb-2 font-serif">
                  身份
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="input-poetry w-full cursor-pointer"
                >
                  <option value="student">学生</option>
                  <option value="teacher">教师</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-ink mb-2 font-serif">
                邮箱
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-xuan absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-poetry w-full pl-12"
                  placeholder="请输入邮箱"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-ink mb-2 font-serif">
                  密码
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-xuan absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="input-poetry w-full pl-12"
                    placeholder="至少6位"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-ink mb-2 font-serif">
                  确认密码
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-xuan absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="input-poetry w-full pl-12"
                    placeholder="再次输入密码"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="school" className="block text-sm font-medium text-ink mb-2 font-serif">
                学校
              </label>
              <div className="relative">
                <School className="w-5 h-5 text-xuan absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  id="school"
                  name="school"
                  type="text"
                  value={formData.school}
                  onChange={handleChange}
                  className="input-poetry w-full pl-12"
                  placeholder="请输入学校"
                />
              </div>
            </div>

            {formData.role === 'student' ? (
              <div>
                <label htmlFor="grade" className="block text-sm font-medium text-ink mb-2 font-serif">
                  年级
                </label>
                <div className="relative">
                  <GraduationCap className="w-5 h-5 text-xuan absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    id="grade"
                    name="grade"
                    type="text"
                    value={formData.grade}
                    onChange={handleChange}
                    className="input-poetry w-full pl-12"
                    placeholder="例如：高一"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-ink mb-2 font-serif">
                  学科
                </label>
                <div className="relative">
                  <GraduationCap className="w-5 h-5 text-xuan absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    id="subject"
                    name="subject"
                    type="text"
                    value={formData.subject}
                    onChange={handleChange}
                    className="input-poetry w-full pl-12"
                    placeholder="例如：语文"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-poetry py-4 text-base font-medium mt-2"
            >
              {loading ? '注册中...' : '注册'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-ink/60 text-sm">
              已有账号？{' '}
              <Link to="/login" className="text-brown font-medium hover:text-brown/80 transition-colors">
                立即登录
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
