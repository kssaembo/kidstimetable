
import React, { useState } from 'react';
import { DayOfWeek, ScheduleEvent, SchoolTime } from '../types';
import { DAYS, END_HOUR, PIXELS_PER_HOUR, CATEGORY_COLORS } from '../constants';
import { X, Clock, GraduationCap } from 'lucide-react';

interface ScheduleGridProps {
  schedules: ScheduleEvent[];
  schoolTimes?: SchoolTime[];
  startHour: number; // 시작 시간을 외부에서 주입받음
  onDrop?: (day: DayOfWeek, time: string) => void;
  onEventClick?: (event: ScheduleEvent) => void;
  onEventDelete?: (id: string) => void;
  onEventMoveStart?: (id: string, e: React.DragEvent) => void;
  isPrinting?: boolean;
}

const ScheduleGrid: React.FC<ScheduleGridProps> = ({ 
  schedules, 
  schoolTimes = [],
  startHour,
  onDrop, 
  onEventClick, 
  onEventDelete,
  onEventMoveStart,
  isPrinting 
}) => {
  const [dragOverInfo, setDragOverInfo] = useState<{ day: DayOfWeek, time: string, y: number } | null>(null);
  const hours = Array.from({ length: END_HOUR - startHour + 1 }, (_, i) => startHour + i);
  
  const HEADER_HEIGHT = 48;
  const totalContentHeight = (END_HOUR - startHour + 1) * PIXELS_PER_HOUR;
  const totalGridHeight = totalContentHeight + HEADER_HEIGHT;

  const calculatePosition = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    const diff = (h + m / 60) - startHour;
    return diff * PIXELS_PER_HOUR;
  };

  const calculateHeight = (start: string, end: string) => {
    const [h1, m1] = start.split(':').map(Number);
    const [h2, m2] = end.split(':').map(Number);
    const diff = (h2 + m2 / 60) - (h1 + m1 / 60);
    return diff * PIXELS_PER_HOUR;
  };

  const getSnappedTimeInfo = (e: React.DragEvent, day: DayOfWeek) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const currentDrag = (window as any).currentDrag;
    
    const dragOffset = currentDrag?.offsetY || 0;
    
    // Y position relative to the grid content (after header)
    const y = e.clientY - rect.top - dragOffset - HEADER_HEIGHT;
    
    const totalMinutes = (y / PIXELS_PER_HOUR) * 60;
    const snappedMinutes = Math.round(totalMinutes / 10) * 10;
    
    const h = Math.floor(snappedMinutes / 60) + startHour;
    const m = snappedMinutes % 60;
    
    const safeH = Math.min(Math.max(h, startHour), END_HOUR);
    const timeString = `${safeH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    const snappedY = ((safeH - startHour) * 60 + m) / 60 * PIXELS_PER_HOUR;
    
    return { timeString, snappedY };
  };

  const handleDragOver = (e: React.DragEvent, day: DayOfWeek) => {
    e.preventDefault();
    const { timeString, snappedY } = getSnappedTimeInfo(e, day);
    setDragOverInfo({ day, time: timeString, y: snappedY });
  };

  const handleDragLeave = () => {
    setDragOverInfo(null);
  };

  const handleDrop = (e: React.DragEvent, day: DayOfWeek) => {
    e.preventDefault();
    setDragOverInfo(null);
    const { timeString } = getSnappedTimeInfo(e, day);
    if (onDrop) onDrop(day, timeString);
  };

  const currentDrag = (window as any).currentDrag;
  const previewHeight = currentDrag?.duration 
    ? (currentDrag.duration / 60) * PIXELS_PER_HOUR 
    : 40; 

  return (
    <div 
      id="schedule-capture-area"
      className={`relative flex bg-white rounded-xl shadow-sm overflow-auto custom-scrollbar h-full ${isPrinting ? 'print-area h-auto overflow-visible' : ''}`}
    >
      {/* 시간 열 (왼쪽 고정) */}
      <div 
        className="w-16 border-r border-slate-200 bg-slate-50 flex-shrink-0 sticky left-0 z-30"
        style={{ height: totalGridHeight }}
      >
        <div className="h-12 border-b border-slate-200 bg-slate-50"></div>
        {hours.map((hour) => (
          <div key={hour} className="h-[120px] text-center bg-slate-50 relative border-b border-slate-200 last:border-b-0">
            {/* 시(00분) 레이블 */}
            <div className="absolute top-1 left-0 right-0 flex justify-center">
              <span className="font-bold text-slate-700 text-[11px] bg-slate-50 px-1">{hour}:00</span>
            </div>
            {/* 30분 레이블 */}
            <div className="absolute top-[60px] left-0 right-0 flex justify-center transform -translate-y-1/2">
              <span className="font-medium text-slate-400 text-[10px] bg-slate-50 px-1">{hour}:30</span>
            </div>
          </div>
        ))}
      </div>

      {/* 요일 및 그리드 영역 */}
      <div className="flex-1 flex min-w-[1000px]" style={{ height: totalGridHeight }}>
        {DAYS.map((day) => (
          <div 
            key={day} 
            className="flex-1 min-w-[140px] border-r border-slate-200 last:border-r-0 relative group bg-white/50"
            style={{ height: totalGridHeight }}
            onDragOver={(e) => handleDragOver(e, day)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, day)}
          >
            {/* 요일 헤더 */}
            <div className="h-12 border-b border-slate-200 flex items-center justify-center font-bold text-slate-800 bg-slate-100 sticky top-0 z-20 backdrop-blur-sm">
              {day}
            </div>
            
            {/* 그리드 배경 레이어 */}
            <div className="relative" style={{ height: totalContentHeight }}>
              {hours.map((hour) => (
                <div key={hour} className="h-[120px] border-b border-slate-200 pointer-events-none relative last:border-b-0">
                  <div className="absolute top-[20px] w-full border-b border-slate-100 border-dashed"></div>
                  <div className="absolute top-[40px] w-full border-b border-slate-100 border-dashed"></div>
                  <div className="absolute top-[60px] w-full border-b border-slate-200"></div>
                  <div className="absolute top-[80px] w-full border-b border-slate-100 border-dashed"></div>
                  <div className="absolute top-[100px] w-full border-b border-slate-100 border-dashed"></div>
                </div>
              ))}

              {/* 학교 수업 시간 표시 */}
              {schoolTimes
                .filter(st => st.day === day && st.isEnabled)
                .map((st, idx) => {
                  const top = calculatePosition(st.startTime);
                  const height = calculateHeight(st.startTime, st.endTime);
                  
                  // 현재 그리드 범위(startHour) 밖의 수업은 제외 또는 조정
                  if (top + height <= 0 || top >= totalContentHeight) return null;
                  
                  const safeTop = Math.max(0, top);
                  const safeHeight = Math.min(height - (safeTop - top), totalContentHeight - safeTop);

                  return (
                    <div 
                      key={`school-${idx}`}
                      className="absolute left-0 right-0 z-0 flex items-center justify-center overflow-hidden"
                      style={{ 
                        top: `${safeTop}px`, 
                        height: `${safeHeight}px`,
                        background: 'repeating-linear-gradient(45deg, #f1f5f9, #f1f5f9 10px, #e2e8f0 10px, #e2e8f0 20px)',
                        opacity: 0.9,
                      }}
                    >
                      <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-white/40 px-1 rounded">
                        <GraduationCap size={14} />
                        학교 수업 ({st.startTime}-{st.endTime})
                      </div>
                    </div>
                  );
                })}

              {/* 드랍 가이드 박스 */}
              {dragOverInfo && dragOverInfo.day === day && (
                <div 
                  className="absolute left-0 right-0 bg-indigo-500/30 border-2 border-indigo-600/60 z-10 pointer-events-none flex flex-col items-center justify-start py-1 shadow-lg transition-all duration-75 rounded-lg"
                  style={{ top: `${dragOverInfo.y}px`, height: `${previewHeight}px` }}
                >
                  <div className="flex items-center gap-1 bg-indigo-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-lg transform -translate-y-2">
                    <Clock size={10} />
                    {dragOverInfo.time} 시작
                  </div>
                </div>
              )}

              {/* 일정 카드 레이어 */}
              {schedules
                .filter((s) => s.dayOfWeek === day)
                .map((event) => {
                  const top = calculatePosition(event.startTime);
                  const height = calculateHeight(event.startTime, event.endTime);
                  const color = CATEGORY_COLORS[event.category] || '#E0F2FE';

                  // 시작 시간 필터링
                  if (top + height <= 0 || top >= totalContentHeight) return null;

                  return (
                    <div
                      key={event.id}
                      draggable
                      onDragStart={(e) => onEventMoveStart?.(event.id, e)}
                      onClick={() => onEventClick?.(event)}
                      className="absolute left-1 right-1 rounded-lg border p-2 text-xs shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md hover:scale-[1.01] transition-all overflow-hidden z-20 group/event"
                      style={{
                        top: `${top}px`,
                        height: `${height}px`,
                        backgroundColor: color,
                        borderColor: `rgba(0,0,0,0.1)`,
                      }}
                    >
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventDelete?.(event.id);
                        }}
                        className="absolute top-1 right-1 w-5 h-5 bg-white/50 hover:bg-rose-500 hover:text-white rounded-full flex items-center justify-center transition-all opacity-0 group-hover/event:opacity-100 shadow-sm"
                      >
                        <X size={12} />
                      </button>
                      <div className="font-bold text-slate-900 leading-tight mb-0.5 pr-4 truncate">{event.title}</div>
                      <div className="text-[9px] text-slate-700 font-bold">
                        {event.startTime} - {event.endTime}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScheduleGrid;
