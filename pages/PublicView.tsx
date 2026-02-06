
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ScheduleGrid from '../components/ScheduleGrid';
import { ScheduleEvent } from '../types';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Sparkles, ExternalLink, Loader2 } from 'lucide-react';

const PublicView: React.FC = () => {
  const { shareId } = useParams(); // shareId will be the userId_childId combo
  const [schedules, setSchedules] = useState<ScheduleEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSharedSchedules = async () => {
      if (!shareId) return;
      try {
        // Simple logic: shareId is "userId_childId"
        const [userId, childId] = shareId.split('_');
        const q = query(
          collection(db, 'schedules'), 
          where('userId', '==', userId),
          where('childId', '==', childId)
        );
        const snap = await getDocs(q);
        const data: ScheduleEvent[] = [];
        snap.forEach(doc => data.push({ id: doc.id, ...doc.data() } as ScheduleEvent));
        setSchedules(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchSharedSchedules();
  }, [shareId]);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-xl text-white">
              <Sparkles size={24} />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Kids-Time-Table</h1>
          </div>
          
          <div className="bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm text-sm text-slate-500 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            공유된 시간표 뷰어
          </div>
        </header>

        <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-200 mb-8">
           <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-800">우리아이 주간 시간표</h2>
              <p className="text-slate-500 text-sm">등록된 아이의 전체 주간 일정을 확인하실 수 있습니다.</p>
           </div>
           
           {loading ? (
             <div className="h-96 flex items-center justify-center">
               <Loader2 className="animate-spin text-indigo-500" size={48} />
             </div>
           ) : schedules.length > 0 ? (
             <ScheduleGrid schedules={schedules} />
           ) : (
             <div className="h-96 flex items-center justify-center text-slate-400 italic">
               일정이 없거나 유효하지 않은 링크입니다.
             </div>
           )}
        </div>

        <div className="text-center">
          <p className="text-slate-400 text-sm mb-4">직접 시간표를 만들고 싶으신가요?</p>
          <Link 
            to="/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-100 text-indigo-700 rounded-xl hover:bg-indigo-200 transition-colors font-semibold"
          >
            나만의 시간표 만들기
            <ExternalLink size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PublicView;
