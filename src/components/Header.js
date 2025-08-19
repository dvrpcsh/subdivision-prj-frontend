import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Header.module.css';

// App 컴포넌트로부터 jwt 토큰을 props로 전달받습니다.
const Header = () => {
    const navigate = useNavigate();
    const jwt = localStorage.getItem('jwt');

    const handleLogout = () => {
        localStorage.removeItem('jwt');
        window.location.replace("/login"); //상태를 확실히 초기화하기 위해 새로고침하며 이동
    }

    return (
        <header className={styles.header}>
            <Link to="/" className={styles.logo}>
                우리동네 공동구매 플랫폼
            </Link>
            <nav className={styles.nav}>
                {jwt ? (
                    <>
                        <Link to="/mypage" className={styles.navLink}>마이페이지</Link>
                        <Link to="/create-pot" className={styles.navLink}>팟 만들기</Link>
                        <button onClick={handleLogout} className={styles.logoutButton}>로그아웃</button>
                    </>
                ) : (
                    <>
                        <Link to="/signup" className={styles.navLink}>회원가입</Link>
                        <Link to="/login" className={styles.navLink}>로그인</Link>
                    </>
                )}
            </nav>
        </header>
    );
};

export default Header;