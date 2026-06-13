import React, { useState, useRef, useMemo, useEffect } from 'react';
import chinaGeoJSON from './china.json';
import { X, Plus, BookOpen, Save, MessageSquare, ZoomIn, ZoomOut, ArrowLeft, GripVertical, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { usePoetry, allDynasties, Poet } from '../contexts/PoetryContext';
import { useAnnotation } from '../contexts/AnnotationContext';
import { useParams, Link } from 'react-router-dom';

// 批注数据结构
interface Annotation {
  id?: string;
  poemId: string;
  content: string;
  isPublic: boolean;
  createdAt?: Date;
}

export default function Map() {
  const { user } = useAuth();
  const { classId } = useParams<{ classId?: string }>();
  const { getAllPoets, getAllPoems, userPoems } = usePoetry();
  const { addAnnotation: addAnnotationToDb, getAnnotationsByPoem, loadUserAnnotations } = useAnnotation();

  // 地图缩放和平移状态
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // 筛选状态
  const [selectedDynasty, setSelectedDynasty] = useState('全部');
  const [selectedPoets, setSelectedPoets] = useState<string[]>([]);

  // 选中的省份和诗词
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarPoems, setSidebarPoems] = useState<any[]>([]);

  // 批注状态
  const [annotations, setAnnotations] = useState<Record<string, Annotation[]>>({});
  const [newAnnotation, setNewAnnotation] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [editingPoem, setEditingPoem] = useState<string | null>(null);

  // 编辑游历路线状态
  const [editingRoute, setEditingRoute] = useState<string | null>(null);
  const [localPoets, setLocalPoets] = useState<Poet[]>([]);

  // 初始化本地诗人数据和加载用户批注
  React.useEffect(() => {
    setLocalPoets(getAllPoets(classId));
    if (user?.id) {
      loadUserAnnotations(user.id);
    }
  }, [getAllPoets, classId, user?.id, loadUserAnnotations]);

  // 获取完整的诗人和诗词数据
  const availablePoets = useMemo(() => localPoets.length > 0 ? localPoets : getAllPoets(classId), [localPoets, getAllPoets, classId]);
  
  const allPoems = useMemo(() => getAllPoems(classId), [getAllPoems, classId]);

  // 筛选后的诗人
  const filteredByDynasty = useMemo(() => {
    return selectedDynasty === '全部'
      ? availablePoets
      : availablePoets.filter(p => p.dynasty === selectedDynasty);
  }, [selectedDynasty, availablePoets]);

  const finalPoets = useMemo(() => {
    return selectedPoets.length > 0
      ? filteredByDynasty.filter(p => selectedPoets.includes(p.id))
      : filteredByDynasty;
  }, [selectedPoets, filteredByDynasty]);

  // 筛选后的诗词
  const filteredPoemsByDynasty = useMemo(() => {
    let poems: any[] = [];
    
    filteredByDynasty.forEach(poet => {
      poet.travelPoints.forEach(tp => {
        poems = [...poems, ...tp.poems];
      });
    });
    
    return poems;
  }, [filteredByDynasty]);

  // 收集筛选后的所有诗词
  const filteredPoems = useMemo(() => {
    let poems: any[] = [];
    
    finalPoets.forEach(poet => {
      poet.travelPoints.forEach(tp => {
        poems = [...poems, ...tp.poems];
      });
    });
    
    // 还需要添加用户独立添加的诗词
    const userIndividualPoems = userPoems.filter(up => 
      !poems.some(p => p.id === up.id)
    );
      
    poems = [...poems, ...userIndividualPoems];
    
    return poems;
  }, [finalPoets, userPoems]);

  // 经纬度转 SVG 坐标
  const lngLatToSVG = (lng: number, lat: number): [number, number] => {
    // 中国大致范围：经度 73-135，纬度 18-54
    const minLng = 73, maxLng = 135;
    const minLat = 18, maxLat = 54;
    
    const x = ((lng - minLng) / (maxLng - minLng)) * 900 + 50;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 800 + 50;
    
    return [x, y];
  };

  // 处理 GeoJSON 路径
  const getPathD = (feature: any): string => {
    const geometry = feature.geometry;
    let path = '';
    
    if (geometry.type === 'Polygon') {
      geometry.coordinates.forEach((ring: any) => {
        const coords = ring.map((coord: any) => lngLatToSVG(coord[0], coord[1]));
        if (coords.length > 0) {
          path += `M ${coords.map((c: any) => c.join(',')).join(' L ')} Z `;
        }
      });
    } else if (geometry.type === 'MultiPolygon') {
      geometry.coordinates.forEach((polygon: any) => {
        polygon.forEach((ring: any) => {
          const coords = ring.map((coord: any) => lngLatToSVG(coord[0], coord[1]));
          if (coords.length > 0) {
            path += `M ${coords.map((c: any) => c.join(',')).join(' L ')} Z `;
          }
        });
      });
    }
    
    return path;
  };

  // 计算省份诗词数量
  const getProvincePoemCount = (provinceName: string) => {
    return filteredPoems.filter(poem => 
      poem.province?.includes(provinceName) || 
      provinceName.includes(poem.province)
    ).length;
  };

  // 处理鼠标滚轮缩放
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale(prev => Math.min(Math.max(prev * delta, 0.5), 4));
  };

  // 处理鼠标拖动开始
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  // 处理鼠标移动
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  // 处理鼠标松开
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // 处理省份点击
  const handleProvinceClick = (provinceName: string) => {
    setSelectedProvince(provinceName);
    
    // 筛选该省份的诗词
    const provincePoems = filteredPoems.filter(poem => 
      poem.province?.includes(provinceName) || 
      provinceName.includes(poem.province)
    );
    
    setSidebarPoems(provincePoems);
    setSidebarOpen(true);
  };

  // 切换诗人选择
  const togglePoetSelection = (poetId: string) => {
    setSelectedPoets(prev =>
      prev.includes(poetId)
        ? prev.filter(id => id !== poetId)
        : [...prev, poetId]
    );
  };

  // 清除所有筛选
  const clearFilters = () => {
    setSelectedDynasty('全部');
    setSelectedPoets([]);
  };

  // 添加批注
  const addAnnotation = async (poemId: string) => {
    if (!newAnnotation.trim() || !user?.id) return;
    
    try {
      await addAnnotationToDb(poemId, user.id, newAnnotation, isPublic);
      setNewAnnotation('');
      setEditingPoem(null);
    } catch (error) {
      console.error('Failed to add annotation:', error);
      alert('添加批注失败，请重试');
    }
  };

  // 移动游历点位置（调整顺序）
  const moveTravelPoint = (poetId: string, fromIndex: number, toIndex: number) => {
    setLocalPoets(prev => prev.map(poet => {
      if (poet.id !== poetId) return poet;
      
      const newPoints = [...poet.travelPoints];
      const [moved] = newPoints.splice(fromIndex, 1);
      newPoints.splice(toIndex, 0, moved);
      
      return { ...poet, travelPoints: newPoints };
    }));
  };

  // 删除游历点
  const removeTravelPoint = (poetId: string, index: number) => {
    setLocalPoets(prev => prev.map(poet => {
      if (poet.id !== poetId) return poet;
      
      const newPoints = poet.travelPoints.filter((_, i) => i !== index);
      return { ...poet, travelPoints: newPoints };
    }));
  };

  // 绘制游历连线
  const renderTravelLines = () => {
    return finalPoets.map(poet => {
      if (poet.travelPoints.length < 2) return null;
      
      const points = poet.travelPoints.map(tp => lngLatToSVG(tp.lng, tp.lat));
      const pathD = points.map((p, i) => (i === 0 ? `M ${p[0]},${p[1]}` : `L ${p[0]},${p[1]}`)).join(' ');
      
      return (
        <g key={`line-${poet.id}`}>
          <path
            d={pathD}
            fill="none"
            stroke={poet.color}
            strokeWidth={2}
            strokeDasharray="6,4"
            opacity={0.7}
          />
        </g>
      );
    });
  };

  // 绘制游历点（带数字顺序）
  const renderTravelPoints = () => {
    const points: JSX.Element[] = [];
    
    finalPoets.forEach(poet => {
      poet.travelPoints.forEach((tp, idx) => {
        const [x, y] = lngLatToSVG(tp.lng, tp.lat);
        points.push(
          <g key={`point-${poet.id}-${idx}`}>
            <circle
              cx={x}
              cy={y}
              r={10}
              fill={poet.color}
              stroke="#fff"
              strokeWidth={2}
              className="cursor-pointer"
            />
            <text
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#fff"
              fontSize="10"
              fontWeight="bold"
              className="pointer-events-none"
            >
              {idx + 1}
            </text>
          </g>
        );
      });
    });
    
    return points;
  };

  // 绘制省份
  const renderProvinces = () => {
    return chinaGeoJSON.features.map((feature: any) => {
      const provinceName = feature.properties.name;
      const isSelected = selectedProvince === provinceName;
      const pathD = getPathD(feature);
      
      // 检查该省份是否有诗词
      const hasPoems = filteredPoemsByDynasty.some(poem => 
        poem.province?.includes(provinceName) || 
        provinceName.includes(poem.province)
      );
      
      return (
        <path
          key={feature.properties.id}
          d={pathD}
          fill={isSelected ? '#C4A067' : (hasPoems ? '#D4C4A8' : '#EDE8DF')}
          stroke={isSelected ? '#8C5E38' : '#FAF5EA'}
          strokeWidth={isSelected ? 2 : 1.5}
          style={{ cursor: 'pointer' }}
          onClick={() => handleProvinceClick(provinceName)}
          className="transition-all duration-300"
        />
      );
    });
  };

  return (
    <div className="min-h-screen bg-paper flex">
      {/* 左侧边栏 - 筛选和录入 */}
      <div className="w-80 bg-paper border-r border-xuan flex flex-col h-screen overflow-hidden">
        {/* 标题区域 */}
        <div className="p-6 border-b border-xuan">
          <div className="flex items-center gap-3 mb-2">
            <Link to="/" className="flex items-center gap-2">
              <ArrowLeft className="w-5 h-5 text-ink/60 hover:text-ink" />
            </Link>
            <h1 className="text-2xl font-bold font-serif text-ink">诗迹</h1>
          </div>
          <p className="text-xs text-ink/60 tracking-[0.3em]">SHIJI · POETRY MAP</p>
          <p className="text-sm text-ink/60 mt-2 italic">让文学从真空中落地</p>
          {classId && (
            <span className="inline-block mt-2 px-3 py-1 bg-rice text-brown rounded-full text-sm font-serif">班级地图</span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {/* 录入诗词按钮 */}
          <Link
            to="/poem-entry"
            className="btn-poetry w-full flex items-center justify-center gap-2 mb-6"
          >
            <Plus className="w-5 h-5" />
            <span className="font-serif">录入诗词</span>
          </Link>

          {/* 朝代筛选 */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-3 text-ink font-serif">朝代</label>
            <div className="flex flex-wrap gap-2">
              {allDynasties.map(dynasty => (
                <button
                  key={dynasty}
                  onClick={() => setSelectedDynasty(dynasty)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-all font-serif ${
                    selectedDynasty === dynasty
                      ? 'bg-brown text-white'
                      : 'bg-rice text-ink hover:bg-xuan'
                  }`}
                >
                  {dynasty}
                </button>
              ))}
            </div>
          </div>

          {/* 诗人筛选 */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-3 text-ink font-serif">诗人</label>
            <div className="flex flex-wrap gap-2">
              {filteredByDynasty.map(poet => (
                <button
                  key={poet.id}
                  onClick={() => togglePoetSelection(poet.id)}
                  className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-2 transition-all font-serif ${
                    selectedPoets.includes(poet.id)
                      ? 'bg-brown text-white'
                      : 'bg-rice text-ink hover:bg-xuan'
                  }`}
                >
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: poet.color }}
                  />
                  {poet.name}
                </button>
              ))}
            </div>
          </div>

          {/* 清除筛选按钮 */}
          {(selectedDynasty !== '全部' || selectedPoets.length > 0) && (
            <button
              onClick={clearFilters}
              className="w-full py-2 rounded-lg border border-brown text-brown hover:bg-rice font-serif"
            >
              清除筛选
            </button>
          )}

          {/* 诗人游历模块 - 只在选中诗人时显示 */}
          {selectedPoets.length > 0 && finalPoets.length > 0 && (
            <div className="mt-6 pt-6 border-t border-xuan">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold text-ink font-serif">诗人游历</label>
              </div>
              <div className="space-y-3">
                {finalPoets.map(poet => (
                  <div key={poet.id} className="border border-xuan rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: poet.color }}
                        />
                        <span className="text-sm font-serif text-ink font-semibold">{poet.name}</span>
                      </div>
                      <button
                        onClick={() => setEditingRoute(editingRoute === poet.id ? null : poet.id)}
                        className="text-xs text-brown hover:underline font-serif"
                      >
                        {editingRoute === poet.id ? '完成' : '编辑路线'}
                      </button>
                    </div>
                    
                    {editingRoute === poet.id ? (
                      <div className="space-y-2">
                        {poet.travelPoints.map((tp, idx) => (
                          <div key={idx} className="flex items-center gap-2 bg-rice p-2 rounded">
                            <GripVertical className="w-4 h-4 text-ink/40" />
                            <span className="text-sm font-serif text-ink">
                              {idx + 1}. {tp.city} ({tp.year})
                            </span>
                            <div className="ml-auto flex gap-1">
                              {idx > 0 && (
                                <button
                                  onClick={() => moveTravelPoint(poet.id, idx, idx - 1)}
                                  className="p-1 text-ink/60 hover:text-brown"
                                >
                                  ↑
                                </button>
                              )}
                              {idx < poet.travelPoints.length - 1 && (
                                <button
                                  onClick={() => moveTravelPoint(poet.id, idx, idx + 1)}
                                  className="p-1 text-ink/60 hover:text-brown"
                                >
                                  ↓
                                </button>
                              )}
                              <button
                                onClick={() => removeTravelPoint(poet.id, idx)}
                                className="p-1 text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {poet.travelPoints.map((tp, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs">
                            <span
                              className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold"
                              style={{ backgroundColor: poet.color }}
                            >
                              {idx + 1}
                            </span>
                            <span className="text-ink/80 font-serif">
                              {tp.city} · {tp.year} · {tp.period}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 地图主体区域 */}
      <div className="flex-1 relative h-screen">
        {/* SVG 地图 */}
        <div
          className="absolute inset-0 overflow-hidden"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          <svg
            ref={svgRef}
            viewBox="0 0 1000 900"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
              transformOrigin: 'center center',
              transition: isDragging ? 'none' : 'transform 0.1s ease-out',
              width: '100%',
              height: '100%',
              cursor: isDragging ? 'grabbing' : 'grab',
              backgroundColor: '#FAF5EA'
            }}
          >
            {/* 绘制省份 */}
            {renderProvinces()}
            
            {/* 只在选中诗人时显示游历连线和点位 */}
            {selectedPoets.length > 0 && (
              <>
                {renderTravelLines()}
                {renderTravelPoints()}
              </>
            )}
          </svg>
        </div>

        {/* 右侧侧边栏 - 诗词详情 */}
        {sidebarOpen && (
          <div className="absolute top-0 right-0 bottom-0 w-96 bg-paper border-l border-xuan shadow-paper overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold font-serif text-ink">
                  {selectedProvince || '诗词'}
                </h2>
                <button
                  onClick={() => {
                    setSidebarOpen(false);
                    setSelectedProvince(null);
                  }}
                  className="text-ink/60 hover:text-ink"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {sidebarPoems.length === 0 ? (
                <div className="text-center py-12 text-ink/60">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 text-gold" />
                  <p className="font-serif">此区域暂无诗词</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sidebarPoems.map(poem => (
                    <div
                      key={poem.id}
                      className="scroll-card p-5"
                    >
                      <h3 className="text-lg font-bold mb-2 text-ink font-serif">
                        {poem.title}
                      </h3>
                      <p className="text-sm text-ink/70 mb-3 font-serif">
                        {poem.author} · {poem.dynasty}
                      </p>
                      <div className="space-y-2 mb-3 poetry-text">
                        {poem.content?.map((line: string, idx: number) => (
                          <p key={idx} className="text-deepInk">
                            {line}
                          </p>
                        ))}
                      </div>
                      {poem.tags && poem.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {poem.tags.map((tag: string, idx: number) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-rice text-ink/80 rounded text-xs font-serif"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* 批注区域 */}
                      <div className="border-t pt-3 mt-3 border-xuan">
                        <div className="flex items-center gap-2 mb-3">
                          <MessageSquare className="w-4 h-4 text-brown" />
                          <span className="text-sm font-semibold text-ink font-serif">
                            批注
                          </span>
                        </div>

                        {/* 显示已有批注 */}
                        {getAnnotationsByPoem(poem.id).map(anno => (
                          <div
                            key={anno.id}
                            className="p-3 bg-rice rounded-lg mb-2"
                          >
                            <p className="text-sm text-deepInk font-serif">
                              {anno.content}
                            </p>
                            <p className="text-xs text-ink/50 mt-1">
                              {anno.isPublic ? '公开' : '私密'} · {
                                new Date(anno.createdAt).toLocaleDateString('zh-CN')
                              }
                            </p>
                          </div>
                        ))}

                        {/* 添加新批注 */}
                        {editingPoem === poem.id ? (
                          <div className="space-y-2">
                            <textarea
                              value={newAnnotation}
                              onChange={(e) => setNewAnnotation(e.target.value)}
                              className="input-poetry"
                              placeholder="写下你的批注..."
                              rows={3}
                            />
                            <div className="flex items-center justify-between">
                              <label className="flex items-center gap-2 text-sm text-ink">
                                <input
                                  type="checkbox"
                                  checked={isPublic}
                                  onChange={(e) => setIsPublic(e.target.checked)}
                                />
                                公开
                              </label>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    setEditingPoem(null);
                                    setNewAnnotation('');
                                  }}
                                  className="btn-ghost font-serif"
                                >
                                  取消
                                </button>
                                <button
                                  onClick={() => addAnnotation(poem.id)}
                                  className="btn-poetry flex items-center gap-1 font-serif"
                                >
                                  <Save className="w-4 h-4" />
                                  保存
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setEditingPoem(poem.id)}
                            className="text-brown text-sm font-serif hover:underline"
                          >
                            + 添加批注
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 缩放控制按钮 */}
        <div className="absolute bottom-8 right-8 flex flex-col gap-2 z-10">
          <button
            onClick={() => setScale(s => Math.min(s + 0.2, 4))}
            className="w-10 h-10 scroll-card hover:shadow-ink flex items-center justify-center text-brown"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          <button
            onClick={() => setScale(s => Math.max(s - 0.2, 0.5))}
            className="w-10 h-10 scroll-card hover:shadow-ink flex items-center justify-center text-brown"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
