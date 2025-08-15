import React, { useState } from 'react';
import axios from 'axios';

//부모 컴포넌트(App.js)로 부터 onLoginSuccess 함수를 props로 받습니다.
function LoginPage({ onLoginSuccess }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async(e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8080/api/auth/login', {
                email: email,
                password: password
            });

            const receivedJwt = response.data;
            //로그인 성공 시, 부모에게 받은 함수를 호출하여 JWT를 전달합니다.
            onLoginSuccess(receivedJwt);
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