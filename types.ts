
export type DayOfWeek = '월' | '화' | '수' | '목' | '금' | '토' | '일';

export interface Child {
  id: string;
  name: string;
  color: string;
  schoolTimes?: SchoolTime[]; // 자녀별 개별 수업 시간
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
  schoolTimes?: SchoolTime[]; // (하위 호환성을 위해 유지하거나 제거 가능, 여기서는 Child 내부로 이동)
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
