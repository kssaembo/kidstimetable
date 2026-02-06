
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

/**
 * [중요] Firebase 콘솔에서 발급받은 실제 설정값으로 교체해야 합니다.
 * 교체하지 않으면 'YOUR_API_KEY' 등의 문자가 그대로 사용되어 400(Bad Request) 에러가 발생합니다.
 */
const firebaseConfig = {
  apiKey: "AIzaSyCu7t1uAhj33aWJdUaWGm9mlwKL2zoohSw",
  authDomain: "kids-time-table.firebaseapp.com",
  projectId: "kids-time-table",
  storageBucket: "kids-time-table.firebasestorage.app",
  messagingSenderId: "74009352324",
  appId: "1:74009352324:web:b808bee95bacddf5330ad1",
};

// 설정값이 기본값인 경우 개발자에게 경고
if (firebaseConfig.apiKey === "YOUR_API_KEY") {
  console.warn(
    "Firebase 설정이 완료되지 않았습니다. firebase.ts 파일의 firebaseConfig를 실제 값으로 업데이트해주세요.\n" +
    "Firebase Console -> 프로젝트 설정 -> 일반 -> 내 앱에서 확인 가능합니다."
  );
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
