
import React from 'react';
import { LayoutDashboard, CalendarClock, PlusCircle, Settings } from 'lucide-react';

export const DAYS: ('월' | '화' | '수' | '목' | '금' | '토' | '일')[] = ['월', '화', '수', '목', '금', '토', '일'];

export const CATEGORY_COLORS: Record<string, string> = {
  '학원': '#E0F2FE', // Blue
  '공부': '#FEF3C7', // Amber
  '놀이': '#DCFCE7', // Green
  '운동': '#FEE2E2', // Red
  '기타': '#F3F4F6', // Gray
};

export const MENU_ITEMS = [
  { id: 'dashboard', label: '시간표', icon: <LayoutDashboard size={20} /> },
  { id: 'assignment', label: '시간 배정', icon: <CalendarClock size={20} /> },
  { id: 'registration', label: '일정 등록', icon: <PlusCircle size={20} /> },
  { id: 'settings', label: '설정', icon: <Settings size={20} /> },
];

export const MORNING_START = 9;
export const AFTERNOON_START = 13;
export const END_HOUR = 22;   // 10 PM
export const SLOT_MINUTES = 10;
export const PIXELS_PER_HOUR = 120; // Scale
export const PIXELS_PER_MINUTE = PIXELS_PER_HOUR / 60;
