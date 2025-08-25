import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PotCard from '../components/PotCard';
import { PotCategory } from '../constants/categories';
import styles from './HomePage.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

const HomePage = () => {
    const [pots, setPots] = useState([]);
    const [page, setPage] = useState(0); //현재 페이지 번호
    const [totalPages, setTotalPages] = useState(0); //전체 페이지 수
    const [loading, setLoading] = useState(false);

    //검색과 필터를 위한 state
    const [searchTerm, setSearchTerm] = useState('');
    const [category, setCategory] = useState(null);
    const [status, setStatus] = useState(null);

    useEffect(() => {
        const fetchPots = async () => {
            setLoading(true);
            try {
                //API 호출을 /api/pots/search 엔드포인트로 변경
                const params = {
                    lat: 35.179554,
                    lon: 129.075642,
                    distance: 50,
                    page: page,
                    size: 8,
                    keyword: searchTerm || null,
                    category: category,
                    status: status
                };

                console.log("API 요청 파라미터:", params);

                const response = await axios.get('http://localhost:8080/api/pots/search', { params });

                setPots(response.data?.content || []);
                setTotalPages(response.data?.totalPages || 0);
            } catch(error) {
                console.error("전체 팟 목록을 불러오는 데 실패했습니다.", error);
                setPots([]);
            }
            setLoading(false);
        };
        fetchPots();
    }, [page, searchTerm, category, status]); //page가 변경될 때 마다 데이터를 다시 불러옵니다.

    //토글 스위치 상태 변경 핸들러
    const handleStatusToggle = (e) => {
        //체크되면 'RECRUITING', 해제되면 null(전체보기) 상태로 변경
        setStatus(e.target.checked ? 'RECRUITING' : null);
    }

    return (
        <div className={styles.container}>
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

                <div className={styles.grid}>
                    {pots.map(pot => (
                        <PotCard key={pot.potId} pot={pot} />
                    ))}
                </div>

                {/* 페이지네이션 UI */}
                <div className={styles.pagination}>
                    <button onClick={() => setPage(p => Math.max(0, p-1))} disabled={page === 0}>
                        이전
                    </button>
                    <span>{page + 1} / {totalPages}</span>
                    <button onClick={() => setPage(p => Math.min(totalPages-1, p+1))} disabled={page === totalPages-1}>
                        다음
                    </button>
                </div>

            </div>
        </div>
    );
};

export default HomePage;