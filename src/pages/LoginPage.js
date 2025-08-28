import React, { useState, useContext } from 'react';
import api from '../api';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import styles from './LoginPage.module.css';

//부모 컴포넌트(App.js)로 부터 onLoginSuccess 함수를 props로 받습니다.
const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useContext(AuthContext);

    // PrivateRoute로부터 전달받은 '돌아갈 경로'를 확인합니다.
    // 만약 전달받은 경로가 없다면, 기본값으로 '/map'을 사용합니다.
    const from = location.state?.from?.pathname || "/map";

    const handleLogin = async(e) => {
        e.preventDefault();
        setError('');

        try {
            // 1. 서버에 이메일과 비밀번호를 보내 로그인 요청을 합니다.
            const response = await api.post('/api/auth/login', {
                email: email,
                password: password
            });

            // 2. 응답으로 받은 JWT 토큰을 변수에 저장합니다.
            const receivedJwt = response.data;

            // 3. 토큰 유효성을 간단히 확인합니다.
            if(!receivedJwt || typeof receivedJwt !== 'string') {
                throw new Error('응답에 유효한 JWT가 없습니다.');
            }

            // AuthContext의 login 함수를 호출하고, 성공적으로 완료될 때까지 기다립니다.
            // 이 함수는 성공 시 사용자 정보를, 실패 시 에러를 반환하도록 AuthContext에서 수정했습니다.
            const user = await login(receivedJwt);

            // login 함수가 성공적으로 완료되어 사용자 정보(user)를 반환했을 때만 페이지를 이동합니다.
            // 이로써 상태 동기화가 완료된 후 이동하는 것이 보장됩니다.
            if (user) {
                navigate(from, { replace: true });
            }

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

            <div className={styles.socialLoginContainer}>
                {/* Google 로그인 버튼 */}
                <a
                    href="http://localhost:8080/oauth2/authorization/google"
                    className={`${styles.socialButton} ${styles.googleButton}`}
                > Google 계정으로 로그인
                </a>
                {/* 카카오 로그인 버튼 */}
                <a
                    href="http://localhost:8080/oauth2/authorization/kakao"
                    className={`${styles.socialButton} ${styles.kakaoButton}`}
                > 카카오 계정으로 로그인
                </a>
                {/* 네이버 로그인 버튼 */}
                <a href="http://localhost:8080/oauth2/authorization/naver" className={`${styles.socialButton} ${styles.naverButton}`}>
                    네이버 계정으로 로그인
                </a>
            </div>
        </div>
    );
};

export default LoginPage;