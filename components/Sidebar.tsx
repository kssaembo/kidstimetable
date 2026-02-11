
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { MENU_ITEMS } from '../constants';
import { UserProfile } from '../types';
import { LogOut, Sparkles, BookOpen, X, Info, Mail } from 'lucide-react';

interface SidebarProps {
  user: UserProfile;
  onLogout: () => void;
}

const Modal = ({ isOpen, onClose, title, children, icon: Icon, colorClass }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl max-h-[85vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        <header className={`px-6 py-5 flex items-center justify-between border-b border-slate-100 ${colorClass}`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl text-white">
              <Icon size={22} />
            </div>
            <h2 className="text-xl font-bold text-white">{title}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full text-white transition-colors">
            <X size={24} />
          </button>
        </header>
        <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-white text-slate-600 leading-relaxed text-sm">
          {children}
        </div>
        <footer className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700 transition-all"
          >
            확인
          </button>
        </footer>
      </div>
    </div>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [showGuide, setShowGuide] = useState(false);

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-full shadow-sm z-50">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <div className="bg-indigo-500 p-2 rounded-xl text-white">
            <Sparkles size={24} />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Kids-Time
          </h1>
        </div>

        <nav className="space-y-1">
          {MENU_ITEMS.map((item) => (
            <NavLink
              key={item.id}
              to={`/${item.id}`}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 font-medium'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-4 border-t border-slate-100">
        <button
          onClick={() => setShowGuide(true)}
          className="flex w-full items-center gap-3 px-4 py-3 mb-4 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl transition-all duration-200 font-extrabold text-sm border border-indigo-100 shadow-sm"
        >
          <BookOpen size={18} />
          <span>사용 가이드</span>
        </button>

        <div className="px-4 py-2 mb-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">사용자</p>
          <p className="text-sm text-slate-700 truncate font-medium">{user.email}</p>
        </div>
        <button
          onClick={() => {
            onLogout();
            navigate('/login');
          }}
          className="flex w-full items-center gap-3 px-4 py-3 text-slate-500 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-colors duration-200"
        >
          <LogOut size={20} />
          <span>로그아웃</span>
        </button>
      </div>

      {/* 사용 가이드 모달 */}
      <Modal isOpen={showGuide} onClose={() => setShowGuide(false)} title="Kids-Time-Table 스마트 활용 가이드" icon={BookOpen} colorClass="bg-purple-600">
        <div className="space-y-8">
          <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100 flex items-start gap-3">
            <Sparkles className="text-purple-600 flex-shrink-0 mt-1" size={18} />
            <p className="text-purple-900 font-bold">안녕하세요! 아이들의 소중한 시간을 함께 관리하는 Kids-Time-Table입니다. 서비스를 더욱 똑똑하게 활용할 수 있는 5가지 꿀팁을 전해드립니다.</p>
          </div>

          <div className="space-y-6">
            <section className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 flex-shrink-0">1</div>
              <div>
                <h4 className="font-extrabold text-slate-900 flex items-center gap-2 mb-1">🛡️ 자녀의 이름은 '별명'으로 등록하세요</h4>
                <p>소중한 개인정보 보호를 위해 '첫째', '쑥쑥이' 등 가족만 알아볼 수 있는 별명을 사용해 보세요. 정보 노출 걱정은 덜고 친근함은 더할 수 있습니다.</p>
              </div>
            </section>

            <section className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 flex-shrink-0">2</div>
              <div>
                <h4 className="font-extrabold text-slate-900 flex items-center gap-2 mb-1">💡 상세 설명은 구체적일수록 좋아요</h4>
                <p>[일정 등록] 시 상세 설명란에 "축구화 지참", "셔틀 10분 전 도착" 등을 적어두세요. [시간 배정] 탭에서 일정 위로 마우스를 올리면 툴팁으로 바로 나타납니다.</p>
              </div>
            </section>

            <section className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 flex-shrink-0">3</div>
              <div>
                <h4 className="font-extrabold text-slate-900 flex items-center gap-2 mb-1">📧 이메일 가입, '데이터 보호'를 위한 장치입니다</h4>
                <p>비밀번호를 잊어버리셨을 때 안전하게 재발급해 드리기 위한 유일한 수단입니다. 소중한 데이터를 잃어버리지 않도록 꼭 사용하는 이메일로 등록해 주세요.</p>
              </div>
            </section>

            <section className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 flex-shrink-0">4</div>
              <div>
                <h4 className="font-extrabold text-slate-900 flex items-center gap-2 mb-1">☀️ 오전/오후 뷰를 자유롭게 전환해 보세요</h4>
                <p>오전/오후 뷰 전환은 '보여주는 창'을 옮기는 것일 뿐 데이터는 그대로 유지됩니다. 평일엔 오후 뷰를, 주말엔 오전 뷰를 활용해 화면을 넓게 써보세요.</p>
              </div>
            </section>

            <section className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 flex-shrink-0">5</div>
              <div>
                <h4 className="font-extrabold text-slate-900 flex items-center gap-2 mb-1">🌈 카테고리를 세분화하면 '찾기'가 쉬워집니다</h4>
                <p>[학원], [운동], [자유시간] 등으로 카테고리를 미리 분류해 두세요. 색상별로 구분된 일정들이 여러분의 드래그 앤 드롭을 한결 즐겁게 만들어 줄 것입니다.</p>
              </div>
            </section>
          </div>

          <div className="pt-6 border-t border-slate-100 text-center space-y-2">
            <p className="font-bold text-slate-800">여러분의 목소리를 들려주세요!</p>
            <p className="text-xs text-slate-500 flex items-center justify-center gap-2">
              <Mail size={12} /> sinjoppo@naver.com
            </p>
          </div>
        </div>
      </Modal>
    </aside>
  );
};

export default Sidebar;
