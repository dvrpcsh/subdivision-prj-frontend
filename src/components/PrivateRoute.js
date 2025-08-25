import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

/**
 * 로그인이 필요한 경로를 보호하는 컴포넌트입니다.
 * @param {object} props - 자식 컴포넌트(children)를 포함하는 props 객체
 * @returns {React.ReactElement} - 로그인 상태에 따라 페이지 또는 리디렉션을 반환합니다.
 */
const PrivateRoute = ({ children }) => {
    // 1. AuthContext에서 현재 사용자 정보를 가져옵니다.
    const { currentUser } = useContext(AuthContext);
    const location = useLocation();

    // 2. 만약 로그인한 사용자가 없다면(currentUser가 null이면),
    if (!currentUser) {
        // 로그인 페이지로 리디렉션(강제 이동)합니다.
        // state에 원래 가려던 경로(location)를 저장하여, 로그인 성공 후 다시 돌아올 수 있도록 합니다.
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 3. 로그인한 사용자가 있다면, 원래 접근하려던 페이지(children)를 그대로 보여줍니다.
    return children;
};

export default PrivateRoute;
