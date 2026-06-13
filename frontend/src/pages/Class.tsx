import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Users,
  Plus,
  Copy,
  GraduationCap,
  BookOpen,
  TrendingUp,
  MapPin,
  Settings,
  UserPlus,
  X,
  Trash2
} from 'lucide-react';

const API_BASE = 'http://localhost:3001/api';

interface ClassMember {
  id: string;
  email: string;
  name: string;
  role?: string;
}

interface ClassInfo {
  id: string;
  name: string;
  inviteCode: string;
  teacherId: string;
  teacher?: { id: string; name: string; email?: string };
  members?: ClassMember[];
}

export default function ClassPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [showInviteConfirm, setShowInviteConfirm] = useState<{ classId: string; className: string; teacherName: string } | null>(null);
  const [selectedClass, setSelectedClass] = useState<ClassInfo | null>(null);
  const [className, setClassName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [studentEmail, setStudentEmail] = useState('');

  // 加载用户班级
  useEffect(() => {
    if (user?.id) {
      loadUserClasses(user.id);
    }
  }, [user?.id]);

  const loadUserClasses = async (userId: string) => {
    try {
      const response = await fetch(`${API_BASE}/classes/user/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setClasses(data);
      }
    } catch (error) {
      console.error('Load classes error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    try {
      const response = await fetch(`${API_BASE}/classes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: className, teacherId: user.id }),
      });

      if (response.ok) {
        await loadUserClasses(user.id);
        setShowCreateModal(false);
        setClassName('');
      }
    } catch (error) {
      console.error('Create class error:', error);
    }
  };

  const handleJoinClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    try {
      const response = await fetch(`${API_BASE}/classes/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inviteCode, userId: user.id }),
      });

      if (response.ok) {
        await loadUserClasses(user.id);
        setShowJoinModal(false);
        setInviteCode('');
      }
    } catch (error) {
      console.error('Join class error:', error);
    }
  };

  const copyInviteCode = (code: string) => {
    navigator.clipboard.writeText(code);
    alert('邀请码已复制');
  };

  const openManageModal = async (cls: ClassInfo) => {
    setSelectedClass(cls);
    // 加载班级详情
    try {
      const response = await fetch(`${API_BASE}/classes/${cls.id}`);
      if (response.ok) {
        const classData = await response.json();
        setSelectedClass(classData);
      }
    } catch (error) {
      console.error('Load class details error:', error);
    }
    setShowManageModal(true);
  };

  const addStudentByEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass) return;

    try {
      const response = await fetch(`${API_BASE}/classes/${selectedClass.id}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: studentEmail }),
      });

      if (response.ok) {
        alert('邀请已发送！');
        setShowManageModal(false);
        setStudentEmail('');
      }
    } catch (error) {
      console.error('Add student error:', error);
    }
  };

  const removeStudent = async (studentId: string) => {
    if (!selectedClass) return;

    try {
      await fetch(`${API_BASE}/classes/${selectedClass.id}/members/${studentId}`, {
        method: 'DELETE',
      });
      
      // 更新本地状态
      setSelectedClass(prev => prev ? {
        ...prev,
        members: prev.members?.filter(m => m.id !== studentId)
      } : null);
    } catch (error) {
      console.error('Remove student error:', error);
    }
  };

  if (!user) {
    return <div>请登录...</div>;
  }

  const isTeacher = user.role?.toLowerCase() === 'teacher';

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold text-ink font-serif mb-2">我的班级</h1>
          <p className="text-ink/60">与同窗一起探索诗词之美</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowJoinModal(true)}
            className="btn-outline flex items-center gap-2"
          >
            <GraduationCap className="w-5 h-5" />
            加入班级
          </button>
          {isTeacher && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-poetry flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              创建班级
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">加载中...</div>
      ) : classes.length === 0 ? (
        <div className="scroll-card p-12 text-center">
          <Users className="w-16 h-16 text-xuan mx-auto mb-6" />
          <h3 className="text-xl font-bold text-ink mb-3 font-serif">还没有班级</h3>
          <p className="text-ink/60 mb-8 max-w-sm mx-auto">
            创建或加入一个班级，开始与老师同学们一起探索诗词之美
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => setShowJoinModal(true)}
              className="btn-outline"
            >
              加入班级
            </button>
            {isTeacher && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-poetry"
              >
                创建班级
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls) => (
            <div key={cls.id} className="scroll-card p-6 group hover:-translate-y-1 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-gold to-brown rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                {isTeacher && cls.teacherId === user.id && (
                  <button
                    onClick={() => copyInviteCode(cls.inviteCode)}
                    className="p-2 text-ink/40 hover:text-brown hover:bg-brown/10 rounded-lg transition-colors"
                    title="复制邀请码"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                )}
              </div>

              <h3 className="text-xl font-bold text-ink mb-2 font-serif group-hover:text-brown transition-colors">
                {cls.name}
              </h3>
              <p className="text-ink/60 text-sm mb-4">
                教师：{cls.teacher?.name || '未知'}
              </p>

              <div className="flex items-center justify-between text-sm pt-3 border-t border-xuan/20">
                <div className="flex items-center gap-1.5 text-ink/50">
                  <Users className="w-4.5 h-4.5" />
                  {cls.memberCount || cls.members?.length || 0} 人
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    to={`/class/${cls.id}/map`}
                    className="text-brown font-medium hover:text-brown/80 transition-colors flex items-center gap-1"
                  >
                    班级地图
                    <MapPin className="w-4 h-4" />
                  </Link>
                  <Link
                    to={`/class/${cls.id}/tasks`}
                    className="text-brown font-medium hover:text-brown/80 transition-colors flex items-center gap-1"
                  >
                    主题作业
                    <TrendingUp className="w-4 h-4" />
                  </Link>
                  {isTeacher && cls.teacherId === user.id && (
                    <button
                      onClick={() => openManageModal(cls)}
                      className="text-brown font-medium hover:text-brown/80 transition-colors flex items-center gap-1"
                    >
                      管理
                      <Settings className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 创建班级模态框 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-ink/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-paper rounded-2xl p-8 w-full max-w-md shadow-ink">
            <h3 className="text-2xl font-bold text-ink mb-6 font-serif">创建班级</h3>
            <form onSubmit={handleCreateClass} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-ink mb-2 font-serif">
                  班级名称
                </label>
                <input
                  type="text"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="input-poetry w-full"
                  placeholder="例如：高一三班语文"
                  required
                />
              </div>
              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 btn-outline"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-poetry"
                >
                  创建
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 加入班级模态框 */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-ink/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-paper rounded-2xl p-8 w-full max-w-md shadow-ink">
            <h3 className="text-2xl font-bold text-ink mb-6 font-serif">加入班级</h3>
            <form onSubmit={handleJoinClass} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-ink mb-2 font-serif">
                  邀请码
                </label>
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  className="input-poetry w-full"
                  placeholder="请输入6位邀请码"
                  maxLength={6}
                  required
                />
              </div>
              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowJoinModal(false)}
                  className="flex-1 btn-outline"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-poetry"
                >
                  加入
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 班级管理模态框 */}
      {showManageModal && selectedClass && (
        <div className="fixed inset-0 bg-ink/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-paper rounded-2xl p-8 w-full max-w-2xl shadow-ink max-h-[80vh] overflow-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-ink font-serif">
                {selectedClass.name} - 班级管理
              </h3>
              <button
                onClick={() => setShowManageModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-6 h-6 text-ink/60" />
              </button>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-ink font-serif">
                  学生列表 ({selectedClass.members?.length || 0} 人)
                </h4>
              </div>

              <div className="space-y-2">
                {selectedClass.members && selectedClass.members.length > 0 ? (
                  selectedClass.members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-4 bg-white/60 rounded-xl border border-xuan/10"
                    >
                      <div>
                        <p className="font-medium text-ink">{member.name}</p>
                        <p className="text-sm text-ink/50">{member.email}</p>
                      </div>
                      {member.id !== user.id && (
                        <button
                          onClick={() => removeStudent(member.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-ink/40">
                    <Users className="w-8 h-8 mx-auto mb-2" />
                    暂无学生
                  </div>
                )}
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-lg font-semibold text-ink font-serif mb-4">邀请学生</h4>
              <form onSubmit={addStudentByEmail} className="flex gap-3">
                <input
                  type="email"
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  className="input-poetry flex-1"
                  placeholder="输入学生邮箱"
                  required
                />
                <button type="submit" className="btn-poetry">发送邀请</button>
              </form>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowManageModal(false)}
                className="btn-outline"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
