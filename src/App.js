import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Header from './components/Header'; // ✅ Header 컴포넌트 import
import LoginPage from './pages/LoginPage';
import MainPage from './pages/MainPage';
import PotDetailPage from './pages/PotDetailPage';
import MyPage from './pages/MyPage';

function App() {
    const [jwt, setJwt] = useState(localStorage.getItem('jwt'));

    const handleLoginSuccess = (receivedJwt) => {
        localStorage.setItem('jwt', receivedJwt);
        setJwt(receivedJwt);
    };

    return (
        <div className="App">
            {/* ✅ Header 컴포넌트를 호출하고 jwt 상태를 prop으로 전달 */}
            <Header jwt={jwt} />

            <main>
                <Routes>
                    <Route
                        path="/"
                        element={jwt ? <MainPage /> : <Navigate to="/login" />}
                    />
                    <Route
                        path="/login"
                        element={!jwt ? <LoginPage onLoginSuccess={handleLoginSuccess} /> : <Navigate to="/" />}
                    />
                    <Route
                        path="/pots/:potId"
                        element={jwt ? <PotDetailPage /> : <Navigate to="/login" />}
                    />
                    <Route
                        path="/mypage"
                        element={jwt ? <MyPage /> : <Navigate to="/login" />}
                    />
                </Routes>
            </main>
        </div>
    );
}

export default App;