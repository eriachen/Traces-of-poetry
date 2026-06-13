import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, Mail, Lock, User, ArrowLeft } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError('登录失败，请检查邮箱和密码');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <Link to="/" className="flex items-center gap-2 text-ink/60 hover:text-brown mb-8 transition-colors group">
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          返回首页
        </Link>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-brown to-gold rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-ink">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-ink font-serif">欢迎回来</h2>
          <p className="text-ink/60 mt-2">继续你的诗词之旅</p>
        </div>

        <div className="scroll-card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-cinnabar/10 border border-cinnabar/20 text-cinnabar px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-ink mb-2 font-serif">
                邮箱
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-xuan absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-poetry w-full pl-12"
                  placeholder="请输入邮箱"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-ink mb-2 font-serif">
                密码
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-xuan absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-poetry w-full pl-12"
                  placeholder="请输入密码"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-poetry py-4 text-base font-medium"
            >
              {loading ? '登录中...' : '登录'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-ink/60 text-sm">
              还没有账号？{' '}
              <Link to="/register" className="text-brown font-medium hover:text-brown/80 transition-colors">
                立即注册
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
