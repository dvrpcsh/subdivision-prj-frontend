import './App.css';
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import PrivateRoute from './components/PrivateRoute';
import BoardPage from './pages/BoardPage';
import BoardWritePage from './pages/BoardWritePage';
import BoardEditPage from './pages/BoardEditPage';
import BoardDetailPage from './pages/BoardDetailPage';

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

    return (
        <div className="App">
            <Header />
            <main className="main-content">
                <Routes>
                    {/* --- 로그인 없이 접근 가능한 경로 --- */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                    <Route path="/oauth2/redirect" element={<OAuth2RedirectPage />} />

                    {/* --- 로그인해야만 접근 가능한 경로 --- */}
                    <Route path="/map" element={<PrivateRoute><MapPage /></PrivateRoute>} />
                    <Route path="/pots/:potId" element={<PrivateRoute><PotDetailPage /></PrivateRoute>} />
                    <Route path="/mypage" element={<PrivateRoute><MyPage /></PrivateRoute>} />
                    <Route path="/create-pot" element={<PrivateRoute><PotCreatePage /></PrivateRoute>} />
                    <Route path="/pots/:potId/edit" element={<PrivateRoute><PotEditPage /></PrivateRoute>} />
                    <Route path="/board" element={<PrivateRoute><BoardPage /></PrivateRoute>} />
                    <Route path="/board/new" element={<PrivateRoute><BoardWritePage /></PrivateRoute>} />
                    <Route path="/board/:id" element={<PrivateRoute><BoardDetailPage /></PrivateRoute>} />
                    <Route path="/board/:id/edit" element={<PrivateRoute><BoardEditPage /></PrivateRoute>} />
                </Routes>
            </main>
        </div>
    );
}

export default App;