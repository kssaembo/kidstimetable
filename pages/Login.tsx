
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Mail, Lock, ArrowRight, AlertCircle, CheckCircle2, X, Scale, ShieldCheck, BookOpen, ChevronRight, Info, Clock } from 'lucide-react';
import { auth } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail 
} from 'firebase/auth';

const Modal = ({ isOpen, onClose, title, children, icon: Icon, colorClass }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
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
        <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-white">
          <div className="prose prose-slate max-w-none">
            {children}
          </div>
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

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // 모달 상태
  const [activeModal, setActiveModal] = useState<'tos' | 'privacy' | 'guide' | null>(null);

  const getErrorMessage = (error: any) => {
    const errorCode = error.code || '';
    switch (errorCode) {
      case 'auth/email-already-in-use': return '이미 사용 중인 이메일입니다.';
      case 'auth/weak-password': return '비밀번호가 너무 취약합니다. (최소 6자 이상)';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential': return '비밀번호나 이메일 주소를 다시 확인해 주세요.';
      case 'auth/too-many-requests': return '잠시 후 다시 시도해주세요.';
      default: return `오류가 발생했습니다: ${error.message || '알 수 없는 오류'}`;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);
    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email, password);
        alert('회원가입이 완료되었습니다!');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (error: any) {
      setErrorMsg(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) { setErrorMsg('이메일을 먼저 입력해주세요.'); return; }
    try {
      await sendPasswordResetEmail(auth, email);
      alert('비밀번호 복구 링크가 발송되었습니다.');
    } catch (error: any) {
      setErrorMsg(getErrorMessage(error));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-200 mb-6">
            <span className="text-white"><Sparkles size={32} /></span>
          </div>
          <h1 className="text-3xl font-bold text-slate-800">Kids-Time-Table</h1>
          <p className="text-slate-500 mt-2 font-medium">아이들의 방과 후 일정을 똑똑하게 관리하세요</p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Mail size={16} className="text-indigo-400" />
                이메일 주소
              </label>
              <input
                type="email"
                required
                placeholder="name@example.com"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-medium"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Lock size={16} className="text-indigo-400" />
                  비밀번호
                </label>
                {!isRegister && (
                  <button type="button" onClick={handleResetPassword} className="text-xs text-indigo-600 hover:underline font-bold">
                    비밀번호 찾기
                  </button>
                )}
              </div>
              <input
                type="password"
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-medium"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border-2 border-rose-100 rounded-xl flex items-center gap-2 text-rose-600 text-sm font-bold">
                <AlertCircle size={18} />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:bg-slate-400 transition-all shadow-lg shadow-indigo-100 font-extrabold flex items-center justify-center gap-2 group"
            >
              {loading ? '처리 중...' : isRegister ? '회원가입하기' : '로그인하기'}
              {!loading && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500 font-medium">
              {isRegister ? '이미 계정이 있으신가요?' : '계정이 없으신가요?'} 
              <button onClick={() => setIsRegister(!isRegister)} className="ml-2 text-indigo-600 font-extrabold hover:underline">
                {isRegister ? '로그인' : '회원가입'}
              </button>
            </p>
          </div>
        </div>
        
        <div className="text-center mt-8 space-y-4">
          <div className="flex justify-center items-center gap-3">
             <button onClick={() => setActiveModal('tos')} className="text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors">이용약관</button>
             <span className="text-slate-200">|</span>
             <button onClick={() => setActiveModal('privacy')} className="text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors">개인정보처리방침</button>
             <span className="text-slate-200">|</span>
             <button 
                onClick={() => setActiveModal('guide')}
                className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-extrabold border border-indigo-100 hover:bg-indigo-100 transition-all shadow-sm"
             >
               <BookOpen size={12} />
               사용 가이드
             </button>
          </div>
          <div className="text-xs text-slate-400 space-y-1 font-medium">
            <p>Contact: sinjoppo@naver.com</p>
            <p>© 2026. Kwon's class. All rights reserved.</p>
          </div>
        </div>
      </div>

      {/* 모달: 이용약관 */}
      <Modal isOpen={activeModal === 'tos'} onClose={() => setActiveModal(null)} title="서비스 이용약관" icon={Scale} colorClass="bg-indigo-600">
        <div className="space-y-6 text-slate-600 leading-relaxed text-sm">
          <section>
            <h3 className="text-slate-900 font-bold mb-2">제 1 조 (목적)</h3>
            <p>본 약관은 "Kids-Time-Table"(이하 "서비스")이 제공하는 일정 관리 및 시각화 서비스의 이용 조건, 절차 및 이용자와 서비스 제공자 간의 권리, 의무 및 책임 사항을 규정함을 목적으로 합니다.</p>
          </section>
          <section>
            <h3 className="text-slate-900 font-bold mb-2">제 2 조 (용어의 정의)</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>"회원"이라 함은 본 약관에 동의하고 이메일 인증을 통해 계정을 생성하여 서비스를 이용하는 자를 의미합니다.</li>
              <li>"콘텐츠"라 함은 회원이 서비스 내에 등록한 자녀의 이름, 일정, 메모 등의 데이터를 의미합니다.</li>
            </ul>
          </section>
          <section>
            <h3 className="text-slate-900 font-bold mb-2">제 3 조 (약관의 효력 및 변경)</h3>
            <p>본 약관은 서비스 화면에 게시함으로써 효력이 발생합니다. 서비스는 필요 시 관련 법령을 위배하지 않는 범위 내에서 약관을 개정할 수 있으며, 변경 사항은 공지사항을 통해 사전 고지합니다.</p>
          </section>
          <section>
            <h3 className="text-slate-900 font-bold mb-2">제 4 조 (회원 가입 및 계정 관리)</h3>
            <p>이용자는 이메일 인증을 통해 가입 절차를 완료함으로써 회원이 됩니다. 회원은 자신의 계정 및 비밀번호를 관리할 책임이 있으며, 제3자에게 이용하게 해서는 안 됩니다. 부정 이용이 의심되는 경우 서비스는 해당 계정의 이용을 제한할 수 있습니다.</p>
          </section>
          <section>
            <h3 className="text-slate-900 font-bold mb-2">제 5 조 (서비스의 제공 및 변경)</h3>
            <p>서비스는 10분 단위 일정 관리, 세이프가드, 데이터 내보내기 등의 기능을 제공합니다. 서비스의 유지보수, 점검 또는 기술적 사양의 변경이 필요한 경우 서비스 내용의 전부 또는 일부를 중단하거나 변경할 수 있습니다.</p>
          </section>
          <section>
            <h3 className="text-slate-900 font-bold mb-2">제 6 조 (데이터의 소유 및 관리)</h3>
            <p>회원이 입력한 데이터의 소유권은 회원에게 있으며, 서비스는 이를 안전하게 보관할 의무를 가집니다. 회원은 본인의 데이터를 PDF 또는 Excel 형태로 추출(Export)할 권리를 가집니다. 서비스 탈퇴 시 회원의 모든 데이터는 즉시 삭제되며, 복구가 불가능합니다.</p>
          </section>
          <section>
            <h3 className="text-slate-900 font-bold mb-2">제 7 조 (책임의 제한)</h3>
            <p>서비스는 천재지변, 서버 점검, 통신 장애 등 불가피한 사유로 발생한 서비스 중단 및 데이터 유실에 대해 고의 또는 중과실이 없는 한 책임을 지지 않습니다. 회원이 직접 입력한 정보의 정확성에 대한 책임은 회원 본인에게 있습니다.</p>
          </section>
        </div>
      </Modal>

      {/* 모달: 개인정보처리방침 */}
      <Modal isOpen={activeModal === 'privacy'} onClose={() => setActiveModal(null)} title="개인정보처리방침" icon={ShieldCheck} colorClass="bg-emerald-600">
        <div className="space-y-6 text-slate-600 leading-relaxed text-sm">
          <section>
            <h3 className="text-slate-900 font-bold mb-2">1. 수집하는 개인정보 항목 및 방법</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>필수 항목: 이메일 주소 (Firebase Authentication 인증 및 계정 식별용)</li>
              <li>서비스 이용 항목: 자녀 성명(또는 별칭), 학교 시간표, 방과 후 일정 데이터</li>
              <li>수집 방법: 회원가입 시 및 서비스 내 이용자 직접 입력</li>
            </ul>
          </section>
          <section>
            <h3 className="text-slate-900 font-bold mb-2">2. 개인정보의 수집 및 이용 목적</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>회원 식별 및 가입 의사 확인</li>
              <li>자녀별 멀티 프로필 관리 및 개인화된 일정 스케줄링 서비스 제공</li>
              <li>기기 변경 시 데이터 동기화 및 보안 서비스 유지</li>
            </ul>
          </section>
          <section>
            <h3 className="text-slate-900 font-bold mb-2">3. 아동의 개인정보 보호 (특약)</h3>
            <p>본 서비스는 부모 또는 법정대리인이 자녀의 일정을 관리하기 위한 도구입니다. 서비스 내에 입력되는 아동의 정보는 법정대리인의 동의 하에 직접 입력되는 것으로 간주하며, 수집된 아동 정보는 오직 일정 관리 서비스 제공 목적으로만 사용됩니다.</p>
          </section>
          <section>
            <h3 className="text-slate-900 font-bold mb-2">4. 개인정보의 보유 및 파기</h3>
            <p>보유 기간: 회원 탈퇴 시까지 또는 서비스 종료 시까지. 파기 절차: 회원이 탈퇴를 요청하거나 목적이 달성된 경우, Firebase Firestore 및 Authentication에서 해당 데이터를 지체 없이 영구 삭제합니다.</p>
          </section>
          <section>
            <h3 className="text-slate-900 font-bold mb-2">5. 개인정보의 안전성 확보 조치</h3>
            <p>암호화: 모든 데이터는 Firebase의 보안 규칙을 통해 보호되며, 통신 구간은 SSL 암호화가 적용됩니다. 접근 제한: 사용자 본인 외에는 데이터에 접근할 수 없도록 권한 관리를 철저히 수행합니다.</p>
          </section>
          <section>
            <h3 className="text-slate-900 font-bold mb-2">6. 이용자의 권리</h3>
            <p>이용자는 언제든지 본인의 개인정보를 열람, 수정할 수 있으며, '계정 삭제'를 통해 개인정보 주체로서의 권리를 행사할 수 있습니다.</p>
          </section>
          <section>
            <h3 className="text-slate-900 font-bold mb-2">7. 개인정보 보호 책임자 및 문의</h3>
            <p className="font-bold">이름: 권쌤 | 문의: sinjoppo@naver.com</p>
          </section>
        </div>
      </Modal>

      {/* 모달: 사용 가이드 */}
      <Modal isOpen={activeModal === 'guide'} onClose={() => setActiveModal(null)} title="Kids-Time-Table 스마트 활용 가이드" icon={BookOpen} colorClass="bg-purple-600">
        <div className="space-y-8 text-slate-600 leading-relaxed text-sm">
          <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100 flex items-start gap-3">
            <Sparkles className="text-purple-600 flex-shrink-0 mt-1" size={18} />
            <p className="text-purple-900 font-bold">안녕하세요! 아이들의 소중한 시간을 함께 관리하는 Kids-Time-Table입니다. 우리 서비스를 더욱 안전하고 똑똑하게 활용할 수 있는 5가지 꿀팁을 전해드립니다.</p>
          </div>

          <div className="space-y-6">
            <section className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 flex-shrink-0">1</div>
              <div>
                <h4 className="font-extrabold text-slate-900 flex items-center gap-2 mb-1">🛡️ 자녀의 이름은 '별명'으로 등록하세요</h4>
                <p>우리 아이의 소중한 개인정보 보호를 위해 '첫째', '쑥쑥이', '운동대장' 등 가족만 알아볼 수 있는 귀여운 별명을 사용해 보세요. 정보 노출 걱정은 덜고, 친근함은 더할 수 있습니다.</p>
              </div>
            </section>

            <section className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 flex-shrink-0">2</div>
              <div>
                <h4 className="font-extrabold text-slate-900 flex items-center gap-2 mb-1">💡 상세 설명은 구체적일수록 좋아요</h4>
                <p>[일정 등록] 시 상세 설명란에 "축구화 지참", "셔틀 10분 전 도착" 등을 적어두세요. [시간 배정] 탭에서 해당 일정 위로 마우스를 올렸을 때 팝업 툴팁으로 내용이 나타나 즉각적인 판단을 도와줍니다.</p>
              </div>
            </section>

            <section className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 flex-shrink-0">3</div>
              <div>
                <h4 className="font-extrabold text-slate-900 flex items-center gap-2 mb-1">📧 이메일 가입, '데이터 보호'를 위한 장치입니다</h4>
                <p>회원가입 시 이메일은 마케팅 목적이 아닙니다. 비밀번호를 잊어버리셨을 때, 본인임을 확인하고 안전하게 재발급해 드리기 위한 유일한 수단입니다. 꼭 사용하는 이메일로 등록해 주세요.</p>
              </div>
            </section>

            <section className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 flex-shrink-0">4</div>
              <div>
                <h4 className="font-extrabold text-slate-900 flex items-center gap-2 mb-1">☀️ 오전/오후 뷰를 자유롭게 전환해 보세요</h4>
                <p>오전/오후 뷰 전환은 '보여주는 창'을 옮기는 것일 뿐, 입력된 데이터는 그대로 유지됩니다. 평일엔 오후 뷰를, 일찍 시작되는 주말에는 오전 뷰를 활용해 화면을 넓고 쾌적하게 써보세요.</p>
              </div>
            </section>

            <section className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 flex-shrink-0">5</div>
              <div>
                <h4 className="font-extrabold text-slate-900 flex items-center gap-2 mb-1">🌈 카테고리를 세분화하면 '찾기'가 쉬워집니다</h4>
                <p>[학원], [학습지], [운동], [자유시간] 등으로 카테고리를 미리 분류해 두세요. 색상별로 구분된 일정들이 여러분의 드래그 앤 드롭을 한결 빠르고 즐겁게 만들어 줄 것입니다.</p>
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
    </div>
  );
};

export default Login;
