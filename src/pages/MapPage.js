import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import KakaoMap from '../components/KakaoMap';
import { PotCategory } from '../constants/categories';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import styles from './MapPage.module.css';
import '../components/PotStatusBadge.css';
import noImage from '../assets/no-image.jpg';



const MapPage = () => {
    const [location, setLocation] = useState(null);
    const [pots, setPots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [category, setCategory] = useState(null);
    const [distance, setDistance] = useState(1); //최초 로딩 시 1km로 설정
    const [status, setStatus] = useState('RECRUITING');
    const [map, setMap] = useState();//지도 인스턴스를 저장할 상태. 이 상태를 자식 컴포넌트(KakaoMap)와 공유합니다.
    const navigate = useNavigate();
    const { logout } = useContext(AuthContext);

    //마우스가 올라간 팟의 ID를 저장하기 위한 상태를 추가합니다.
    const [hoveredPotId, setHoveredPotId] = useState(null);


    /**
     * map 객체, 사용자 위치(location), 검색 거리(distance)가 모두 준비되면 실행됩니다.
     * 지도 제어 useEffect에 디바운싱(Debouncing) 로직을 추가합니다.
     * 사용자가 슬라이더 조작을 멈추고 200ms가 지난 후에 딱 한 번만 실행됩니다.
     */
    useEffect(() => {
        // map이나 location 정보가 아직 준비되지 않았다면 아무것도 하지 않습니다.
        if (!map || !location) return;

        // 1.타이머를 설정합니다. (200ms = 0.2초)
        const timer = setTimeout(() => {
            // 2.0.2초 뒤에 아래 로직이 실행됩니다.
            console.log(`최종 거리(${distance}km)로 지도 업데이트!`); // 디버깅용 로그

            const centerPoint = new window.kakao.maps.LatLng(location.latitude, location.longitude);
            map.panTo(centerPoint);

            let level;
            //거리에 따른 지도 확대/축소
            if (distance <= 1) level = 2;
            else if (distance <= 3) level = 3;
            else if (distance <= 5) level = 4;
            else if (distance <= 10) level = 6;
            else if (distance <= 20) level = 7;
            else level = 9;
            map.setLevel(level);

        }, 200);

        // 3.useEffect가 다시 실행될 때(distance가 바뀔 때마다) 기존 타이머를 취소합니다.
        //    결과적으로, 사용자가 조작을 멈췄을 때의 마지막 타이머만 살아남게 됩니다.
        return () => {
            clearTimeout(timer);
        };

        // 의존성 배열에 map, location, distance를 추가하여 이 값들이 변경될 때마다 효과가 재실행되도록 합니다.
    }, [map, location, distance]);

    /**
     * hoveredPotId가 변경될 때 지도를 해당 마커 위치로 이동시키는 useEffect를 추가합니다.
     */
    useEffect(() => {
        // map 객체가 있고, hoveredPotId가 null이 아닐 때만 실행합니다.
        if (map && hoveredPotId) {
            // pots 배열에서 마우스가 올라간 팟 정보를 찾습니다.
            const hoveredPot = pots.find(pot => pot.potId === hoveredPotId);
            if (hoveredPot) {
                // 해당 팟의 위치로 지도를 부드럽게 이동시킵니다.
                const centerPoint = new window.kakao.maps.LatLng(hoveredPot.latitude, hoveredPot.longitude);
                map.panTo(centerPoint);
            }
        }
    }, [hoveredPotId, map, pots]); // hoveredPotId, map, pots가 변경될 때마다 이 효과를 재실행합니다.

    //로그아웃 핸들러
    const handleLogout = () => {
        logout();
        navigate('/');
    };

    //토글 스위치 상태 변경 핸들러
    const handleStatusToggle = (e) => {
        // 체크되면 'RECRUITING', 해제되면 null (전체 보기)로 상태 변경
        setStatus(e.target.checked ? 'RECRUITING' : null);
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

    //위치나 검색 필터가 변경될 때 마다 API를 호출합니다.
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
                        status: status
                    },
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                //응답 데이터가 없거나 content가 없을 경우를 대비해 기본값으로 빈 배열을 설정
                setPots(response.data?.content || []);
            } catch(err) {
                setError('주변 팟 목록을 불러오는 데 실패했습니다.');
                setPots([]); //에러 발생 시에도 빈 배열로 초기화
            } finally {
                setLoading(false); //데이터 요청 완료 시 로딩 상태 해제
            }
        };

        fetchPots();
    }, [location, searchTerm, category, distance, status]); //해당 값들이 바뀔 때 마다 useEffect 실행

    return (
        <div>
            <button onClick={handleLogout} style={{ position: 'absolute', top: 110, right: 20 }}>
                로그아웃
            </button>

            <div className={styles.mainContainer}>
            {/* 1. 왼쪽 사이드바 */}
            <div className={styles.sidebar}>
                <h2>주변 팟 찾기</h2>
                <div className={styles.filters}>
                    <input
                        type="text"
                        placeholder="키워드로 검색..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
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

                    {/* 거리 필터 슬라이더 UI */}
                    <div className={styles.distanceFilter}>
                        <label>검색 거리: {distance}km</label>
                        <input
                            type="range"
                            min="1"
                            max="30"
                            step="1" //1km 단위로 표시
                            value={distance}
                            onChange={(e) => setDistance(Number(e.target.value))}
                            className={styles.slider}
                        />
                    </div>
                </div>

                {/* 상태 필터 버튼 */}
                <div className={styles.statusFilters}>
                    <div className={styles.toggleContainer}>
                        <label className={styles.toggleSwitch}>
                            <input
                                type="checkbox"
                                checked={status === 'RECRUITING'}
                                onChange={handleStatusToggle}
                            />
                            <span className={styles.toggleSlider}></span>
                        </label>
                        <span>모집중인 팟만 보기</span>
                    </div>
                </div>

                {/* 2. 팟 목록 (카드 디자인 적용) */}
                {loading ? (
                    <p>목록을 불러오는 중...</p>
                ) : (
                    <ul className={styles.potList}>
                        {pots.map((pot) => {
                            const isCompleted = pot.currentHeadcount >= pot.maximumHeadcount;
                            return (
                                //li 태그에 onMouseOver와 onMouseOut 이벤트를 추가합니다.
                                <li
                                    key={pot.potId}
                                    className={styles.potCard}
                                    onClick={() => navigate(`/pots/${pot.potId}`)}
                                    onMouseOver={() => setHoveredPotId(pot.potId)}
                                    onMouseOut={() => setHoveredPotId(null)}
                                >
                                    <div className={styles.imageContainer}>
                                        <img src={pot.imageUrl || noImage} alt={pot.productName} className={styles.cardImage} />
                                    </div>
                                    <div className={styles.cardBody}>
                                        <p className={styles.category}>{PotCategory[pot.category] || '기타'}</p>
                                        <h3 className={styles.title}>{pot.title}</h3>
                                        <p className={styles.productName}>{pot.productName}</p>
                                        {pot.address && (
                                            <p className={styles.address}>
                                                <FontAwesomeIcon icon={faMapMarkerAlt} className={styles.addressIcon} />
                                                {pot.address}
                                            </p>
                                        )}
                                        <p className={styles.info}>
                                            참여: {pot.currentHeadcount} / {pot.maximumHeadcount}
                                            <span className={`badge ${isCompleted ? 'completed' : 'recruiting'}`}>
                                                {isCompleted ? '모집완료' : '모집중'}
                                            </span>
                                        </p>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>

            {/* 3. 오른쪽 지도 영역 */}
            <div className={styles.mapContent}>
                {/* 자식 컴포넌트(KakaoMap)에 hoveredPotId와 setHoveredPotId, map 상태와 setMap 함수를 모두 props로 전달합니다. */}
                <KakaoMap
                    userLocation={location}
                    pots={pots}
                    map={map}
                    setMap={setMap}
                    hoveredPotId={hoveredPotId}
                    setHoveredPotId={setHoveredPotId}
                />
            </div>
        </div>
    </div>
    );
};

export default MapPage;