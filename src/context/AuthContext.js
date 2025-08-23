// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCurrentUser = async () => {
            const token = localStorage.getItem('jwt');
            if (token) {
                try {
                    const response = await axios.get('http://localhost:8080/api/users/me', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    setCurrentUser(response.data);
                } catch (error) {
                    console.error("사용자 정보 인증 실패", error);
                    localStorage.removeItem('jwt'); // 유효하지 않은 토큰 제거
                }
            }
            setLoading(false);
        };
        fetchCurrentUser();
    }, []);

    if (loading) {
        return <div>로딩 중...</div>; // 인증 정보 로딩 중 표시
    }

    return (
        <AuthContext.Provider value={{ currentUser, setCurrentUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export { AuthContext, AuthProvider };