import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, CheckSquare, TrendingUp, Lock, ArrowLeft, Check, X, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useActivity } from '../contexts/ActivityContext';

interface Question {
  id: number;
  title: string;
  content: string;
  blanks: Array<{
    id: number;
    answer: string;
  }>;
}

interface QuestionAttempt {
  questionId: number;
  answers: Record<number, string>;
  isCorrect: boolean;
  wrongBlanks: number[];
  timestamp: number;
}

const practiceQuestions: Question[] = [
  {
    id: 1,
    title: '《荀子·劝学》',
    content: '《荀子·劝学》中举例说，笔直的木材如果"___________"，就会弯曲到符合圆规的标准；即使再经暴晒也不会挺直，因为"___________"。',
    blanks: [
      { id: 1, answer: '輮以为轮' },
      { id: 2, answer: '輮使之然也' }
    ]
  },
  {
    id: 2,
    title: '《醉翁亭记》',
    content: '欧阳修《醉翁亭记》中称出游时的食物都可来自山间，肥美的鱼从溪水中捕捞出，所谓"___________，___________"；而用泉水酿制的美酒，口味甘洌。',
    blanks: [
      { id: 3, answer: '临溪而渔' },
      { id: 4, answer: '溪深而鱼肥' }
    ]
  },
  {
    id: 3,
    title: '《赤壁赋》',
    content: '苏轼在《赤壁赋》中发议论说，江水不停地流去，"___________"；月亮时圆时缺，"___________"。',
    blanks: [
      { id: 5, answer: '而未尝往也' },
      { id: 6, answer: '而卒莫消长也' }
    ]
  }
];

