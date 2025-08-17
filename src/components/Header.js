import React from 'react';
import { Link } from 'react-router-dom';

// App 컴포넌트로부터 jwt 토큰을 props로 전달받습니다.
const Header = ({ jwt }) => {
  return (
    <header className="App-header">
      <h1>Nottori 공동구매 플랫폼</h1>

      {/* jwt가 있을 때만 네비게이션 링크를 보여줍니다. */}
      {jwt && (
        <nav className="main-nav" style={{ marginTop: '10px' }}>
          <Link to="/" style={{ color: 'white', marginRight: '20px', textDecoration: 'none' }}>
            메인으로
          </Link>
          <Link to="/mypage" style={{ color: 'white', textDecoration: 'none' }}>
            마이페이지
          </Link>
        </nav>
      )}
    </header>
  );
};

export default Header;