import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Map as MapIcon, 
  BookOpen, 
  GraduationCap, 
  User, 
  Home, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
  const { user, logout, isLoading } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/', label: '首页', icon: Home },
    { path: '/map', label: '文学地图', icon: MapIcon },
    { path: '/study', label: '学习测评', icon: BookOpen },
    ...(user ? [{ path: '/class', label: '班级', icon: GraduationCap }] : []),
    ...(user ? [{ path: '/profile', label: '我的', icon: User }] : []),
  ];

  return (
    <div className="min-h-screen bg-paper">
      <header className="bg-white/70 backdrop-blur-md border-b border-xuan/30 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-brown to-gold rounded-lg flex items-center justify-center shadow-ink transform group-hover:scale-105 transition-transform">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-2xl text-ink font-serif tracking-wide">诗迹</span>
                <span className="text-xs text-xuan font-sans -mt-1">让文学从真空中落地</span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                      isActive
                        ? 'bg-brown/10 text-brown'
                        : 'text-ink/70 hover:text-brown hover:bg-brown/5'
                    }`}
                  >
                    <Icon className="w-4.5 h-4.5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-4">
              {isLoading ? (
                <div className="hidden md:flex items-center gap-3">
                  <div className="w-8 h-8 border-2 border-brown border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : user ? (
                <div className="hidden md:flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-ink font-medium text-sm">{user.name}</p>
                    <p className="text-xuan text-xs">{user.role?.toLowerCase() === 'teacher' ? '教师' : '学生'}</p>
                  </div>
                  <button
                    onClick={logout}
                    className="btn-ghost flex items-center gap-2"
                  >
                    <LogOut className="w-4.5 h-4.5" />
                  </button>
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-3">
                  <Link to="/login" className="btn-outline text-sm px-5 py-2">登录</Link>
                  <Link to="/register" className="btn-poetry text-sm px-5 py-2">注册</Link>
                </div>
              )}

              <button
                className="md:hidden p-2 text-ink hover:bg-brown/10 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-xuan/20 bg-white/95 backdrop-blur-md">
            <div className="px-4 py-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg ${
                      isActive
                        ? 'bg-brown/10 text-brown'
                        : 'text-ink/70 hover:bg-brown/5'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                );
              })}
              {isLoading ? (
                <div className="flex justify-center py-4">
                  <div className="w-8 h-8 border-2 border-brown border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : user ? (
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-ink/70 hover:bg-brown/5"
                >
                  <LogOut className="w-5 h-5" />
                  退出登录
                </button>
              ) : (
                <div className="pt-4 space-y-3">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full btn-outline text-center"
                  >
                    登录
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full btn-poetry text-center"
                  >
                    注册
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