export default function Study() {
  const { user } = useAuth();
  const { recordActivity } = useActivity();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [practiceMode, setPracticeMode] = useState(false);
  const [showWrongQuestions, setShowWrongQuestions] = useState(false);
  const [questionAttempts, setQuestionAttempts] = useState<Record<number, QuestionAttempt>>({});

  // Load progress from localStorage when component mounts
  useEffect(() => {
    if (user?.id) {
      const savedProgress = localStorage.getItem(`study-progress-${user.id}`);
      if (savedProgress) {
        const parsed = JSON.parse(savedProgress);
        setQuestionAttempts(parsed.attempts || {});
        if (!showWrongQuestions) {
          const firstUnattemptedIndex = findFirstUnattemptedIndex(parsed.attempts || {});
          if (firstUnattemptedIndex !== -1) {
            setCurrentQuestionIndex(firstUnattemptedIndex);
          } else {
            const lastAttemptedIndex = findLastAttemptedIndex(parsed.attempts || {});
            if (lastAttemptedIndex !== -1) {
              setCurrentQuestionIndex(lastAttemptedIndex);
            }
          }
        }
      }
    }
  }, [user?.id]);

  const currentQuestion = practiceQuestions[currentQuestionIndex];

  const wrongQuestions = Object.values(questionAttempts)
    .filter(attempt => !attempt.isCorrect)
    .map(attempt => practiceQuestions.find(q => q.id === attempt.questionId))
    .filter(Boolean) as Question[];

  const findFirstUnattemptedIndex = (attempts: Record<number, QuestionAttempt>) => {
    for (let i = 0; i < practiceQuestions.length; i++) {
      if (!attempts[practiceQuestions[i].id]) {
        return i;
      }
    }
    return -1;
  };

  const findLastAttemptedIndex = (attempts: Record<number, QuestionAttempt>) => {
    let lastIndex = -1;
    let lastTimestamp = 0;
    for (let i = 0; i < practiceQuestions.length; i++) {
      const attempt = attempts[practiceQuestions[i].id];
      if (attempt && attempt.timestamp > lastTimestamp) {
        lastTimestamp = attempt.timestamp;
        lastIndex = i;
      }
    }
    return lastIndex;
  };

  const saveProgress = (attempt: QuestionAttempt) => {
    if (!user?.id) return;
    
    const newAttempts = {
      ...questionAttempts,
      [attempt.questionId]: attempt
    };
    
    setQuestionAttempts(newAttempts);
    localStorage.setItem(`study-progress-${user.id}`, JSON.stringify({
      attempts: newAttempts
    }));
  };

  const handleAnswerChange = (blankId: number, value: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [blankId]: value
    }));
  };

  const checkAnswers = () => {
    if (!currentQuestion) return;

    let correct = true;
    const wrongBlanks: number[] = [];

    currentQuestion.blanks.forEach(blank => {
      if (userAnswers[blank.id]?.trim() !== blank.answer) {
        correct = false;
        wrongBlanks.push(blank.id);
      }
    });

    const attempt: QuestionAttempt = {
      questionId: currentQuestion.id,
      answers: userAnswers,
      isCorrect: correct,
      wrongBlanks,
      timestamp: Date.now()
    };

    saveProgress(attempt);
    recordActivity('practice');
    setShowResults(true);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < practiceQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setShowResults(false);
      setUserAnswers({});
    }
  };

  const resetPractice = () => {
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setShowResults(false);
    setPracticeMode(false);
  };

  const reviewWrongQuestion = (questionId: number) => {
    const index = practiceQuestions.findIndex(q => q.id === questionId);
    if (index !== -1) {
      setCurrentQuestionIndex(index);
      setUserAnswers({});
      setShowResults(false);
      setShowWrongQuestions(false);
    }
  };

  const getScore = () => {
    let correct = 0;
    currentQuestion.blanks.forEach(blank => {
      if (userAnswers[blank.id]?.trim() === blank.answer) {
        correct++;
      }
    });
    return { correct, total: currentQuestion.blanks.length };
  };

  const hasAttempted = (questionId: number) => {
    return !!questionAttempts[questionId];
  };

  if (showWrongQuestions) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => setShowWrongQuestions(false)}
            className="p-2 hover:bg-xuan/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-ink/70" />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-ink font-serif">错题本</h1>
            <p className="text-ink/60">
              共 {wrongQuestions.length} 道错题
            </p>
          </div>
        </div>

        {wrongQuestions.length === 0 ? (
          <div className="scroll-card p-8 text-center">
            <BookOpen className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-ink mb-2 font-serif">太棒了！</h3>
            <p className="text-ink/60">你还没有错题，继续保持！</p>
          </div>
        ) : (
          <div className="space-y-4">
            {wrongQuestions.map((question) => {
              const attempt = questionAttempts[question.id];
              return (
                <div key={question.id} className="scroll-card p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-ink font-serif">{question.title}</h3>
                      <p className="text-sm text-ink/60">
                        做错时间：{new Date(attempt.timestamp).toLocaleString('zh-CN')}
                      </p>
                    </div>
                    <button
                      onClick={() => reviewWrongQuestion(question.id)}
                      className="btn-outline text-sm"
                    >
                      重新练习
                    </button>
                  </div>
                  <p className="text-deepInk/80 font-serif leading-relaxed">
                    {question.content}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  if (practiceMode) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={resetPractice}
            className="p-2 hover:bg-xuan/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-ink/70" />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-ink font-serif">填空练习</h1>
            <p className="text-ink/60">
              第 {currentQuestionIndex + 1} 题 / 共 {practiceQuestions.length} 题
            </p>
          </div>
        </div>

        <div className="scroll-card p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-ink font-serif">{currentQuestion.title}</h2>
            {hasAttempted(currentQuestion.id) && (
              <div className="flex items-center gap-2 text-sm text-ink/60">
                <Clock className="w-4 h-4" />
                已做过
              </div>
            )}
          </div>

          <div className="mb-8">
            <div className="text-lg text-deepInk font-serif leading-loose space-y-3">
              {currentQuestion.blanks.map((blank, index) => {
                const parts = currentQuestion.content.split('___________');
                return (
                  <div key={blank.id} className="flex flex-wrap items-center gap-2">
                    {index < parts.length && (
                      <span>{parts[index]}</span>
                    )}
                    {showResults ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={userAnswers[blank.id] || ''}
                          disabled
                          className={`px-3 py-2 border rounded-lg font-serif min-w-[200px] ${
                            userAnswers[blank.id]?.trim() === blank.answer
                              ? 'border-green-500 bg-green-50 text-green-800'
                              : 'border-red-500 bg-red-50 text-red-800'
                          }`}
                        />
                        {userAnswers[blank.id]?.trim() === blank.answer ? (
                          <Check className="w-5 h-5 text-green-600" />
                        ) : (
                          <X className="w-5 h-5 text-red-600" />
                        )}
                        {userAnswers[blank.id]?.trim() !== blank.answer && (
                          <span className="text-sm text-green-700 font-serif">
                            正确答案：{blank.answer}
                          </span>
                        )}
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={userAnswers[blank.id] || ''}
                        onChange={(e) => handleAnswerChange(blank.id, e.target.value)}
                        placeholder="___________"
                        className="px-3 py-2 border border-xuan/30 rounded-lg font-serif min-w-[200px] focus:border-brown focus:ring-2 focus:ring-brown/20 outline-none"
                      />
                    )}
                  </div>
                );
              })}
              {currentQuestion.blanks.length < currentQuestion.content.split('___________').length && (
                <span>{currentQuestion.content.split('___________')[currentQuestion.blanks.length]}</span>
              )}
            </div>
          </div>

          {showResults ? (
            <div className="mb-6">
              <div className="bg-gradient-to-br from-gold/10 to-brown/10 rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-brown mb-2 font-serif">
                  {getScore().correct} / {getScore().total}
                </div>
                <p className="text-ink/70 font-serif">
                  {getScore().correct === getScore().total ? '太棒了！全部正确！🎉' : '继续加油！'}
                </p>
              </div>
            </div>
          ) : null}

          <div className="flex gap-4">
            {!showResults ? (
              <button
                onClick={checkAnswers}
                className="btn-outline w-full"
              >
                提交答案
              </button>
            ) : (
              <>
                {currentQuestionIndex < practiceQuestions.length - 1 && (
                  <button
                    onClick={nextQuestion}
                    className="btn-outline w-full"
                  >
                    下一题
                  </button>
                )}
                <button
                  onClick={resetPractice}
                  className="btn-outline w-full"
                >
                  返回
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-ink font-serif mb-3">学习测评</h1>
        <p className="text-ink/60">通过多种练习方式，巩固你的古诗词知识</p>
      </div>

      {!user && (
        <div className="scroll-card p-8 mb-10 text-center bg-gradient-to-br from-gold/5 to-brown/5">
          <Lock className="w-14 h-14 text-xuan mx-auto mb-5" />
          <h3 className="text-xl font-bold text-ink mb-3 font-serif">登录后开始学习</h3>
          <p className="text-ink/60 mb-6 max-w-sm mx-auto">
            登录账号可以记录你的学习进度和错题，方便复习巩固
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/login" className="btn-outline">登录</Link>
            <Link to="/register" className="btn-outline">注册</Link>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6 mb-12">
        {/* 填空默写 */}
        <div className="scroll-card p-7 group hover:-translate-y-1 transition-all">
          <div className="w-14 h-14 bg-gradient-to-br from-gold to-brown rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
            <CheckSquare className="w-7 h-7 text-white" />
          </div>
          <h3 className="text-xl font-bold text-ink mb-2 font-serif">填空默写</h3>
          <p className="text-ink/60 text-sm leading-relaxed mb-5">
            填写诗词中的空白处，巩固记忆
          </p>
          <button 
            onClick={() => setPracticeMode(true)}
            className="btn-outline w-full"
            disabled={!user}
          >
            开始练习
          </button>
        </div>

        {/* 研究学习 */}
        <div className="scroll-card p-7 group hover:-translate-y-1 transition-all">
          <div className="w-14 h-14 bg-gradient-to-br from-violet to-cinnabar rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
            <TrendingUp className="w-7 h-7 text-white" />
          </div>
          <h3 className="text-xl font-bold text-ink mb-2 font-serif">研究学习</h3>
          <p className="text-ink/60 text-sm leading-relaxed mb-5">
            撰写诗词研究文章，发表你的见解
          </p>
          <Link 
            to="/research"
            className="btn-outline w-full block text-center"
          >
            开始创作
          </Link>
        </div>
      </div>

      <div className="scroll-card p-8 bg-gradient-to-br from-gold/5 to-transparent">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-ink font-serif flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-brown" />
            我的错题本
          </h2>
          {user && (
            <span className="text-sm text-ink/60 font-serif">
              {wrongQuestions.length} 道错题
            </span>
          )}
        </div>
        {!user ? (
          <div className="text-center py-10">
            <p className="text-ink/50">登录后查看你的错题</p>
          </div>
        ) : wrongQuestions.length === 0 ? (
          <div className="text-center py-10">
            <BookOpen className="w-12 h-12 text-green-600 mx-auto mb-3" />
            <p className="text-ink/60">太棒了！你还没有错题，继续保持！</p>
          </div>
        ) : (
          <button
            onClick={() => setShowWrongQuestions(true)}
            className="w-full text-center py-4 bg-white/50 rounded-lg hover:bg-white/70 transition-colors font-serif"
          >
            查看 {wrongQuestions.length} 道错题
          </button>
        )}
      </div>
    </div>
  );
}
