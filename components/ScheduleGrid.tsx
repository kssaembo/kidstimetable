
import React, { useState } from 'react';
import { DayOfWeek, ScheduleEvent } from '../types';
import { DAYS, START_HOUR, END_HOUR, PIXELS_PER_HOUR, CATEGORY_COLORS } from '../constants';
import { X, Clock } from 'lucide-react';

interface ScheduleGridProps {
  schedules: ScheduleEvent[];
  onDrop?: (day: DayOfWeek, time: string) => void;
  onEventClick?: (event: ScheduleEvent) => void;
  onEventDelete?: (id: string) => void;
  onEventMoveStart?: (id: string, e: React.DragEvent) => void;
  isPrinting?: boolean;
}

const ScheduleGrid: React.FC<ScheduleGridProps> = ({ 
  schedules, 
  onDrop, 
  onEventClick, 
  onEventDelete,
  onEventMoveStart,
  isPrinting 
}) => {
  const [dragOverInfo, setDragOverInfo] = useState<{ day: DayOfWeek, time: string, y: number } | null>(null);
  const hours = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);

  const calculatePosition = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    const diff = (h + m / 60) - START_HOUR;
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
    
    // 헤더 높이(h-12 = 48px)를 좌표 계산에서 제외해야 그리드 영역과 일치합니다.
    const HEADER_HEIGHT = 48;
    const dragOffset = currentDrag?.offsetY || 0;
    
    // 마우스 Y에서 컨테이너 상단을 빼고, 잡은 위치(offsetY)만큼 보정하고, 헤더(48px)를 뺍니다.
    const y = e.clientY - rect.top - dragOffset - HEADER_HEIGHT;
    
    // 1시간당 PIXELS_PER_HOUR(120px) 기준, 10분은 20px
    const totalMinutes = (y / PIXELS_PER_HOUR) * 60;
    // Math.round를 사용하여 가장 가까운 10분 단위로 스냅합니다 (더 직관적)
    const snappedMinutes = Math.round(totalMinutes / 10) * 10;
    
    const h = Math.floor(snappedMinutes / 60) + START_HOUR;
    const m = snappedMinutes % 60;
    
    // 시간대 범위를 넘어서지 않도록 보정 (13시 ~ 22시)
    const safeH = Math.min(Math.max(h, START_HOUR), END_HOUR);
    const timeString = `${safeH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    const snappedY = ((safeH - START_HOUR) * 60 + m) / 60 * PIXELS_PER_HOUR;
    
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
      className={`relative flex bg-white rounded-xl shadow-sm border border-slate-200 overflow-auto custom-scrollbar h-full ${isPrinting ? 'print-area h-auto overflow-visible' : ''}`}
    >
      <div className="w-16 border-r border-slate-100 bg-slate-50 flex-shrink-0 sticky left-0 z-30">
        <div className="h-12 border-b border-slate-100 bg-slate-50"></div>
        {hours.map((hour) => (
          <div key={hour} className="h-[120px] text-center text-[10px] text-slate-400 border-b border-slate-100 flex flex-col justify-start pt-1">
            <span className="font-bold text-slate-500 text-xs">{hour}:00</span>
            <div className="h-1/2 border-b border-slate-50 w-2 mx-auto mt-4"></div>
            <span className="opacity-50">{hour}:30</span>
          </div>
        ))}
      </div>

      <div className="flex-1 flex min-w-[1000px]">
        {DAYS.map((day) => (
          <div 
            key={day} 
            className="flex-1 min-w-[140px] border-r border-slate-100 last:border-r-0 relative group bg-white/50"
            onDragOver={(e) => handleDragOver(e, day)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, day)}
          >
            <div className="h-12 border-b border-slate-100 flex items-center justify-center font-bold text-slate-700 bg-slate-50/90 sticky top-0 z-20 backdrop-blur-sm">
              {day}
            </div>
            
            <div className="relative" style={{ height: (END_HOUR - START_HOUR + 1) * PIXELS_PER_HOUR }}>
              {hours.map((hour) => (
                <div key={hour} className="h-[120px] border-b border-slate-100/80 pointer-events-none relative">
                  <div className="absolute top-[20px] w-full border-b border-slate-50/50 border-dashed"></div>
                  <div className="absolute top-[40px] w-full border-b border-slate-50/50 border-dashed"></div>
                  <div className="absolute top-[60px] w-full border-b border-slate-100/30"></div>
                  <div className="absolute top-[80px] w-full border-b border-slate-50/50 border-dashed"></div>
                  <div className="absolute top-[100px] w-full border-b border-slate-50/50 border-dashed"></div>
                </div>
              ))}

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

              {schedules
                .filter((s) => s.dayOfWeek === day)
                .map((event) => {
                  const top = calculatePosition(event.startTime);
                  const height = calculateHeight(event.startTime, event.endTime);
                  const color = CATEGORY_COLORS[event.category] || '#E0F2FE';

                  return (
                    <div
                      key={event.id}
                      draggable
                      onDragStart={(e) => onEventMoveStart?.(event.id, e)}
                      onClick={() => onEventClick?.(event)}
                      className="absolute left-1 right-1 rounded-lg border-2 p-2 text-xs shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md hover:scale-[1.01] transition-all overflow-hidden z-20 group/event"
                      style={{
                        top: `${top}px`,
                        height: `${height}px`,
                        backgroundColor: color,
                        borderColor: `rgba(0,0,0,0.06)`,
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
                      <div className="text-[9px] text-slate-600 font-medium">
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
