import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

//부모 컴포넌트(App.js)로 부터 onLoginSuccess 함수를 props로 받습니다.
const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async(e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8080/api/auth/login', {
                email: email,
                password: password
            });

            //응답 객체(response.data)에서 access Token만 정확히 추출
            const receivedJwt = response.data;

            //토큰 유효성 검사
            if(!receivedJwt || typeof receivedJwt !== 'string') {
                throw new Error('응답에 유효한 JWT가 없습니다.');
            }

            localStorage.setItem('jwt', receivedJwt);

            navigate('/')
            window.location.reload();



        } catch(error) {
            console.error("로그인 실패:", error);
            alert("로그인에 실패했습니다.");
        }
    };

    return (
        <form onSubmit={handleLogin}>
            <div>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="이메일"
                />
            </div>
            <div>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="비밀번호"
                />
            </div>
            <button type="submit">로그인</button>
        </form>
    );
}

export default LoginPage;