
import React, { useState } from 'react';
import { UserProfile, Child } from '../types';
import { UserPlus, UserMinus, UserCheck, Baby, Heart } from 'lucide-react';

interface SettingsPageProps {
  user: UserProfile;
  onAddChild: (name: string) => void;
  onRemoveChild: (id: string) => void;
  selectedChildId: string | null;
  onSelectChild: (id: string) => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ 
  user, 
  onAddChild, 
  onRemoveChild, 
  selectedChildId, 
  onSelectChild 
}) => {
  const [newChildName, setNewChildName] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newChildName.trim()) {
      onAddChild(newChildName);
      setNewChildName('');
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <header className="mb-12">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">설정 및 자녀 관리</h2>
        <p className="text-slate-500">자녀 프로필을 추가하고, 현재 관리할 자녀를 선택하세요.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Child Selection */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-700 flex items-center gap-2">
            <Baby className="text-indigo-500" size={20} />
            자녀 목록
          </h3>
          <div className="space-y-3">
            {user.children.map(child => (
              <div 
                key={child.id}
                onClick={() => onSelectChild(child.id)}
                className={`group flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                  selectedChildId === child.id 
                    ? 'border-indigo-600 bg-indigo-50' 
                    : 'border-slate-100 bg-white hover:border-indigo-200 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center border-2 border-indigo-100 text-indigo-500 shadow-sm">
                    {selectedChildId === child.id ? <UserCheck size={24} /> : <Heart size={20} />}
                  </div>
                  <div>
                    <h4 className={`font-bold ${selectedChildId === child.id ? 'text-indigo-700' : 'text-slate-700'}`}>
                      {child.name}
                    </h4>
                    <p className="text-xs text-slate-400">자녀 프로필</p>
                  </div>
                </div>
                
                {user.children.length > 1 && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveChild(child.id);
                    }}
                    className="p-2 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <UserMinus size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Add Child Form */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-700 flex items-center gap-2">
            <UserPlus className="text-emerald-500" size={20} />
            자녀 추가하기
          </h3>
          <form onSubmit={handleAdd} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">이름 또는 별칭</label>
              <input
                type="text"
                placeholder="예: 김우리, 귀염둥이..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                value={newChildName}
                onChange={(e) => setNewChildName(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all shadow-md font-bold flex items-center justify-center gap-2"
            >
              <UserPlus size={20} />
              새로운 자녀 등록
            </button>
            <p className="text-[10px] text-slate-400 text-center leading-relaxed">
              자녀를 추가하면 해당 자녀만을 위한 별도의 시간표와 일정 리스트가 생성됩니다.
            </p>
          </form>
        </section>
      </div>

      <div className="mt-12 p-6 bg-slate-100 rounded-2xl text-slate-500 text-sm">
        <h4 className="font-bold mb-2">ℹ️ 도움말</h4>
        <p className="leading-relaxed">
          - 현재 선택된 자녀는 상단 표시와 사이드바 메뉴 진입 시 활성화됩니다.<br/>
          - 자녀 삭제 시 해당 자녀의 모든 일정이 함께 관리 대상에서 제외됩니다.
        </p>
      </div>
    </div>
  );
};

export default SettingsPage;
