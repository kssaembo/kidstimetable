
import React from 'react';
import ScheduleGrid from '../components/ScheduleGrid';
import { ScheduleEvent, SchoolTime } from '../types';
import { Download, FileSpreadsheet, Loader2, Sparkles } from 'lucide-react';

interface DashboardProps {
  schedules: ScheduleEvent[];
  childName: string;
  schoolTimes: SchoolTime[];
}

const Dashboard: React.FC<DashboardProps> = ({ schedules, childName, schoolTimes }) => {
  const [exporting, setExporting] = React.useState(false);

  const handleExportPDF = async () => {
    const element = document.getElementById('schedule-capture-area');
    if (!element) return;
    
    setExporting(true);
    try {
      const { jsPDF } = (window as any).jspdf;
      const canvas = await (window as any).html2canvas(element, { 
        scale: 2,
        useCORS: true,
        logging: false
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('l', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`시간표_${childName}_${new Date().toLocaleDateString()}.pdf`);
    } catch (e) {
      console.error(e);
      alert('PDF 생성 중 오류가 발생했습니다.');
    } finally {
      setExporting(false);
    }
  };

  const handleExportExcel = () => {
    if (schedules.length === 0) return alert('내보낼 데이터가 없습니다.');
    
    const data = schedules.map(s => ({
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
    (window as any).XLSX.writeFile(workbook, `시간표_${childName}.xlsx`);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col h-screen overflow-hidden">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4 no-print flex-shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <Sparkles size={20} className="text-indigo-500" />
             <h2 className="text-3xl font-bold text-slate-800">{childName || '아이'}의 주간 시간표</h2>
          </div>
          <p className="text-slate-500">전체 시간표를 아래로 스크롤하여 확인하세요 (22:00까지)</p>
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

      {/* 가장 큰 영역의 박스 테두리는 삭제 */}
      <div className="flex-1 min-h-0 bg-slate-100 p-2 rounded-2xl shadow-inner overflow-hidden relative">
        <ScheduleGrid schedules={schedules} schoolTimes={schoolTimes} />
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 no-print flex-shrink-0">
        <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
           <p className="text-xs text-indigo-600 leading-relaxed font-medium">
             💡 팁: 학교 수업 시간은 설정 탭에서 관리 가능하며, 해당 시간에는 다른 일정을 배정할 수 없습니다.
           </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
