import React, { useState, useEffect } from 'react';
import axios from 'axios';
import KakaoMap from '../components/KakaoMap';
import { PotCategory } from '../constants/categories';

const MainPage = () => {
    const [location, setLocation] = useState(null);
    const [pots, setPots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [category, setCategory] = useState(null);
    const [distance, setDistance] = useState(10);

    //로그아웃 핸들러
    const handleLogout = () => {
        localStorage.removeItem('jwt');
        window.location.replace('/login');
    };

    //컴포넌트가 처음 마운트될 때 사용자의 위치를 가져오는 useEffect
    useEffect(() => {
        if(!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            setLoading(false);

            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setLocation({ latitude, longitude });
            },
            (err) => {
                setError(err.message);
                setLoading(false);
            }
        );
    }, []);

    //위치나 검색 필터가 변결될 때 마다 API를 호출합니다.
    useEffect(() => {
        //위치 정보가 있어야만 API를 호출합니다.
        if(!location) return;

        const fetchPots = async () => {
            setLoading(true); //데이터 요청 시작 시 로딩 상태로 설정
            try {
                const token = localStorage.getItem('jwt');
                if(!token) {
                    setError('로그인이 필요합니다.');

                    return;
                }
                const response = await axios.get('http://localhost:8080/api/pots/search', {
                    params: {
                        lat: location.latitude,
                        lon: location.longitude,
                        distance: distance,
                        keyword: searchTerm || null, //검색어가 비어있으면 null로 보냄
                        category: category,
                        status: 'RECRUITING'
                    },
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setPots(response.data.content);
            } catch(err) {
                setError('주변 팟 목록을 불러오는 데 실패했습니다.');
                console.error('API Error:', err);
            } finally {
                setLoading(false); //데이터 요청 완료 시 로딩 상태 해제
            }
        };

        fetchPots();
    }, [location, searchTerm, category, distance]); //해당 값들이 바뀔 때 마다 useEffect 실행

    return (
        <div>
            <button
                onClick={handleLogout}
                style={{ margin: '10px', padding: '8px 15px', cursor: 'pointer' }}
            >
                로그아웃
            </button>
            <hr />

            {/* 검색 및 필터 UI*/}
            <div className="search-filters">
                <input
                    type="text"
                    placeholder="키워드로 검색"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />

                <div>
                    {Object.entries(PotCategory).map(([key, displayName]) => (
                        <button key={key} onClick={() => setCategory(key)}>
                            {displayName}
                        </button>
                    ))}
                    <button onClick={() => setCategory('null')}>전체</button>
                </div>

                <select value={distance} onChange={(e) => setDistance(e.target.value)}>
                    <option value="1">1km 이내</option>
                    <option value="3">3km 이내</option>
                    <option value="5">5km 이내</option>
                    <option value="10">10km 이내</option>
                </select>
            </div>

            {/*지도와 팟 목록 표시*/}
            <div style={{ marginTop: '20px', marginBottom: '20px' }}>
                <KakaoMap userLocation={location} pots={pots} />
            </div>

            <h2>주변 팟 목록 (총 {pots.length}개)</h2>
                {loading ? (
                    <p>팟 목록을 불러오는 중...</p>
                ) : pots.length > 0 ? (
                    <ul>
                        {pots.map((pot) => (
                            <li key={pot.potId}>
                                <strong>{pot.title}</strong> - {pot.productName}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>주변에 진행 중인 팟이 없습니다.</p>
                )}
            </div>
    );
};

export default MainPage;