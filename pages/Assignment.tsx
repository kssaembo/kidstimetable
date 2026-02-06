
import React, { useState } from 'react';
import ScheduleGrid from '../components/ScheduleGrid';
import { ScheduleEvent, Child, DayOfWeek, EventTemplate, SchoolTime } from '../types';
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
  schoolTimes: SchoolTime[];
}

const Assignment: React.FC<AssignmentProps> = ({ 
  schedules, 
  templates,
  children, 
  activeChildId, 
  setActiveChildId,
  addSchedule,
  updateSchedule,
  deleteSchedule,
  schoolTimes
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredTemplatesByChild = templates.filter(t => t.childId === activeChildId);

  const groupedTemplates = filteredTemplatesByChild.reduce((acc, t) => {
    if (!acc[t.category]) acc[t.category] = [];
    acc[t.category].push(t);
    return acc;
  }, {} as Record<string, EventTemplate[]>);

  const checkOverlapWithSchool = (day: DayOfWeek, startTimeStr: string, duration: number) => {
    const school = schoolTimes.find(st => st.day === day && st.isEnabled);
    if (!school) return false;

    const [sh, sm] = school.startTime.split(':').map(Number);
    const [eh, em] = school.endTime.split(':').map(Number);
    const schoolStart = sh * 60 + sm;
    const schoolEnd = eh * 60 + em;

    const [nh, nm] = startTimeStr.split(':').map(Number);
    const newStart = nh * 60 + nm;
    const newEnd = newStart + duration;

    return (newStart < schoolEnd) && (newEnd > schoolStart);
  };

  const handleDragStart = (e: React.DragEvent, id: string, type: 'NEW' | 'MOVE') => {
    let duration = 60;
    let offsetY = 0;

    if (type === 'NEW') {
      const template = templates.find(t => t.id === id);
      if (template) {
        duration = template.duration;
        offsetY = 0; 
      }
    } else {
      const schedule = schedules.find(s => s.id === id);
      if (schedule) {
        const [h1, m1] = schedule.startTime.split(':').map(Number);
        const [h2, m2] = schedule.endTime.split(':').map(Number);
        duration = (h2 * 60 + m2) - (h1 * 60 + m1);
        
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        offsetY = e.clientY - rect.top;
      }
    }

    e.dataTransfer.setData('dragId', id);
    e.dataTransfer.setData('dragType', type);
    (window as any).currentDrag = { id, type, duration, offsetY };
  };

  const handleDrop = (day: DayOfWeek, time: string) => {
    const dragInfo = (window as any).currentDrag;
    if (!dragInfo) return;

    const [nh, nm] = time.split(':').map(Number);
    const duration = dragInfo.duration;

    if (checkOverlapWithSchool(day, time, duration)) {
      alert('정규 수업 시간과 겹치는 구간에는 일정을 배치할 수 없습니다.');
      (window as any).currentDrag = null;
      return;
    }

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
    (window as any).currentDrag = null;
  };

  return (
    <div className="p-8 h-screen flex flex-col overflow-hidden">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 flex-shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">시간 배정</h2>
          <p className="text-sm text-slate-500 font-medium">일정을 끌어다 놓으세요. 수업 시간과 겹치는 곳은 배정이 불가합니다.</p>
        </div>
        
        <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
          {children.map(child => (
            <button
              key={child.id}
              onClick={() => setActiveChildId(child.id)}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
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
        {/* 시간표 영역 (가장 큰 박스 테두리는 삭제) */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm flex flex-col min-w-0 overflow-hidden relative">
          <div className="p-3 bg-indigo-50 border-b border-indigo-100 flex items-center gap-2 text-indigo-800 text-[11px] font-bold flex-shrink-0">
            <Info size={14} />
            <span>줄무늬 영역은 설정된 학교 수업 시간입니다.</span>
          </div>
          <div className="flex-1 overflow-hidden relative">
             <ScheduleGrid 
                schedules={schedules} 
                schoolTimes={schoolTimes}
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
                    
                    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                    offsetY = e.clientY - rect.top;
                  }
                  (window as any).currentDrag = { id, type: 'MOVE', duration, offsetY };
                }}
             />
          </div>
        </div>

        {/* 사이드바 영역 */}
        <div className="w-80 flex flex-col gap-4 flex-shrink-0">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex-1 flex flex-col min-h-0">
            <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
              <LayoutGrid size={16} className="text-indigo-600" />
              {children.find(c => c.id === activeChildId)?.name}의 일정
            </h3>
            
            <div className="relative mb-4">
              <Search className="absolute left-3 top-2.5 text-slate-500" size={16} />
              <input
                type="text"
                placeholder="일정 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
            
            <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-6">
              {Object.entries(groupedTemplates).map(([category, items]) => {
                const filtered = (items as EventTemplate[]).filter(t => t.title.toLowerCase().includes(searchTerm.toLowerCase()));
                if (filtered.length === 0) return null;

                return (
                  <div key={category} className="space-y-2">
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                      <ChevronRight size={10} />
                      {category}
                    </h4>
                    <div className="grid gap-2">
                      {filtered.map(template => (
                        <div
                          key={template.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, template.id, 'NEW')}
                          className="group bg-white border border-slate-200 p-3 rounded-xl shadow-sm hover:shadow-md hover:border-indigo-400 cursor-grab active:cursor-grabbing transition-all relative border-l-4"
                          style={{ borderLeftColor: CATEGORY_COLORS[template.category] || '#cbd5e1' }}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <GripVertical size={14} className="text-slate-400 group-hover:text-indigo-500" />
                            <span className="font-bold text-slate-800 text-xs">{template.title}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[9px] text-slate-600 font-bold">
                            <Clock size={10} /> {template.duration}분 소요
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Assignment;
