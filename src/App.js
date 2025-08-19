import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

import Header from './components/Header'; //
import LoginPage from './pages/LoginPage';
import MainPage from './pages/MainPage';
import PotDetailPage from './pages/PotDetailPage';
import MyPage from './pages/MyPage';
import PotCreatePage from './pages/PotCreatePage';
import SignupPage from './pages/SignupPage';

function App() {

    return (
        <div className="App">
            <Header />

            <main className="main-content">
                <Routes>
                    <Route path="/" element={<MainPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                    <Route path="/pots/:potId" element={<PotDetailPage />} />
                    <Route path="/mypage" element={<MyPage />} />
                    <Route path="/create-pot" element={<PotCreatePage />} />
                    {/* 인증이 필요한 페이지는 각 페이지 내부에서 처리하는 것이 더 효율적일 수 있습니다. */}
                </Routes>
            </main>
        </div>
    );
}

export default App;