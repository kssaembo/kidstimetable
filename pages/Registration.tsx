
import React, { useState } from 'react';
import { EventTemplate, Child } from '../types';
import { CATEGORY_COLORS } from '../constants';
import { Save, CalendarPlus, AlignLeft, Clock, Trash2, Tag, List, Loader2, Baby, Pencil, RefreshCw, Info, ChevronRight, GripVertical } from 'lucide-react';

interface RegistrationProps {
  userId: string;
  categories: string[];
  onAddCategory: (cat: string) => void;
  onRemoveCategory: (cat: string) => void;
  onSubmit: (t: Omit<EventTemplate, 'id'>) => void;
  onUpdateTemplate: (id: string, updates: Partial<EventTemplate>) => void;
  onDeleteTemplate: (id: string) => void;
  templates: EventTemplate[];
  children: Child[];
}

const Registration: React.FC<RegistrationProps> = ({ 
  userId, 
  categories, 
  onAddCategory, 
  onRemoveCategory, 
  onSubmit,
  onUpdateTemplate,
  onDeleteTemplate,
  templates,
  children
}) => {
  const [submitting, setSubmitting] = useState(false);
  const [activeChildId, setActiveChildId] = useState<string>(children[0]?.id || '');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    duration: 60,
    category: categories[0] || '학원',
    description: ''
  });
  const [newCatName, setNewCatName] = useState('');

  // 툴팁 상태
  const [hoveredItem, setHoveredItem] = useState<{ title: string, description: string } | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  React.useEffect(() => {
    if (categories.length > 0 && !formData.category) {
      setFormData(prev => ({ ...prev, category: categories[0] }));
    }
  }, [categories]);

  const handleAddCategory = () => {
    if (newCatName && !categories.includes(newCatName)) {
      onAddCategory(newCatName);
      setNewCatName('');
    }
  };

  const handleEditClick = (t: EventTemplate) => {
    setEditingId(t.id);
    setFormData({
      title: t.title,
      duration: t.duration,
      category: t.category,
      description: t.description || ''
    });
    // 스크롤을 폼의 최상단으로 이동 (좌측 독립 스크롤 영역 내에서)
    const formContainer = document.getElementById('registration-form-container');
    if (formContainer) formContainer.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({
      title: '',
      duration: 60,
      category: categories[0] || '학원',
      description: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChildId) return alert('자녀를 먼저 선택해주세요.');
    if (!formData.title) return alert('일정 명칭을 입력해주세요.');
    if (formData.duration <= 0) return alert('소요 시간은 1분 이상이어야 합니다.');

    setSubmitting(true);
    try {
      if (editingId) {
        await onUpdateTemplate(editingId, { ...formData });
        alert('일정이 수정되었습니다!');
        setEditingId(null);
      } else {
        await onSubmit({ userId, childId: activeChildId, ...formData });
        alert('일정이 등록되었습니다!');
      }
      setFormData({ 
        title: '', 
        duration: 60, 
        category: formData.category, 
        description: '' 
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  const filteredTemplates = templates.filter(t => t.childId === activeChildId);
  
  // 카테고리별 그룹화
  const groupedTemplates = filteredTemplates.reduce((acc, t) => {
    if (!acc[t.category]) acc[t.category] = [];
    acc[t.category].push(t);
    return acc;
  }, {} as Record<string, EventTemplate[]>);

  return (
    <div className="p-8 h-full max-w-6xl mx-auto flex flex-col overflow-hidden relative" onMouseMove={handleMouseMove}>
      <header className="mb-8 flex-shrink-0">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">기본 일정(수업) 등록</h2>
        <p className="text-slate-500">자녀를 선택하고, 반복될 수업이나 활동의 이름과 소요시간을 설정하세요.</p>
      </header>

      <div className="flex gap-2 mb-8 bg-slate-100 p-1.5 rounded-2xl w-fit flex-shrink-0">
        {children.map(child => (
          <button
            key={child.id}
            onClick={() => {
              setActiveChildId(child.id);
              if (editingId) cancelEdit();
            }}
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

      <div className="flex-1 flex flex-col md:flex-row gap-8 min-h-0 overflow-hidden">
        {/* 좌측: 일정 입력 및 카테고리 편집 영역 */}
        <div id="registration-form-container" className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <form onSubmit={handleSubmit} className={`bg-white rounded-2xl border ${editingId ? 'border-amber-400 ring-2 ring-amber-100' : 'border-slate-200'} shadow-sm overflow-hidden transition-all`}>
            {editingId && (
              <div className="bg-amber-50 px-6 py-2 text-amber-700 text-xs font-bold flex justify-between items-center border-b border-amber-200">
                <span>일정 수정 중입니다...</span>
                <button type="button" onClick={cancelEdit} className="underline">취소하기</button>
              </div>
            )}
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <CalendarPlus size={16} className="text-indigo-500" />
                  일정(수업) 명칭
                </label>
                <input
                  type="text"
                  placeholder="예: 태권도, 영어회화, 빨간펜..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold"
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
                      className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                    />
                    <span className="text-slate-500 font-bold">분</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Tag size={16} className="text-indigo-500" />
                    카테고리
                  </label>
                  <select
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
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
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none transition-all font-medium"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>

            <div className="bg-slate-50 p-6 flex justify-end gap-3 border-t border-slate-100">
              {editingId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-6 py-3 text-slate-500 font-bold hover:bg-slate-200 rounded-xl transition-all"
                >
                  취소
                </button>
              )}
              <button
                type="submit"
                disabled={submitting}
                className={`px-8 py-3 ${editingId ? 'bg-amber-500 hover:bg-amber-600' : 'bg-indigo-600 hover:bg-indigo-700'} text-white rounded-xl transition-all shadow-md flex items-center gap-2 font-bold disabled:bg-slate-400`}
              >
                {submitting ? <Loader2 className="animate-spin" size={20} /> : (editingId ? <RefreshCw size={20} /> : <Save size={20} />)}
                {children.find(c => c.id === activeChildId)?.name} 일정 {editingId ? '수정' : '추가'}
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
                <span key={cat} className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-indigo-200 text-indigo-700 rounded-full text-xs font-bold">
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
                className="flex-1 px-4 py-2 bg-white border border-indigo-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-400 outline-none"
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

        {/* 우측: 등록된 일정 목록 영역 (독립 스크롤) */}
        <div className="w-full md:w-80 flex flex-col min-h-0">
          <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2 flex-shrink-0">
            <List size={20} className="text-indigo-500" />
            {children.find(c => c.id === activeChildId)?.name}의 일정 목록
          </h3>
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6">
            {filteredTemplates.length === 0 ? (
              <p className="text-slate-400 italic text-sm py-10 text-center">등록된 일정이 없습니다.</p>
            ) : (
              Object.entries(groupedTemplates).map(([category, items]) => (
                <div key={category} className="space-y-2">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <ChevronRight size={10} />
                    {category}
                  </h4>
                  <div className="grid gap-2">
                    {(items as EventTemplate[]).map(t => (
                      <div 
                        key={t.id} 
                        className={`bg-white p-4 rounded-2xl border ${editingId === t.id ? 'border-amber-400 shadow-md ring-2 ring-amber-50' : 'border-slate-200'} shadow-sm relative group transition-all border-l-4`}
                        style={{ borderLeftColor: CATEGORY_COLORS[t.category] || '#cbd5e1' }}
                        onMouseEnter={() => {
                          if (t.description) {
                            setHoveredItem({ title: t.title, description: t.description });
                          }
                        }}
                        onMouseLeave={() => setHoveredItem(null)}
                      >
                        <div className="absolute top-4 right-4 flex gap-2">
                          <button onClick={() => handleEditClick(t)} className="text-slate-300 hover:text-indigo-500 opacity-0 group-hover:opacity-100 transition-all"><Pencil size={14} /></button>
                          <button onClick={() => onDeleteTemplate(t.id)} className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={14} /></button>
                        </div>
                        <h4 className="font-bold text-slate-800 text-xs mb-1 pr-10">{t.title}</h4>
                        <p className="text-[10px] text-slate-500 flex items-center gap-1 font-bold">
                          <Clock size={10} /> {t.duration}분 소요
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 팔로우 툴팁 */}
      {hoveredItem && (
        <div 
          className="fixed pointer-events-none z-[9999] bg-slate-800 text-white p-3 rounded-xl shadow-2xl border border-slate-700 backdrop-blur-md w-56 transition-opacity duration-150"
          style={{ 
            left: mousePos.x + 20, 
            top: mousePos.y + 10,
            opacity: hoveredItem ? 1 : 0
          }}
        >
          <div className="font-extrabold mb-1.5 pb-1 border-b border-slate-600 flex items-center gap-1.5 text-indigo-300 text-xs">
            <Info size={14} />
            세부 설명
          </div>
          <div className="text-[11px] leading-relaxed opacity-90 whitespace-pre-wrap font-medium">
            {hoveredItem.description}
          </div>
        </div>
      )}
    </div>
  );
};

export default Registration;
