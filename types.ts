
export type DayOfWeek = '월' | '화' | '수' | '목' | '금' | '토' | '일';

export interface Child {
  id: string;
  name: string;
  color: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  children: Child[];
  customCategories?: string[];
}

export interface EventTemplate {
  id: string;
  userId: string;
  childId: string; // 자녀별 일정 관리를 위해 추가
  title: string;
  duration: number; // 분 단위
  category: string;
  description: string;
}

export interface ScheduleEvent {
  id: string;
  userId: string;
  childId: string;
  templateId: string; // 참조용
  title: string;
  dayOfWeek: DayOfWeek;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  category: string;
  description: string;
}
