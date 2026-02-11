
import React from 'react';
import { Navigate } from 'react-router-dom';

// 이제 법적 고지는 로그인 화면에서 팝업으로 제공되므로, 
// 직접 접근 시 로그인 화면으로 리다이렉트합니다.
const Legal: React.FC = () => {
  return <Navigate to="/login" replace />;
};

export default Legal;
