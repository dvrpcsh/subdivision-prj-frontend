import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import styles from './Header.module.css';

const Header = () => {
    const navigate = useNavigate();
    //AuthContext에서 currentUser와 logout 함수를 가져옵니다.
    const { currentUser, logout } = useContext(AuthContext);

    const handleLogout = () => {
        //AuthContext에 만들어둔 logout 함수를 호출합니다.
        //이렇게 하면 토큰 제거와 상태 업데이트가 한번에 안전하게 처리됩니다.
        logout();
        //로그아웃 후에는 홈페이지로 이동시킵니다.
        navigate('/');
    }

    const handleBoardClick = (e) => {
        // 현재 로그인한 유저가 없으면 (로그아웃 상태이면)
        // 로그인 상태라면, 이 함수는 아무것도 하지 않고 Link의 기본 동작(to="/board"로 이동)이 실행됩니다.
        if (!currentUser) {
            // Link 태그의 기본 동작(페이지 이동)을 먼저 막습니다.
            e.preventDefault();
            // 사용자에게 알림을 표시합니다.
            alert('로그인이 필요한 메뉴입니다.');
            // 로그인 페이지로 이동시킵니다.
            navigate('/login');
        }
    };

    // 로고 클릭 시 이동할 경로를 로그인 상태에 따라 결정
    const logoPath = currentUser ? '/map' : '/home';

    return (
        <header className={styles.header}>
            <Link to="/" className={styles.logo}>
                우리동네 공동구매 플랫폼
            </Link>
            <nav className={styles.nav}>
                {/* 자유게시판 이동 */}
                <Link to="/board" onClick={handleBoardClick} className={styles.navLink}>자유게시판</Link>
                {/* currentUser의 존재 여부로 로그인 상태를 판단합니다. */}
                {currentUser ? (
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