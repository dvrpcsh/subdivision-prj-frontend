import './App.css';
import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import Header from './components/Header';

import HomePage from './pages/HomePage'; // 로그인 안 했을 때의 메인 페이지
import MapPage from './pages/MapPage';   // 로그인 했을 때의 지도 기반 페이지
import LoginPage from './pages/LoginPage';
import PotDetailPage from './pages/PotDetailPage';
import PotEditPage from './pages/PotEditPage';
import MyPage from './pages/MyPage';
import PotCreatePage from './pages/PotCreatePage';
import SignupPage from './pages/SignupPage';
import OAuth2RedirectPage from './pages/OAuth2RedirectPage';


function App() {
    const { currentUser } = useContext(AuthContext);

    return (
        <div className="App">
            <Header />

            <main className="main-content">
                <Routes>
                    {/* 로그인 여부에 따라 다른 컴포넌트를 보여줍니다. */}
                    <Route path="/" element={currentUser ? <MapPage /> : <HomePage />} />
                    <Route path="/map" element={<MapPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                    <Route path="/pots/:potId" element={<PotDetailPage />} />
                    <Route path="/mypage" element={<MyPage />} />
                    <Route path="/create-pot" element={<PotCreatePage />} />
                    {/* 인증이 필요한 페이지는 각 페이지 내부에서 처리하는 것이 더 효율적일 수 있습니다. */}
                    <Route path="/oauth2/redirect" element={<OAuth2RedirectPage />} />
                    <Route path="/pots/:potId/edit" element={<PotEditPage />} />
                </Routes>
            </main>
        </div>
    );
}

export default App;