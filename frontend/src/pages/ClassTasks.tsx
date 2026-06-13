import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  ArrowLeft, 
  Plus, 
  Calendar, 
  Users, 
  Star, 
  MessageSquare, 
  TrendingUp,
  CheckCircle2
} from 'lucide-react';

interface ClassMember {
  id: string;
  email: string;
  name: string;
}

interface ClassInfo {
  id: string;
  name: string;
  members: ClassMember[];
}

interface EssayTask {
  id: string;
  title: string;
  description: string;
  createdAt: Date;
  deadline: Date;
  isOpen: boolean;
  submittedStudents: string[]; // 记录已提交的学生ID
}

interface EssaySubmission {
  id: string;
  studentId: string;
  studentName: string;
  title: string;
  content: string;
  submittedAt: Date;
  isStarred: boolean;
  comments: Array<{ id: string; author: string; content: string; isPublic: boolean }>;
}

export default function ClassTasks() {
  const { classId } = useParams<{ classId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [classInfo, setClassInfo] = useState<ClassInfo | null>(null);
  const [tasks, setTasks] = useState<EssayTask[]>([]);
  const [submissions, setSubmissions] = useState<EssaySubmission[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<EssayTask | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskDeadline, setNewTaskDeadline] = useState('');

  // 加载班级和作业数据
  useEffect(() => {
    if (classId) {
      // 从localStorage加载班级数据
      const savedClasses = localStorage.getItem('poetryClasses');
      if (savedClasses) {
        const allClasses = JSON.parse(savedClasses);
        const targetClass = allClasses.find((cls: ClassInfo) => cls.id === classId);
        if (targetClass) {
          setClassInfo(targetClass);
        }
      }

      // 加载作业数据
      const savedTasks = localStorage.getItem(`tasks_${classId}`);
      if (savedTasks) {
        setTasks(JSON.parse(savedTasks).map((t: any) => ({
          ...t,
          createdAt: new Date(t.createdAt),
          deadline: new Date(t.deadline)
        })));
      } else {
        // 初始化示例作业
        const initialTasks: EssayTask[] = [
          {
            id: 'task-1',
            title: '中秋赏月有感',
            description: '结合中秋赏月的经历，创作一篇关于月亮的诗词感悟，可引用相关诗词。',
            createdAt: new Date(Date.now() - 86400000 * 3),
            deadline: new Date(Date.now() + 86400000 * 4),
            isOpen: true,
            submittedStudents: []
          }
        ];
        setTasks(initialTasks);
        localStorage.setItem(`tasks_${classId}`, JSON.stringify(initialTasks));
      }
    }
  }, [classId]);

  // 保存作业数据
  const saveTasks = (newTasks: EssayTask[]) => {
    setTasks(newTasks);
    if (classId) {
      localStorage.setItem(`tasks_${classId}`, JSON.stringify(newTasks));
    }
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newTask: EssayTask = {
      id: `task-${Date.now()}`,
      title: newTaskTitle,
      description: newTaskDescription,
      createdAt: new Date(),
      deadline: new Date(newTaskDeadline),
      isOpen: true,
      submittedStudents: []
    };
    
    saveTasks([newTask, ...tasks]);
    setShowCreateModal(false);
    setNewTaskTitle('');
    setNewTaskDescription('');
    setNewTaskDeadline('');
  };

  const toggleStar = (submissionId: string) => {
    setSubmissions(prev => prev.map(sub =>
      sub.id === submissionId ? { ...sub, isStarred: !sub.isStarred } : sub
    ));
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isTeacher = user?.role?.toLowerCase() === 'teacher';
  const totalStudents = classInfo?.members.length || 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => navigate('/class')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span style={{ fontFamily: 'Noto Serif SC, serif' }}>返回班级</span>
        </button>
        {isTeacher && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-white"
            style={{ backgroundColor: '#8C5E38', fontFamily: 'Noto Serif SC, serif' }}
          >
            <Plus className="w-5 h-5" />
            发布作业
          </button>
        )}
      </div>

      <div className="mb-8">
        <h1 
          className="text-3xl font-bold mb-2"
          style={{ color: '#2A1E14', fontFamily: 'Noto Serif SC, serif' }}
        >
          主题作业
        </h1>
        <p 
          className="text-gray-600"
          style={{ fontFamily: 'Noto Serif SC, serif' }}
        >
          {isTeacher ? '管理班级作业，查看学生提交情况' : '查看并完成老师布置的作业'}
        </p>
      </div>

      <div className="space-y-6">
        {tasks.map((task) => {
          const submittedCount = task.submittedStudents.length;
          const progressPercent = totalStudents > 0 ? Math.round((submittedCount / totalStudents) * 100) : 0;
          
          return (
            <div 
              key={task.id}
              className="scroll-card p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 
                      className="text-xl font-bold"
                      style={{ color: '#2A1E14', fontFamily: 'Noto Serif SC, serif' }}
                    >
                      {task.title}
                    </h3>
                    {!task.isOpen && (
                      <span 
                        className="px-3 py-1 rounded-full text-xs"
                        style={{ 
                          backgroundColor: '#EDE8DF', 
                          color: '#6B5744', 
                          fontFamily: 'Noto Serif SC, serif' 
                        }}
                      >
                        已截止
                      </span>
                    )}
                  </div>
                  <p 
                    className="text-gray-600 mb-4"
                    style={{ fontFamily: 'Noto Serif SC, serif' }}
                  >
                    {task.description}
                  </p>
                  <div className="flex items-center gap-6 text-sm" style={{ color: '#6B5744' }}>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      <span style={{ fontFamily: 'Noto Serif SC, serif' }}>
                        截止时间：{formatDate(task.deadline)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 进度条 */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600" style={{ fontFamily: 'Noto Serif SC, serif' }}>
                    提交进度
                  </span>
                  <span className="text-sm font-medium text-gray-800" style={{ fontFamily: 'Noto Serif SC, serif' }}>
                    {submittedCount} / {totalStudents} 人已提交
                  </span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-300"
                    style={{ 
                      width: `${progressPercent}%`,
                      background: 'linear-gradient(to right, #8C5E38, #D4A574)' 
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: '#E0D5C5' }}>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-sm" style={{ color: '#6B5744' }}>
                    <Users className="w-4 h-4" />
                    {totalStudents} 人
                  </div>
                  <div className="flex items-center gap-1.5 text-sm" style={{ color: '#6B5744' }}>
                    <CheckCircle2 className="w-4 h-4" />
                    {submittedCount} 人已提交
                  </div>
                </div>
                <div className="flex gap-3">
                  {isTeacher ? (
                    <button
                      onClick={() => {
                        setSelectedTask(task);
                        setShowSubmissionsModal(true);
                      }}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg border"
                      style={{ 
                        borderColor: '#D4C4A8', 
                        color: '#6B5744', 
                        fontFamily: 'Noto Serif SC, serif' 
                      }}
                    >
                      <TrendingUp className="w-4 h-4" />
                      查看提交
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate('/research/new', { state: { taskId: task.id, taskTitle: task.title } })}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg"
                      style={{ 
                        backgroundColor: '#8C5E38', 
                        color: 'white', 
                        fontFamily: 'Noto Serif SC, serif' 
                      }}
                    >
                      <Plus className="w-4 h-4" />
                      {task.isOpen ? '提交作业' : '查看已提交'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 创建作业模态框 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-ink/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-paper rounded-2xl p-8 w-full max-w-2xl shadow-ink">
            <h3 className="text-2xl font-bold text-ink mb-6" style={{ fontFamily: 'Noto Serif SC, serif' }}>发布作业</h3>
            <form onSubmit={handleCreateTask} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-ink mb-2" style={{ fontFamily: 'Noto Serif SC, serif' }}>
                  作业标题
                </label>
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border"
                  style={{ borderColor: '#D4C4A8', fontFamily: 'Noto Serif SC, serif' }}
                  placeholder="例如：中秋赏月有感"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-2" style={{ fontFamily: 'Noto Serif SC, serif' }}>
                  作业描述
                </label>
                <textarea
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border resize-none"
                  style={{ borderColor: '#D4C4A8', fontFamily: 'Noto Serif SC, serif' }}
                  placeholder="请输入作业要求"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-2" style={{ fontFamily: 'Noto Serif SC, serif' }}>
                  截止时间
                </label>
                <input
                  type="date"
                  value={newTaskDeadline}
                  onChange={(e) => setNewTaskDeadline(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border"
                  style={{ borderColor: '#D4C4A8', fontFamily: 'Noto Serif SC, serif' }}
                  required
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-3 rounded-lg border"
                  style={{ borderColor: '#D4C4A8', color: '#6B5744', fontFamily: 'Noto Serif SC, serif' }}
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 rounded-lg text-white"
                  style={{ backgroundColor: '#8C5E38', fontFamily: 'Noto Serif SC, serif' }}
                >
                  发布
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 查看提交模态框 */}
      {showSubmissionsModal && (
        <div className="fixed inset-0 bg-ink/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-paper rounded-2xl p-8 w-full max-w-4xl shadow-ink max-h-[80vh] overflow-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-ink" style={{ fontFamily: 'Noto Serif SC, serif' }}>
                {selectedTask?.title} - 提交列表
              </h3>
              <button
                onClick={() => setShowSubmissionsModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="w-6 h-6 text-ink/60" />
              </button>
            </div>

            <div className="space-y-4">
              {/* 这里显示示例提交 */}
              <div className="p-4 bg-white/60 rounded-xl border border-xuan/10">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-semibold text-ink" style={{ fontFamily: 'Noto Serif SC, serif' }}>
                        张三 - 中秋夜思
                      </h4>
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    </div>
                    <p className="text-sm text-ink/50" style={{ fontFamily: 'Noto Serif SC, serif' }}>
                      提交时间：{formatDate(new Date(Date.now() - 86400000 * 2))}
                    </p>
                  </div>
                  <button
                    onClick={() => {}}
                    className="p-2 rounded-lg transition-colors text-yellow-500 bg-yellow-50"
                  >
                    <Star className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-ink/80 mb-3" style={{ fontFamily: 'Noto Serif SC, serif' }}>
                  明月几时有，把酒问青天。在这个中秋之夜，我想起了苏轼的《水调歌头》...
                </p>

                <div className="border-t border-xuan/10 pt-3 mt-3">
                  <div className="flex items-start gap-2 mb-2">
                    <MessageSquare className="w-4 h-4 text-brown mt-1" />
                    <div>
                      <span className="font-medium text-ink text-sm">老师：</span>
                      <span className="text-ink/80 text-sm" style={{ fontFamily: 'Noto Serif SC, serif' }}>
                        分析很到位，有自己的见解！
                      </span>
                    </div>
                  </div>
                </div>

                <button className="mt-3 text-brown text-sm hover:underline" style={{ fontFamily: 'Noto Serif SC, serif' }}>
                  添加评语
                </button>
              </div>

              <div className="p-4 bg-white/60 rounded-xl border border-xuan/10">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-semibold text-ink" style={{ fontFamily: 'Noto Serif SC, serif' }}>
                        李四 - 望月怀古
                      </h4>
                    </div>
                    <p className="text-sm text-ink/50" style={{ fontFamily: 'Noto Serif SC, serif' }}>
                      提交时间：{formatDate(new Date(Date.now() - 86400000))}
                    </p>
                  </div>
                  <button
                    onClick={() => {}}
                    className="p-2 rounded-lg transition-colors text-ink/40 hover:bg-gray-100"
                  >
                    <Star className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-ink/80 mb-3" style={{ fontFamily: 'Noto Serif SC, serif' }}>
                  李白的《静夜思》是我最喜欢的诗词之一...
                </p>

                <button className="mt-3 text-brown text-sm hover:underline" style={{ fontFamily: 'Noto Serif SC, serif' }}>
                  添加评语
                </button>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowSubmissionsModal(false)}
                className="px-6 py-2 rounded-lg border"
                style={{ borderColor: '#D4C4A8', color: '#6B5744', fontFamily: 'Noto Serif SC, serif' }}
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
