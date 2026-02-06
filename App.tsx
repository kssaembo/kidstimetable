
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Assignment from './pages/Assignment';
import Registration from './pages/Registration';
import SettingsPage from './pages/SettingsPage';
import Login from './pages/Login';
import PublicView from './pages/PublicView';
import { UserProfile, Child, ScheduleEvent, EventTemplate, SchoolTime } from './types';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { 
  doc, 
  onSnapshot, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  addDoc, 
  deleteDoc,
  getDoc,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [schedules, setSchedules] = useState<ScheduleEvent[]>([]);
  const [templates, setTemplates] = useState<EventTemplate[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userSnap = await getDoc(userDocRef);
          
          if (!userSnap.exists()) {
            const initialSchoolTimes: SchoolTime[] = ['월', '화', '수', '목', '금'].map(day => ({
              day: day as any,
              startTime: '09:00',
              endTime: '13:00',
              isEnabled: true
            }));

            await setDoc(userDocRef, {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              children: [{ id: 'child1', name: '김우리', color: '#818cf8' }],
              customCategories: ['학원', '공부', '놀이', '운동', '기타'],
              schoolTimes: initialSchoolTimes
            });
          }

          const unsubUser = onSnapshot(userDocRef, (doc) => {
            if (doc.exists()) {
              const userData = doc.data() as UserProfile;
              setUser(userData);
              if (!selectedChildId && userData.children.length > 0) {
                setSelectedChildId(userData.children[0].id);
              }
            }
          });

          const tq = query(collection(db, 'eventTemplates'), where('userId', '==', firebaseUser.uid));
          const unsubTemplates = onSnapshot(tq, (snapshot) => {
            const fetched: EventTemplate[] = [];
            snapshot.forEach((doc) => fetched.push({ id: doc.id, ...doc.data() } as EventTemplate));
            setTemplates(fetched);
          });

          const sq = query(collection(db, 'schedules'), where('userId', '==', firebaseUser.uid));
          const unsubSchedules = onSnapshot(sq, (snapshot) => {
            const fetched: ScheduleEvent[] = [];
            snapshot.forEach((doc) => fetched.push({ id: doc.id, ...doc.data() } as ScheduleEvent));
            setSchedules(fetched);
          });

          setLoading(false);
          return () => {
            unsubUser();
            unsubTemplates();
            unsubSchedules();
          };
        } catch (error) {
          console.error("Data initialization error:", error);
          setLoading(false);
        }
      } else {
        setUser(null);
        setSchedules([]);
        setTemplates([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [selectedChildId]);

  const logout = () => signOut(auth);

  const wrapAction = async (action: () => Promise<any>, successMsg?: string) => {
    try {
      await action();
      if (successMsg) console.log(successMsg);
    } catch (e: any) {
      console.error("Firestore Action Error:", e);
      if (e.code === 'permission-denied') {
        alert("권한이 없습니다. Firebase Console의 Rules 설정을 확인해주세요.");
      } else {
        alert("오류가 발생했습니다: " + e.message);
      }
    }
  };

  const addCategory = (cat: string) => user && wrapAction(() => updateDoc(doc(db, 'users', user.uid), { customCategories: arrayUnion(cat) }));
  const removeCategory = (cat: string) => user && wrapAction(() => updateDoc(doc(db, 'users', user.uid), { customCategories: arrayRemove(cat) }));
  
  const addTemplate = (t: Omit<EventTemplate, 'id'>) => wrapAction(() => addDoc(collection(db, 'eventTemplates'), t));
  const updateTemplate = (id: string, updates: Partial<EventTemplate>) => wrapAction(() => updateDoc(doc(db, 'eventTemplates', id), updates));
  const deleteTemplate = (id: string) => wrapAction(() => deleteDoc(doc(db, 'eventTemplates', id)));

  const addSchedule = (s: Omit<ScheduleEvent, 'id'>) => wrapAction(() => addDoc(collection(db, 'schedules'), s));
  const deleteSchedule = (id: string) => wrapAction(() => deleteDoc(doc(db, 'schedules', id)));
  const updateSchedule = (id: string, updates: Partial<ScheduleEvent>) => wrapAction(() => updateDoc(doc(db, 'schedules', id), updates));

  const updateSchoolTimes = (times: SchoolTime[]) => user && wrapAction(() => updateDoc(doc(db, 'users', user.uid), { schoolTimes: times }));

  if (loading) return <div className="h-screen flex items-center justify-center text-indigo-500 font-bold">로딩 중...</div>;

  if (!user) {
    return (
      <HashRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/shared/:shareId" element={<PublicView />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </HashRouter>
    );
  }

  const selectedChild = user.children.find(c => c.id === selectedChildId) || user.children[0];

  return (
    <HashRouter>
      <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-800">
        <Sidebar user={user} onLogout={logout} />
        <main className="flex-1 overflow-auto relative">
          <Routes>
            <Route path="/dashboard" element={
              <Dashboard 
                schedules={schedules.filter(s => s.childId === selectedChildId)} 
                childName={selectedChild?.name || ''}
                schoolTimes={user.schoolTimes || []}
              />
            } />
            <Route path="/assignment" element={
              <Assignment 
                schedules={schedules.filter(s => s.childId === selectedChildId)} 
                templates={templates}
                children={user.children}
                activeChildId={selectedChildId || ''}
                setActiveChildId={setSelectedChildId}
                addSchedule={addSchedule}
                updateSchedule={updateSchedule}
                deleteSchedule={deleteSchedule}
                schoolTimes={user.schoolTimes || []}
              />
            } />
            <Route path="/registration" element={
              <Registration 
                userId={user.uid} 
                categories={user.customCategories || []}
                onAddCategory={addCategory}
                onRemoveCategory={removeCategory}
                onSubmit={addTemplate}
                onUpdateTemplate={updateTemplate}
                onDeleteTemplate={deleteTemplate}
                templates={templates}
                children={user.children}
              />
            } />
            <Route path="/settings" element={
              <SettingsPage 
                user={user} 
                onAddChild={(name) => wrapAction(() => updateDoc(doc(db, 'users', user.uid), { children: arrayUnion({id: `c${Date.now()}`, name, color: '#818cf8'}) }))} 
                onRemoveChild={(id) => wrapAction(() => updateDoc(doc(db, 'users', user.uid), { children: user.children.filter(c => c.id !== id) }))}
                selectedChildId={selectedChildId}
                onSelectChild={setSelectedChildId}
                onUpdateSchoolTimes={updateSchoolTimes}
              />
            } />
            <Route path="/shared/:shareId" element={<PublicView />} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
};

export default App;
