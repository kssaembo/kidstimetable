
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

  const handleExportPDF = async () => {
    // ScheduleGrid 내부에 전체 높이를 가진 ID가 'schedule-capture-area'인 엘리먼트를 타겟팅합니다.
    const element = document.getElementById('schedule-capture-area');
    if (!element) return;
    
    setExporting(true);
    try {
      const { jsPDF } = (window as any).jspdf;
      
      // html2canvas 옵션 설정: 전체 스크롤 영역을 온전히 캡처하기 위해 
      // width/height를 엘리먼트의 실제 scroll 크기로 고정합니다.
      const canvas = await (window as any).html2canvas(element, { 
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: element.scrollWidth,
        height: element.scrollHeight,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
        scrollX: 0,
        scrollY: 0,
        x: 0,
        y: 0,
        onclone: (clonedDoc: Document) => {
          // 복제된 문서의 엘리먼트가 캡처 시 가려지지 않도록 보장
          const clonedElement = clonedDoc.getElementById('schedule-capture-area');
          if (clonedElement) {
            clonedElement.style.height = `${element.scrollHeight}px`;
            clonedElement.style.overflow = 'visible';
          }
        }
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('l', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`시간표_${childName}_${viewMode === 'morning' ? '오전' : '오후'}_${new Date().toLocaleDateString()}.pdf`);
    } catch (e) {
      console.error(e);
      alert('PDF 생성 중 오류가 발생했습니다.');
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
                오전부터
              </button>
              <button
                onClick={() => setViewMode('afternoon')}
                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                  viewMode === 'afternoon' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                오후부터
              </button>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-100 px-3 py-2 rounded-lg">
              <Info size={14} className="text-indigo-500" />
              <span>{viewMode === 'morning' ? '9시부터 시작하는 오전 시간표입니다.' : '13시부터 시작하는 오후 시간표입니다.'}</span>
            </div>

            {/* 자녀 선택 탭 */}
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
            <span>XLSX 내보내기</span>
          </button>
          <button 
            onClick={handleExportPDF}
            disabled={exporting}
            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all shadow-md disabled:bg-indigo-300 font-bold"
          >
            {exporting ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
            <span>PDF 저장</span>
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
