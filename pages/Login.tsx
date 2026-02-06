
import React, { useState } from 'react';
import { Sparkles, Mail, Lock, ArrowRight, UserPlus } from 'lucide-react';
import { auth } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail 
} from 'firebase/auth';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);

  const getErrorMessage = (error: any) => {
    switch (error.code) {
      case 'auth/invalid-api-key':
        return 'Firebase API 키가 유효하지 않습니다. firebase.ts 설정을 확인해주세요.';
      case 'auth/network-request-failed':
        return '네트워크 연결에 실패했습니다.';
      case 'auth/email-already-in-use':
        return '이미 사용 중인 이메일입니다.';
      case 'auth/weak-password':
        return '비밀번호가 너무 취약합니다. (최소 6자 이상)';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return '이메일 또는 비밀번호가 일치하지 않습니다.';
      case 'auth/invalid-email':
        return '유효하지 않은 이메일 형식입니다.';
      default:
        return `오류가 발생했습니다: ${error.message}`;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // API 키 설정 확인 (클라이언트 측 가드)
    if (auth.config.apiKey === "YOUR_API_KEY") {
      alert('백엔드 설정(Firebase API Key)이 완료되지 않았습니다. 개발자에게 문의하거나 firebase.ts 파일을 수정해주세요.');
      return;
    }

    setLoading(true);
    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email, password);
        alert('회원가입이 완료되었습니다!');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (error: any) {
      console.error("Firebase Auth Error:", error);
      alert(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) return alert('이메일을 입력해주세요.');
    try {
      await sendPasswordResetEmail(auth, email);
      alert('비밀번호 재설정 이메일이 발송되었습니다.');
    } catch (error: any) {
      alert(getErrorMessage(error));
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
          <p className="text-slate-500 mt-2">아이들의 방과 후 일정을 똑똑하게 관리하세요</p>
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
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
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
                  <button 
                    type="button" 
                    onClick={handleResetPassword}
                    className="text-xs text-indigo-600 hover:underline"
                  >
                    비밀번호 찾기
                  </button>
                )}
              </div>
              <input
                type="password"
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:bg-slate-400 transition-all shadow-lg shadow-indigo-100 font-bold flex items-center justify-center gap-2 group"
            >
              {loading ? '처리 중...' : isRegister ? '회원가입하기' : '로그인하기'}
              {!loading && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500">
              {isRegister ? '이미 계정이 있으신가요?' : '계정이 없으신가요?'} 
              <button 
                onClick={() => setIsRegister(!isRegister)}
                className="ml-2 text-indigo-600 font-semibold hover:underline"
              >
                {isRegister ? '로그인' : '회원가입'}
              </button>
            </p>
          </div>
        </div>
        
        <div className="text-center mt-8 text-xs text-slate-400 space-y-1">
          <p>제안이나 문의사항이 있으시면 언제든 메일 주세요.</p>
          <p>Contact: sinjoppo@naver.com</p>
          <p>© 2026. Kwon's class. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
