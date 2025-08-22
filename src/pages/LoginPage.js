import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from './LoginPage.module.css';

//부모 컴포넌트(App.js)로 부터 onLoginSuccess 함수를 props로 받습니다.
const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async(e) => {
        e.preventDefault();
        setError('');

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

            navigate('/');
            window.location.reload();

        } catch(err) {
            console.error("로그인 실패:", err);
            setError("이메일 또는 비밀번호가 올바르지 않습니다.");
        }
    };

    return (
        <div className={styles.pageContainer}>
            <h2>로그인</h2>
            <form onSubmit={handleLogin} className={styles.loginForm}>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="이메일"
                    required
                    className={styles.formInput}
                />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="비밀번호"
                    required
                    className={styles.formInput}
                />
                {error && <p className={styles.errorMessage}>{error}</p>}
                <button type="submit" className={styles.submitButton}>로그인</button>
            </form>

            <div style={{ marginTop: '20px' }}>
                {/* Google 로그인 버튼 */}
                <a
                    href="http://localhost:8080/oauth2/authorization/google"
                    className={styles.googleButton}
                > Google 계정으로 로그인
                </a>
            </div>
        </div>
    );
};

export default LoginPage;