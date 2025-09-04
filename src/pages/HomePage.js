import React, { useState, useEffect, useContext } from 'react';
import PotCard from '../components/PotCard';
import { PotCategory } from '../constants/categories';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import styles from './HomePage.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import api from '../api';

const HomePage = () => {
    const [pots, setPots] = useState([]);
    const [page, setPage] = useState(0); //현재 페이지 번호
    const [totalPages, setTotalPages] = useState(0); //전체 페이지 수
    const [loading, setLoading] = useState(false); //로딩 상태를 관리
    const [error, setError] = useState(''); // 에러 상태도 함께 관리

    //검색과 필터를 위한 state
    const [searchTerm, setSearchTerm] = useState('');
    const [category, setCategory] = useState(null);
    const [status, setStatus] = useState(null);

    const navigate = useNavigate();
    const { currentUser } = useContext(AuthContext);

    // 로그인된 사용자가 HomePage에 접근하면 자동으로 MapPage로 리디렉션
    useEffect(() => {
        if (currentUser) {
            navigate('/map', { replace: true });
        }
    }, [currentUser, navigate]);

    //'우리 동네 팟 찾기' 버튼 클릭 핸들러
    const handleCtaClick = () => {
        const token = localStorage.getItem('jwt');
        if (token) {
            navigate('/map');
        } else {
            alert('로그인이 필요한 서비스입니다.');
            navigate('/login');
        }
    };

    useEffect(() => {
        // 로그인된 사용자는 이 페이지를 볼 수 없으므로 API 호출하지 않음
        if (currentUser) return;

        const fetchPots = async () => {
            setLoading(true);
            try {
                const params = {
                    lat: 35.179554,
                    lon: 129.075642,
                    distance: 500,
                    page: page,
                    size: 8,
                    keyword: searchTerm || null,
                    category: category,
                    status: status
                };

                console.log("API 요청 파라미터:", params);

                const response = await api.get('/api/pots/search', { params });

                setPots(response.data?.content || []);
                setTotalPages(response.data?.totalPages || 0);
            } catch(error) {
                console.error("전체 팟 목록을 불러오는 데 실패했습니다.", error);
                setPots([]);
            }
            setLoading(false);
        };
        fetchPots();
    }, [page, searchTerm, category, status, currentUser]);

    //로딩 및 에러 상태에 따라 다른 UI를 보여주는 함수
    const renderContent = () => {
        if (loading) {
            return <p className={styles.infoText}>팟 목록을 불러오는 중입니다...</p>;
        }
        if (error) {
            return <p className={styles.errorText}>{error}</p>;
        }
        if (pots.length === 0) {
            return <p className={styles.infoText}>주변에 진행 중인 팟이 없습니다.</p>;
        }
        return (
            <div className={styles.grid}>
                {pots.map(pot => (
                    <PotCard key={pot.potId} pot={pot} />
                ))}
            </div>
        );
    };

    //토글 스위치 상태 변경 핸들러
    const handleStatusToggle = (e) => {
        //체크되면 'RECRUITING', 해제되면 null(전체보기) 상태로 변경
        setStatus(e.target.checked ? 'RECRUITING' : null);
    }

    return (
        <div className={styles.container}>
            {/*주변 팟 찾기 클릭*/}
            <div className={styles.ctaSection}>
                <h2 onClick={handleCtaClick} className={styles.ctaText}>
                    우리 동네 근처 팟 찾으러가기(클릭)!
                </h2>
            </div>
            {/* 검색 및 카테고리 필터 UI */}
            <div className={styles.filters}>

                <div className={styles.searchBar}>
                    <div className={styles.toggleContainer}>
                        <label className={styles.toggleSwitch}>
                            <input
                                type="checkbox"
                                checked={status === 'RECRUITING'}
                                onChange={handleStatusToggle}
                            />
                            <span className={styles.toggleSlider}></span>
                        </label>
                        <span>모집중</span>
                    </div>

                    <div className={styles.searchContainer}>
                        <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
                        <input
                            type="search"
                            placeholder="상품을 검색하세요..."
                            className={styles.searchInput}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className={styles.categoryButtons}>
                    <button
                        className={!category ? styles.active : ''}
                        onClick={() => setCategory(null)}
                    >
                        전체
                    </button>
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

                {renderContent()}

                {/* 페이지네이션 UI */}
                <div className={styles.pagination}>
                    {/* 이전 페이지 버튼 */}
                    <button
                        onClick={() => setPage(page - 1)}
                        disabled={page === 0}
                        className={styles.pageButton}
                    >
                        &lt;
                    </button>

                    {/* 페이지 번호 버튼들 */}
                    {/* Array.from을 사용하여 전체 페이지 수만큼 배열을 만들고, 각 페이지 번호에 대한 버튼을 생성합니다. */}
                    {Array.from({ length: totalPages }, (_, i) => (
                        <button
                            key={i}
                            onClick={() => setPage(i)}
                            className={`${styles.pageButton} ${page === i ? styles.active : ''}`}
                        >
                            {i + 1}
                        </button>
                    ))}

                    {/* 다음 페이지 버튼 */}
                    <button
                        onClick={() => setPage(page + 1)}
                        disabled={page === totalPages - 1}
                        className={styles.pageButton}
                    >
                        &gt;
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HomePage;