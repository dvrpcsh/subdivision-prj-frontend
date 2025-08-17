import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import LoginPage from './pages/LoginPage';
import PotListPage from './pages/PotListPage';
import LocationFinder from './components/LocationFinder';
//import MainPage from './pages/MainPage';
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

//MainPage 컴포넌트를 임시로 정의합니다. (기존 LocationFinder와 PotListPage를 합친 페이지)
// 추후 별도 pages/Mainpage.js 파일로 분리할거임
const MainPage = () => {
    const handleLogout = () => {
        localStorage.removeItem('jwt');
        window.location.reload(); //간단하게 새로고침하여 App 컴포넌트의 jwt 상태를 갱신
    };

    return (
        <div>
            <button onClick={handleLogout} style={{ margin: '10px' }}>로그아웃</button>
            <hr />
            <LocationFinder />
            <hr />
            {/* PotListPage는 LocationFinder와 기능이 중복되므로 우선 제거합니다. */}
            {/* <h1>Nottori 팟 목록</h1> */}
            {/* <PotListPage jwt={localStorage.getItem('jwt')} onLogout={handleLogout} /> */}
        </div>
    );
};

export default App;