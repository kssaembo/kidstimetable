
import React, { useState, useEffect } from 'react';
import { UserProfile, Child, SchoolTime } from '../types';
import { UserPlus, UserMinus, UserCheck, Baby, Heart, Clock, GraduationCap } from 'lucide-react';

interface SettingsPageProps {
  user: UserProfile;
  onAddChild: (name: string) => void;
  onRemoveChild: (id: string) => void;
  selectedChildId: string | null;
  onSelectChild: (id: string) => void;
  onUpdateSchoolTimes: (times: SchoolTime[]) => void;
}

const HOURS = [12, 13, 14, 15, 16, 17];
const MINUTES = ['00', '10', '20', '30', '40', '50'];

const SettingsPage: React.FC<SettingsPageProps> = ({ 
  user, 
  onAddChild, 
  onRemoveChild, 
  selectedChildId, 
  onSelectChild,
  onUpdateSchoolTimes
}) => {
  const [newChildName, setNewChildName] = useState('');
  
  // 초기 상태를 props에서 가져오되, 없을 경우 월~금 기본 데이터 생성
  const [schoolTimes, setSchoolTimes] = useState<SchoolTime[]>(() => {
    if (user.schoolTimes && user.schoolTimes.length > 0) {
      return user.schoolTimes;
    }
    return ['월', '화', '수', '목', '금'].map(day => ({
      day: day as any,
      startTime: '12:00',
      endTime: '13:00',
      isEnabled: true
    }));
  });

  // 외부(Firebase) 데이터 업데이트 시 로컬 상태 동기화
  useEffect(() => {
    if (user.schoolTimes && user.schoolTimes.length > 0) {
      setSchoolTimes(user.schoolTimes);
    }
  }, [user.schoolTimes]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newChildName.trim()) {
      onAddChild(newChildName);
      setNewChildName('');
    }
  };

  const handleSchoolTimeChange = (day: string, field: 'startTime' | 'endTime' | 'isEnabled', value: any) => {
    setSchoolTimes(prev => {
      const exists = prev.find(st => st.day === day);
      if (exists) {
        return prev.map(st => st.day === day ? { ...st, [field]: value } : st);
      } else {
        const newEntry: SchoolTime = {
          day: day as any,
          startTime: '12:00',
          endTime: '13:00',
          isEnabled: true,
          [field]: value
        };
        return [...prev, newEntry];
      }
    });
  };

  const saveSchoolTimes = () => {
    // 유효성 체크 (시작 < 종료)
    for (const st of schoolTimes) {
      if (st.isEnabled) {
        const startVal = parseInt((st.startTime || "00:00").replace(':', ''));
        const endVal = parseInt((st.endTime || "00:00").replace(':', ''));
        if (startVal >= endVal) {
          alert(`${st.day}요일의 종료 시간은 시작 시간보다 늦어야 합니다.`);
          return;
        }
      }
    }
    
    // 부모 컴포넌트의 업데이트 함수 호출 (Firebase 반영)
    onUpdateSchoolTimes(schoolTimes);
    // 요청사항: '정규 수업 시간이 등록되었습니다.' 안내메시지
    alert('정규 수업 시간이 등록되었습니다.');
  };

  const TimeSelector = ({ value, onChange }: { value: string, onChange: (v: string) => void }) => {
    const parts = (value || "12:00").split(':');
    const h = parts[0] || "12";
    const m = parts[1] || "00";
    
    return (
      <div className="flex items-center gap-1">
        <select 
          value={parseInt(h)} 
          onChange={(e) => onChange(`${e.target.value.padStart(2, '0')}:${m}`)}
          className="bg-white border-2 border-slate-300 rounded px-1 py-1 text-xs font-bold focus:ring-1 focus:ring-indigo-400 outline-none cursor-pointer"
        >
          {HOURS.map(hour => <option key={hour} value={hour}>{hour}시</option>)}
        </select>
        <select 
          value={m} 
          onChange={(e) => onChange(`${h}:${e.target.value}`)}
          className="bg-white border-2 border-slate-300 rounded px-1 py-1 text-xs font-bold focus:ring-1 focus:ring-indigo-400 outline-none cursor-pointer"
        >
          {MINUTES.map(min => <option key={min} value={min}>{min}분</option>)}
        </select>
      </div>
    );
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-12">
      <header>
        <h2 className="text-3xl font-bold text-slate-800 mb-2">설정 및 자녀 관리</h2>
        <p className="text-slate-500">자녀 프로필을 관리하고 공통 수업 시간을 설정하세요.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="space-y-4">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Baby className="text-indigo-600" size={20} />
            자녀 목록
          </h3>
          <div className="space-y-3">
            {user.children.map(child => (
              <div 
                key={child.id}
                onClick={() => onSelectChild(child.id)}
                className={`group flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                  selectedChildId === child.id 
                    ? 'border-indigo-600 bg-indigo-50 shadow-md' 
                    : 'border-slate-300 bg-white hover:border-indigo-400 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center border-2 border-indigo-200 text-indigo-600 shadow-sm font-bold">
                    {selectedChildId === child.id ? <UserCheck size={24} /> : <Heart size={20} />}
                  </div>
                  <div>
                    <h4 className={`font-extrabold ${selectedChildId === child.id ? 'text-indigo-800' : 'text-slate-800'}`}>
                      {child.name}
                    </h4>
                    <p className="text-xs text-slate-500 font-bold">자녀 프로필</p>
                  </div>
                </div>
                
                {user.children.length > 1 && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveChild(child.id);
                    }}
                    className="p-2 text-slate-400 hover:text-rose-600 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <UserMinus size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-8">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
              <UserPlus className="text-emerald-600" size={20} />
              자녀 추가하기
            </h3>
            <form onSubmit={handleAdd} className="bg-white p-6 rounded-2xl border-2 border-slate-300 shadow-sm space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">이름 또는 별칭</label>
                <input
                  type="text"
                  placeholder="예: 김우리, 귀염둥이..."
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all font-bold placeholder:text-slate-400"
                  value={newChildName}
                  onChange={(e) => setNewChildName(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all shadow-md font-extrabold flex items-center justify-center gap-2"
              >
                <UserPlus size={20} />
                새로운 자녀 등록
              </button>
            </form>
          </div>
        </section>

        {/* 수업 시간 등록 섹션 */}
        <section className="bg-white p-8 rounded-3xl border-2 border-slate-400 shadow-md space-y-6 h-fit">
          <div className="flex justify-between items-center border-b-2 border-slate-100 pb-4">
            <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <GraduationCap className="text-indigo-700" size={24} />
              정규 수업 시간 등록
            </h3>
            <button 
              onClick={saveSchoolTimes}
              className="px-5 py-2 bg-indigo-700 text-white rounded-xl text-sm font-extrabold shadow-lg hover:bg-indigo-800 transition-all active:scale-95"
            >
              설정 저장
            </button>
          </div>
          
          <p className="text-xs text-slate-600 leading-relaxed font-extrabold bg-slate-50 p-3 rounded-lg border-l-4 border-indigo-600">
            월~금요일 사이의 정규 수업 시간을 설정하세요. <br/>
            이 시간에는 다른 일정을 배정할 수 없습니다. (12시~17시 설정 가능)
          </p>

          <div className="space-y-4 mt-4">
            {['월', '화', '수', '목', '금'].map(day => {
              const st = schoolTimes.find(s => s.day === day) || { day, startTime: '12:00', endTime: '13:00', isEnabled: true };
              return (
                <div key={day} className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all ${st.isEnabled ? 'border-indigo-300 bg-indigo-50/70 shadow-inner' : 'border-slate-200 opacity-60 bg-slate-100'}`}>
                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      checked={st.isEnabled}
                      onChange={(e) => handleSchoolTimeChange(day, 'isEnabled', e.target.checked)}
                      className="w-5 h-5 rounded text-indigo-700 cursor-pointer border-2 border-slate-400"
                    />
                    <span className="font-extrabold text-slate-900 w-5 text-sm">{day}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <TimeSelector 
                      value={st.startTime} 
                      onChange={(v) => handleSchoolTimeChange(day, 'startTime', v)} 
                    />
                    <span className="text-slate-600 font-extrabold text-xs mx-1">~</span>
                    <TimeSelector 
                      value={st.endTime} 
                      onChange={(v) => handleSchoolTimeChange(day, 'endTime', v)} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <div className="mt-12 p-6 bg-slate-200 rounded-2xl text-slate-800 text-sm border-2 border-slate-400 shadow-sm">
        <h4 className="font-extrabold mb-2 flex items-center gap-1">ℹ️ 설정 가이드</h4>
        <ul className="list-disc list-inside space-y-1 leading-relaxed font-bold">
          <li>수업 시간은 전체 자녀 계정에 공통으로 적용되는 차단 영역입니다.</li>
          <li>10분 단위로 설정이 가능하며, 겹치는 일정 배정을 시스템이 자동으로 방지합니다.</li>
          <li>설정한 시간은 시간표(대시보드)와 배정 화면에서 빗금 패턴으로 명확히 표시됩니다.</li>
        </ul>
      </div>
    </div>
  );
};

export default SettingsPage;
