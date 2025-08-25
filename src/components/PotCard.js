import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './PotCard.module.css';
import './PotStatusBadge.css';
import { PotCategory } from '../constants/categories';
import noImage from '../assets/no-image.jpg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';

const PotCard = ({ pot }) => {
    const navigate = useNavigate();
    //모집 완료 여부를 확인하는 변수
    const isCompleted = pot.currentHeadcount >= pot.maximumHeadcount;

    /**
     * 카드 클릭 시 실행될 핸들러 함수를 새로 만듭니다.
     * 이 함수 안에서 로그인 여부를 확인하고 조건에 따라 다른 페이지로 이동시킵니다.
     */
    const handleCardClick = () => {
        // 로컬 스토리지에서 'jwt' 토큰을 가져옵니다.
        const token = localStorage.getItem('jwt');

        if (token) {
            // 토큰이 있으면 (로그인 상태), 상세 페이지로 이동합니다.
            navigate(`/pots/${pot.potId}`);
        } else {
            // 토큰이 없으면 (로그인 안 한 상태), 알림을 띄우고 로그인 페이지로 이동합니다.
            alert('로그인이 필요한 서비스입니다.');
            navigate('/login');
        }
    };

    return (
        <div onClick={handleCardClick} className={styles.card}>
            <div className={styles.imageContainer}>
                <img src={pot.imageUrl || noImage} alt={pot.productName} className={styles.cardImage} />
            </div>
            <div className={styles.cardBody}>
                {/* 1. 카테고리 */}
                <p className={styles.category}>{PotCategory[pot.category] || '기타'}</p>

                {/* 2. 제목 */}
                <h3 className={styles.title}>{pot.title}</h3>

                {/* 3. 상품명 */}
                <p className={styles.productName}>{pot.productName}</p>

                {/* [수정 2] 4. 주소 (아이콘과 함께 표시) */}
                {/* pot 객체에 address 필드가 있을 경우에만 이 부분을 렌더링합니다. */}
                {pot.address && (
                    <p className={styles.address}>
                        <FontAwesomeIcon icon={faMapMarkerAlt} className={styles.addressIcon} />
                        {pot.address}
                    </p>
                )}

                {/* 참여 현황과 상태 배지 */}
                <p className={styles.info}>
                    참여: {pot.currentHeadcount} / {pot.maximumHeadcount}
                    <span className={`badge ${isCompleted ? 'completed' : 'recruiting'}`}>
                        {isCompleted ? '모집완료': '모집중'}
                    </span>
                </p>
            </div>
        </div>
    );
};

export default PotCard;