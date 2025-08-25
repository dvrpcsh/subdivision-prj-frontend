// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
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
                    localStorage.removeItem('jwt');
                }
            }
            setLoading(false);
        };
        fetchCurrentUser();
    }, []);

    const login = async (token) => {
        localStorage.setItem('jwt', token);
        try {
            const response = await axios.get('http://localhost:8080/api/users/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            // 1. 서버에서 받아온 사용자 정보로 상태를 업데이트합니다.
            setCurrentUser(response.data);
            // 2. [핵심 수정] 성공했다는 신호로 사용자 데이터를 반환합니다.
            return response.data;
        } catch (error) {
            console.error("로그인 후 사용자 정보 조회에 실패했습니다.", error);
            localStorage.removeItem('jwt');
            setCurrentUser(null);
            // 3. 실패 시, 에러를 발생시켜 로그인 페이지가 실패를 인지하도록 합니다.
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('jwt');
        setCurrentUser(null);
    };

    const value = {
        currentUser,
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
