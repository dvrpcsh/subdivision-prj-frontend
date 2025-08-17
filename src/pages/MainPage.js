import React from 'react';
import LocationFinder from '../components/LocationFinder';

const MainPage = () => {
    //로그아웃 핸들러
    const handleLogout = () => {
        localStorage.removeItem('jwt');
        window.location.replace('/');
    };

    return (
        <div>
            <button
                onClick={handleLogout}
                style={{ margin: '10px', padding: '8px 15px', cursor: 'pointer' }}
            >
                로그아웃
            </button>
            <hr />
            <LocationFinder />
        </div>
    );
};

export default MainPage;