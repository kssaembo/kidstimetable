
import React, { useState } from 'react';
import ScheduleGrid from '../components/ScheduleGrid';
import { ScheduleEvent, Child, DayOfWeek, EventTemplate } from '../types';
import { CATEGORY_COLORS } from '../constants';
import { Search, GripVertical, Trash2, Clock, Info, ChevronRight, LayoutGrid } from 'lucide-react';

interface AssignmentProps {
  schedules: ScheduleEvent[];
  templates: EventTemplate[];
  children: Child[];
  activeChildId: string;
  setActiveChildId: (id: string) => void;
  addSchedule: (s: Omit<ScheduleEvent, 'id'>) => void;
  updateSchedule: (id: string, updates: Partial<ScheduleEvent>) => void;
  deleteSchedule: (id: string) => void;
}

const Assignment: React.FC<AssignmentProps> = ({ 
  schedules, 
  templates,
  children, 
  activeChildId, 
  setActiveChildId,
  addSchedule,
  updateSchedule,
  deleteSchedule
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Only show templates for the active child
  const filteredTemplatesByChild = templates.filter(t => t.childId === activeChildId);

  // Group templates by category
  const groupedTemplates = filteredTemplatesByChild.reduce((acc, t) => {
    if (!acc[t.category]) acc[t.category] = [];
    acc[t.category].push(t);
    return acc;
  }, {} as Record<string, EventTemplate[]>);

  const handleDragStart = (e: React.DragEvent, id: string, type: 'NEW' | 'MOVE') => {
    let duration = 60;
    let offsetY = 0;

    if (type === 'NEW') {
      const template = templates.find(t => t.id === id);
      if (template) {
        duration = template.duration;
        // 사이드바에서 새 일정을 끌어올 때는 상단(0)을 기준으로 잡는 것이 가이드와 일치시키기 쉽습니다.
        offsetY = 0; 
      }
    } else {
      const schedule = schedules.find(s => s.id === id);
      if (schedule) {
        const [h1, m1] = schedule.startTime.split(':').map(Number);
        const [h2, m2] = schedule.endTime.split(':').map(Number);
        duration = (h2 * 60 + m2) - (h1 * 60 + m1);
        
        // 실제 클릭한 지점의 y 좌표와 요소 상단의 차이를 계산합니다.
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        offsetY = e.clientY - rect.top;
      }
    }

    e.dataTransfer.setData('dragId', id);
    e.dataTransfer.setData('dragType', type);
    // 전역 객체에 드래그 중인 정보 저장 (duration 및 offsetY 포함)
    (window as any).currentDrag = { id, type, duration, offsetY };
  };

  const handleDrop = (day: DayOfWeek, time: string) => {
    const dragInfo = (window as any).currentDrag;
    if (!dragInfo) return;

    const [nh, nm] = time.split(':').map(Number);

    if (dragInfo.type === 'NEW') {
      const template = templates.find(t => t.id === dragInfo.id);
      if (template) {
        const endTotal = nh * 60 + nm + template.duration;
        const eh = Math.floor(endTotal / 60);
        const em = endTotal % 60;
        const endTime = `${eh.toString().padStart(2, '0')}:${em.toString().padStart(2, '0')}`;

        addSchedule({
          userId: template.userId,
          childId: activeChildId,
          templateId: template.id,
          title: template.title,
          dayOfWeek: day,
          startTime: time,
          endTime,
          category: template.category,
          description: template.description
        });
      }
    } else {
      const schedule = schedules.find(s => s.id === dragInfo.id);
      if (schedule) {
        const [h1, m1] = schedule.startTime.split(':').map(Number);
        const [h2, m2] = schedule.endTime.split(':').map(Number);
        const duration = (h2 * 60 + m2) - (h1 * 60 + m1);

        const endTotal = nh * 60 + nm + duration;
        const eh = Math.floor(endTotal / 60);
        const em = endTotal % 60;
        const endTime = `${eh.toString().padStart(2, '0')}:${em.toString().padStart(2, '0')}`;

        updateSchedule(schedule.id, { dayOfWeek: day, startTime: time, endTime });
      }
    }
    // Reset global drag info
    (window as any).currentDrag = null;
  };

  return (
    <div className="p-8 h-screen flex flex-col overflow-hidden">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 flex-shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">시간 배정</h2>
          <p className="text-sm text-slate-500">일정을 끌어다 놓으세요. 10분 단위로 자동 정렬됩니다.</p>
        </div>
        
        <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
          {children.map(child => (
            <button
              key={child.id}
              onClick={() => setActiveChildId(child.id)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeChildId === child.id 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {child.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex gap-6 min-h-0 pb-4">
        {/* Main Grid Area */}
        <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col min-w-0 overflow-hidden relative">
          <div className="p-3 bg-indigo-50/50 border-b border-indigo-100 flex items-center gap-2 text-indigo-700 text-[11px] font-medium flex-shrink-0">
            <Info size={14} />
            <span>일정을 잡은 지점을 기준으로 가이드 박스가 표시됩니다.</span>
          </div>
          <div className="flex-1 overflow-hidden relative">
             <ScheduleGrid 
                schedules={schedules} 
                onDrop={handleDrop}
                onEventDelete={(id) => deleteSchedule(id)}
                onEventMoveStart={(id, e) => {
                  const schedule = schedules.find(s => s.id === id);
                  let duration = 60;
                  let offsetY = 0;
                  if (schedule) {
                    const [h1, m1] = schedule.startTime.split(':').map(Number);
                    const [h2, m2] = schedule.endTime.split(':').map(Number);
                    duration = (h2 * 60 + m2) - (h1 * 60 + m1);
                    
                    // 그리드 내 일정 클릭 시 마우스 오프셋 계산
                    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                    offsetY = e.clientY - rect.top;
                  }
                  (window as any).currentDrag = { id, type: 'MOVE', duration, offsetY };
                }}
             />
          </div>
        </div>

        {/* Sidebar Event List (Templates) */}
        <div className="w-80 flex flex-col gap-4 flex-shrink-0">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex-1 flex flex-col min-h-0">
            <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
              <LayoutGrid size={16} className="text-indigo-500" />
              {children.find(c => c.id === activeChildId)?.name}의 일정
            </h3>
            
            <div className="relative mb-4">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="일정 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
            
            <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-6">
              {Object.entries(groupedTemplates).map(([category, items]) => {
                const filtered = (items as EventTemplate[]).filter(t => t.title.toLowerCase().includes(searchTerm.toLowerCase()));
                if (filtered.length === 0) return null;

                return (
                  <div key={category} className="space-y-2">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <ChevronRight size={10} />
                      {category}
                    </h4>
                    <div className="grid gap-2">
                      {filtered.map(template => (
                        <div
                          key={template.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, template.id, 'NEW')}
                          className="group bg-white border border-slate-100 p-3 rounded-xl shadow-sm hover:shadow-md hover:border-indigo-200 cursor-grab active:cursor-grabbing transition-all relative border-l-4"
                          style={{ borderLeftColor: CATEGORY_COLORS[template.category] || '#cbd5e1' }}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <GripVertical size={14} className="text-slate-300 group-hover:text-indigo-400" />
                            <span className="font-bold text-slate-800 text-xs">{template.title}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[9px] text-slate-500">
                            <Clock size={10} /> {template.duration}분 소요
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
              
              {filteredTemplatesByChild.length === 0 && (
                <div className="text-center py-12 text-slate-400 text-xs italic">
                  일정 등록 탭에서 먼저 추가해주세요.
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-4 rounded-2xl text-white shadow-lg shadow-indigo-100">
            <h5 className="font-bold text-xs mb-1 flex items-center gap-1">
              💡 팁
            </h5>
            <p className="text-[10px] leading-relaxed opacity-90">
              화면이 좁을 경우 가로/세로 스크롤을 통해 모든 요일과 시간(22시까지)을 확인하실 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Assignment;
