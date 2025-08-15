import React, { useState } from 'react';
import './App.css';
import LoginPage from './pages/LoginPage';
import PotListPage from './pages/PotListPage';

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
                <h1>Nottori 팟 목록</h1>
                {jwt ? (
                    //jwt가 있으면 PotListPage를 보여주고, 필요한 데이터(jwt)와 함수(handleLogout)를 넘겨줍니다.
                    <PotListPage jwt={jwt} onLogout={handleLogout} />
                ) : (
                    //jwt가 없으면 LoginPage를 보여주고, 필요한 함수(handleLoginSuccess)를 넘겨줍니다.
                    <LoginPage onLoginSuccess={handleLoginSuccess} />
                )}
            </header>
        </div>
    );
}

export default App;