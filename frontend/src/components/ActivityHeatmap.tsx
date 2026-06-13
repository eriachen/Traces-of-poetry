import React, { useState, useMemo, useCallback } from 'react';
import { useActivity } from '../contexts/ActivityContext';

const WEEKDAYS = ['一', '', '三', '', '五', '', '日'];
const MONTHS = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

const HEATMAP_COLORS = ['#EDE3D0', '#D4B896', '#C4A067', '#8C5E38', '#4A3728'];

const ActivityHeatmap: React.FC = () => {
  const { activities = [] } = useActivity();

  // 获取某天的活动总数
  const getActivityCount = useCallback((dateStr: string): number => {
    if (!Array.isArray(activities)) return 0;
    return activities
      .filter(a => a.date === dateStr)
      .reduce((sum, a) => sum + (a.count || 0), 0);
  }, [activities]);

  // 获取颜色
  const getColor = useCallback((count: number): string => {
    if (count === 0) return HEATMAP_COLORS[0];
    if (count <= 2) return HEATMAP_COLORS[1];
    if (count <= 4) return HEATMAP_COLORS[2];
    if (count <= 7) return HEATMAP_COLORS[3];
    return HEATMAP_COLORS[4];
  }, []);

  // 生成简化的热力图数据
  const grid = useMemo(() => {
    const result = [];
    const today = new Date();
    
    // 生成过去90天的数据
    for (let i = 89; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      result.push({
        date: dateStr,
        day: date.getDate(),
        month: date.getMonth(),
        weekday: date.getDay(),
        count: getActivityCount(dateStr)
      });
    }
    
    return result;
  }, [getActivityCount]);

  // 计算统计
  const { total, currentStreak } = useMemo(() => {
    const totalCount = grid.reduce((sum, day) => sum + day.count, 0);
    let streak = 0;
    
    // 计算当前连续天数
    const todayStr = new Date().toISOString().split('T')[0];
    for (let i = grid.length - 1; i >= 0; i--) {
      if (grid[i].count > 0) {
        streak++;
      } else if (grid[i].date !== todayStr) {
        break;
      }
    }
    
    return { total: totalCount, currentStreak: streak };
  }, [grid]);

  return (
    <div className="scroll-card p-7 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-ink font-serif flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5.5 h-5.5 text-brown" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          学习活跃度
        </h2>
      </div>

      {/* 统计栏 */}
      <div className="flex gap-10 mb-6">
        <div className="text-center">
          <div className="text-2xl font-medium text-ink mb-1" style={{ fontSize: '24px' }}>{total}</div>
          <div className="text-xs" style={{ color: '#8C7B6B', fontSize: '12px' }}>活动次数</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-medium text-ink mb-1" style={{ fontSize: '24px' }}>{currentStreak}</div>
          <div className="text-xs" style={{ color: '#8C7B6B', fontSize: '12px' }}>当前连续</div>
        </div>
      </div>

      {/* 简化热力图 */}
      <div className="overflow-x-auto pb-4">
        <div className="inline-block">
          <div className="flex mb-2">
            <div className="w-10"></div>
            <div className="flex" style={{ gap: '2px' }}>
              {Array.from({ length: 13 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    fontSize: '11px',
                    color: '#8C7B6B',
                    width: '48px'
                  }}
                >
                  {i % 2 === 0 ? MONTHS[Math.floor(i / 2)] : ''}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex flex-col justify-between w-10 pt-1">
              {WEEKDAYS.map((day, idx) => (
                <div
                  key={idx}
                  style={{
                    fontSize: '11px',
                    color: '#8C7B6B',
                    height: '14px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {day}
                </div>
              ))}
            </div>
            
            <div className="flex" style={{ gap: '2px' }}>
              {Array.from({ length: 13 }).map((_, weekIdx) => (
                <div key={weekIdx} className="flex flex-col" style={{ gap: '2px' }}>
                  {Array.from({ length: 7 }).map((_, dayIdx) => {
                    const dataIndex = weekIdx * 7 + dayIdx;
                    const data = grid[dataIndex];
                    
                    if (!data) {
                      return (
                        <div
                          key={`${weekIdx}-${dayIdx}`}
                          style={{
                            width: '12px',
                            height: '12px',
                            backgroundColor: 'transparent',
                            borderRadius: '2px'
                          }}
                        />
                      );
                    }
                    
                    return (
                      <div
                        key={`${weekIdx}-${dayIdx}`}
                        style={{
                          width: '12px',
                          height: '12px',
                          backgroundColor: getColor(data.count),
                          borderRadius: '2px'
                        }}
                        title={data.count > 0 ? `${data.date}: ${data.count} 次活动` : data.date}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 图例 */}
      <div className="flex justify-end items-center gap-2 mt-4">
        <span className="text-xs" style={{ color: '#8C7B6B', fontSize: '11px' }}>少</span>
        {HEATMAP_COLORS.map((color, idx) => (
          <div
            key={idx}
            style={{
              width: '12px',
              height: '12px',
              backgroundColor: color,
              borderRadius: '2px'
            }}
          />
        ))}
        <span className="text-xs" style={{ color: '#8C7B6B', fontSize: '11px' }}>多</span>
      </div>
    </div>
  );
};

export default ActivityHeatmap;
