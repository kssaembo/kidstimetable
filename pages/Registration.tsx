
import React, { useState } from 'react';
import { EventTemplate, Child } from '../types';
import { CATEGORY_COLORS } from '../constants';
import { Save, CalendarPlus, AlignLeft, Clock, Plus, Trash2, Tag, List, Loader2, Baby } from 'lucide-react';

interface RegistrationProps {
  userId: string;
  categories: string[];
  onAddCategory: (cat: string) => void;
  onRemoveCategory: (cat: string) => void;
  onSubmit: (t: Omit<EventTemplate, 'id'>) => void;
  onDeleteTemplate: (id: string) => void;
  templates: EventTemplate[];
  children: Child[]; // App.tsx에서 전달받아야 함
}

// 부모 컴포넌트(App.tsx)에서 children을 전달하도록 인터페이스 수정 필요
// 현재 App.tsx 확인 결과 props에 children이 누락되어 있음.
// App.tsx에서도 해당 컴포넌트 호출 시 props 추가 필요.

const Registration: React.FC<RegistrationProps & { children: Child[] }> = ({ 
  userId, 
  categories, 
  onAddCategory, 
  onRemoveCategory, 
  onSubmit,
  onDeleteTemplate,
  templates,
  children
}) => {
  const [submitting, setSubmitting] = useState(false);
  const [activeChildId, setActiveChildId] = useState<string>(children[0]?.id || '');
  const [formData, setFormData] = useState({
    title: '',
    duration: 60,
    category: categories[0] || '학원',
    description: ''
  });
  const [newCatName, setNewCatName] = useState('');

  // Update default category when categories list loads
  React.useEffect(() => {
    if (categories.length > 0 && !formData.category) {
      setFormData(prev => ({ ...prev, category: categories[0] }));
    }
  }, [categories]);

  // 자녀가 바뀌면 첫 번째 자녀를 기본 선택
  React.useEffect(() => {
    if (children.length > 0 && !activeChildId) {
      setActiveChildId(children[0].id);
    }
  }, [children]);

  const handleAddCategory = () => {
    if (newCatName && !categories.includes(newCatName)) {
      onAddCategory(newCatName);
      setNewCatName('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChildId) return alert('자녀를 먼저 선택해주세요.');
    if (!formData.title) return alert('일정 명칭을 입력해주세요.');
    if (formData.duration <= 0) return alert('소요 시간은 1분 이상이어야 합니다.');

    setSubmitting(true);
    try {
      await onSubmit({
        userId,
        childId: activeChildId,
        ...formData
      });
      setFormData({ 
        title: '', 
        duration: 60, 
        category: formData.category, 
        description: '' 
      });
      alert('일정이 등록되었습니다!');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTemplates = templates.filter(t => t.childId === activeChildId);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <header className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">기본 일정(수업) 등록</h2>
        <p className="text-slate-500">자녀를 선택하고, 반복될 수업이나 활동의 이름과 소요시간을 설정하세요.</p>
      </header>

      {/* Child Selection Tabs */}
      <div className="flex gap-2 mb-8 bg-slate-100 p-1.5 rounded-2xl w-fit">
        {children.map(child => (
          <button
            key={child.id}
            onClick={() => setActiveChildId(child.id)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeChildId === child.id 
                ? 'bg-white text-indigo-600 shadow-md ring-1 ring-slate-200' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'
            }`}
          >
            <Baby size={16} />
            {child.name}
          </button>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <CalendarPlus size={16} className="text-indigo-500" />
                  일정(수업) 명칭
                </label>
                <input
                  type="text"
                  placeholder="예: 태권도, 영어회화, 빨간펜..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Clock size={16} className="text-indigo-500" />
                    소요 시간 (분 단위)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="1"
                      className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                    />
                    <span className="text-slate-500 font-medium">분</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Tag size={16} className="text-indigo-500" />
                    카테고리
                  </label>
                  <select
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                    {categories.length === 0 && <option value="기타">기타</option>}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <AlignLeft size={16} className="text-indigo-500" />
                  세부 설명 (선택)
                </label>
                <textarea
                  rows={2}
                  placeholder="장소나 준비물 등을 적어주세요."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none transition-all"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>

            <div className="bg-slate-50 p-6 flex justify-end gap-3 border-t border-slate-100">
              <button
                type="submit"
                disabled={submitting}
                className="px-8 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-md flex items-center gap-2 font-bold disabled:bg-slate-400"
              >
                {submitting ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                {children.find(c => c.id === activeChildId)?.name} 일정 추가
              </button>
            </div>
          </form>

          <div className="mt-8 bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
            <h3 className="text-sm font-bold text-indigo-700 mb-4 flex items-center gap-2">
              <Tag size={18} />
              카테고리 편집
            </h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {categories.map(cat => (
                <span key={cat} className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-indigo-200 text-indigo-700 rounded-full text-xs font-semibold">
                  {cat}
                  <button onClick={() => onRemoveCategory(cat)} className="hover:text-rose-500">
                    <Trash2 size={12} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input 
                type="text"
                placeholder="새 카테고리..."
                className="flex-1 px-4 py-2 bg-white border border-indigo-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-400 outline-none"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
              />
              <button 
                onClick={handleAddCategory}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 text-xs font-bold transition-all"
              >
                추가
              </button>
            </div>
          </div>
        </div>

        <div className="w-full md:w-80">
          <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
            <List size={20} className="text-indigo-500" />
            {children.find(c => c.id === activeChildId)?.name}의 일정
          </h3>
          <div className="space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto pr-2 custom-scrollbar">
            {filteredTemplates.length === 0 ? (
              <p className="text-slate-400 italic text-sm py-10 text-center">이 자녀의 등록된 일정이 없습니다.</p>
            ) : (
              filteredTemplates.map(t => (
                <div key={t.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm relative group">
                  <button 
                    onClick={() => onDeleteTemplate(t.id)}
                    className="absolute top-4 right-4 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                  <div className="inline-block px-2 py-0.5 rounded text-[10px] font-bold mb-2" style={{ backgroundColor: CATEGORY_COLORS[t.category] || '#E0F2FE' }}>
                    {t.category}
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm mb-1">{t.title}</h4>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock size={12} /> {t.duration}분 소요
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Registration;
