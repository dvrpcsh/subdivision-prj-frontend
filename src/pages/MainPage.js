import React, { useState, useEffect } from 'react';
import axios from 'axios';
import KakaoMap from '../components/KakaoMap';
import { PotCategory } from '../constants/categories';
import { useNavigate } from 'react-router-dom';
import styles from './MainPage.module.css';

const MainPage = () => {
    const [location, setLocation] = useState(null);
    const [pots, setPots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [category, setCategory] = useState(null);
    const [distance, setDistance] = useState(10);
    const navigate = useNavigate();

    //로그아웃 핸들러
    const handleLogout = () => {
        localStorage.removeItem('jwt');
        navigate('/login');
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
                //응답 데이터가 없거나 content가 없을 경우를 대비해 기본값으로 빈 배열을 설정
                setPots(response.data?.content || []);
            } catch(err) {
                setError('주변 팟 목록을 불러오는 데 실패했습니다.');
                setPots([]); //에러 발생 시에도 빈 배열로 초기화
                console.error('API Error:', err);
            } finally {
                setLoading(false); //데이터 요청 완료 시 로딩 상태 해제
            }
        };

        fetchPots();
    }, [location, searchTerm, category, distance]); //해당 값들이 바뀔 때 마다 useEffect 실행

    return (
        <div>
            <button onClick={handleLogout} style={{ position: 'absolute', top: 110, right: 20 }}>
                로그아웃
            </button>

            <div className={styles.mainContainer}>
            {/* 👈 1. 왼쪽 사이드바 */}
            <div className={styles.sidebar}>
                <h2>주변 팟 찾기</h2>
                <div className={styles.filters}>
                    <input
                        type="text"
                        placeholder="키워드로 검색..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <select value={distance} onChange={(e) => setDistance(e.target.value)}>
                        <option value="1">1km 이내</option>
                        <option value="3">3km 이내</option>
                        <option value="5">5km 이내</option>
                        <option value="10">10km 이내</option>
                    </select>
                    <div className={styles.categoryButtons}>
                        <button className={!category ? styles.active : ''} onClick={() => setCategory(null)}>전체</button>
                        {Object.entries(PotCategory).map(([key, displayName]) => (
                            <button
                                key={key}
                                className={category === key ? styles.active : ''}
                                onClick={() => setCategory(key)}
                            >
                                {displayName}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 👈 2. 팟 목록 (카드 디자인 적용) */}
                {loading ? (
                    <p>목록을 불러오는 중...</p>
                ) : (
                    <ul className={styles.potList}>
                        {pots.map((pot) => (
                            <li key={pot.potId} className={styles.potCard} onClick={() => navigate(`/pots/${pot.potId}`)}>
                                {pot.imageUrl && <img src={pot.imageUrl} alt={pot.productName} />}
                                <h3>{pot.title}</h3>
                                <p>{pot.productName}</p>
                                <p>참여인원: {pot.currentHeadcount} / {pot.maximumHeadcount}</p>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* 👈 3. 오른쪽 지도 영역 */}
            <div className={styles.mapContent}>
                <KakaoMap userLocation={location} pots={pots} />
            </div>
        </div>
    </div>
    );
};

export default MainPage;