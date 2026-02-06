
export type DayOfWeek = '월' | '화' | '수' | '목' | '금' | '토' | '일';

export interface Child {
  id: string;
  name: string;
  color: string;
}

export interface SchoolTime {
  day: DayOfWeek;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  isEnabled: boolean;
}

export interface UserProfile {
  uid: string;
  email: string;
  children: Child[];
  customCategories?: string[];
  schoolTimes?: SchoolTime[]; // 월~금 수업 시간 설정
}

export interface EventTemplate {
  id: string;
  userId: string;
  childId: string;
  title: string;
  duration: number; // 분 단위
  category: string;
  description: string;
}

export interface ScheduleEvent {
  id: string;
  userId: string;
  childId: string;
  templateId: string;
  title: string;
  dayOfWeek: DayOfWeek;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  category: string;
  description: string;
}
