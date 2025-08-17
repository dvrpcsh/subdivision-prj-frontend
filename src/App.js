import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import LoginPage from './pages/LoginPage';
import PotListPage from './pages/PotListPage';
import LocationFinder from './components/LocationFinder';
import MainPage from './pages/MainPage';
import PotDetailPage from './pages/PotDetailPage';

function App() {
    //2. 받아온 팟(Pot) 목록을 저장할 상태(state)를 만듭니다.
    const [jwt, setJwt] = useState(localStorage.getItem('jwt'));

    const handleLoginSuccess = (receivedJwt) => {
        localStorage.setItem('jwt', receivedJwt);
        setJwt(receivedJwt);
    };

    const handleLogout = () => {
        localStorage.removeItem('jwt');
        setJwt(null);
    };

    return (
        <div className="App">
            <header className="App-header">
                <h1>Nottori 공동구매 플랫폼</h1>
            </header>
            <main>
                {/* Routes로 URL 경로에 따른 컴포넌트를 설정합니다. */}
                <Routes>
                    {/* 기본 경로('/') */}
                    <Route
                        path="/"
                        element={jwt ? <MainPage /> : <Navigate to="/login" />}
                    />

                    {/* 로그인 페이지 경로 ('/login') */}
                    <Route
                        path="/login"
                        element={!jwt ? <LoginPage onLoginSuccess={handleLoginSuccess} /> : <Navigate to="/" />}
                    />

                    {/* 팟 상세 페이지 경로 ('/pots/:potId') */}
                    <Route
                        path="/pots/:potId"
                        element={jwt ? <PotDetailPage /> : <Navigate to="/login" />}
                    />
                </Routes>
            </main>
        </div>
    );
}

export default App;