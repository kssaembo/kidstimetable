
import React, { useState } from 'react';
import ScheduleGrid from '../components/ScheduleGrid';
import { ScheduleEvent, SchoolTime, Child } from '../types';
import { MORNING_START, AFTERNOON_START } from '../constants';
import { Download, FileSpreadsheet, Loader2, Sparkles, Info } from 'lucide-react';

interface DashboardProps {
  schedules: ScheduleEvent[];
  children: Child[];
  activeChildId: string;
  setActiveChildId: (id: string) => void;
  schoolTimes: SchoolTime[];
}

const Dashboard: React.FC<DashboardProps> = ({ 
  schedules, 
  children, 
  activeChildId, 
  setActiveChildId, 
  schoolTimes 
}) => {
  const [exporting, setExporting] = useState(false);
  const [viewMode, setViewMode] = useState<'morning' | 'afternoon'>('afternoon');
  const startHour = viewMode === 'morning' ? MORNING_START : AFTERNOON_START;
  const childName = children.find(c => c.id === activeChildId)?.name || '아이';

  const handleExportImage = async () => {
    const element = document.getElementById('schedule-capture-area');
    if (!element) return;
    
    setExporting(true);
    try {
      // html2canvas 옵션 설정: 전체 스크롤 영역을 포함하도록 강제 지정
      const canvas = await (window as any).html2canvas(element, { 
        scale: 3, // 고화질 저장을 위해 스케일 업
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        // 보이는 뷰포트가 아닌 실제 요소의 전체 크기를 캡처
        width: element.scrollWidth,
        height: element.scrollHeight,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
        x: 0,
        y: 0,
        scrollX: 0,
        scrollY: 0,
        onclone: (clonedDoc: Document) => {
          const clonedEl = clonedDoc.getElementById('schedule-capture-area');
          if (clonedEl) {
            // [핵심 로직] 캡처를 방해하는 모든 상위 부모의 높이 제한과 스크롤 제한을 해제
            let current: HTMLElement | null = clonedEl;
            while (current) {
              current.style.height = 'auto';
              current.style.maxHeight = 'none';
              current.style.overflow = 'visible';
              current.style.display = 'block'; // 부모들은 block으로 풀어서 자식이 늘어나게 함
              current = current.parentElement;
            }

            // 캡처 대상 본체는 그리드 레이아웃을 유지해야 하므로 flex 재설정
            clonedEl.style.display = 'flex';
            clonedEl.style.width = `${element.scrollWidth}px`;
            clonedEl.style.height = `${element.scrollHeight}px`;

            // html2canvas는 sticky를 완벽히 지원하지 않으므로 위치를 고정(relative)으로 변환
            const stickyElements = clonedEl.querySelectorAll('.sticky');
            stickyElements.forEach((el: any) => {
              el.style.position = 'relative';
              el.style.top = '0';
              el.style.left = '0';
            });
          }
        }
      });

      // 이미지 데이터 생성 및 다운로드
      const imgData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = imgData;
      link.download = `시간표_${childName}_${viewMode === 'morning' ? '오전' : '오후'}_${new Date().toLocaleDateString()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error(e);
      alert('이미지 생성 중 오류가 발생했습니다.');
    } finally {
      setExporting(false);
    }
  };

  const handleExportExcel = () => {
    if (schedules.length === 0) return alert('내보낼 데이터가 없습니다.');
    
    const filteredSchedules = schedules.filter(s => {
      const h = parseInt(s.startTime.split(':')[0]);
      return h >= startHour;
    });

    const data = filteredSchedules.map(s => ({
      '아이 이름': childName,
      '요일': s.dayOfWeek,
      '일정': s.title,
      '시작시간': s.startTime,
      '종료시간': s.endTime,
      '카테고리': s.category,
      '설명': s.description
    }));

    const worksheet = (window as any).XLSX.utils.json_to_sheet(data);
    const workbook = (window as any).XLSX.utils.book_new();
    (window as any).XLSX.utils.book_append_sheet(workbook, worksheet, "Schedules");
    (window as any).XLSX.writeFile(workbook, `시간표_${childName}_${viewMode === 'morning' ? '오전' : '오후'}.xlsx`);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col h-screen overflow-hidden">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4 no-print flex-shrink-0">
        <div className="space-y-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
               <Sparkles size={20} className="text-indigo-500" />
               <h2 className="text-3xl font-bold text-slate-800">{childName}의 주간 시간표</h2>
            </div>
          </div>
          
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
              <button
                onClick={() => setViewMode('morning')}
                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                  viewMode === 'morning' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                오전부터 (9시~)
              </button>
              <button
                onClick={() => setViewMode('afternoon')}
                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                  viewMode === 'afternoon' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                오후부터 (13시~)
              </button>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-100 px-3 py-2 rounded-lg">
              <Info size={14} className="text-indigo-500" />
              <span>{viewMode === 'morning' ? '09:00 ~ 23:00 일정입니다.' : '13:00 ~ 23:00 일정입니다.'}</span>
            </div>

            <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm w-fit">
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
        </div>

        <div className="flex gap-3 flex-wrap">
          <button 
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg hover:bg-emerald-100 transition-colors shadow-sm font-medium"
          >
            <FileSpreadsheet size={18} />
            <span>Excel 내보내기</span>
          </button>
          <button 
            onClick={handleExportImage}
            disabled={exporting}
            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all shadow-md disabled:bg-indigo-300 font-bold"
          >
            {exporting ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
            <span>이미지 저장</span>
          </button>
        </div>
      </header>

      <div className="flex-1 min-h-0 bg-slate-100 p-2 rounded-2xl shadow-inner overflow-hidden relative">
        <ScheduleGrid schedules={schedules} schoolTimes={schoolTimes} startHour={startHour} />
      </div>
    </div>
  );
};

export default Dashboard;
