import React from 'react';
import { Link } from 'react-router-dom';
import styles from './PotCard.module.css';
import './PotStatusBadge.css';
import { PotCategory } from '../constants/categories';
import noImage from '../assets/no-image.jpg';

const PotCard = ({ pot }) => {
    //모집 완료 여부를 확인하는 변수
    const isCompleted = pot.currentHeadcount >= pot.maximumHeadcount;

    return (
        <Link to={`/pots/${pot.potId}`} className={styles.card}>
            <div className={styles.imageContainer}>
                <img src={pot.imageUrl || noImage} alt={pot.productName} className={styles.cardImage} />
            </div>
            <div className={styles.cardBody}>
                <p className={styles.category}>{PotCategory[pot.category] || '기타'}</p>
                <h3 className={styles.title}>{pot.title}</h3>

                {/*참여 현황과 상태 배지를 함께 표시*/}
                <p className={styles.info}>
                    참여: {pot.currentHeadcount} / {pot.maximumHeadcount}
                    <span className={`badge ${isCompleted ? 'completed' : 'recruiting'}`}>
                        {isCompleted ? '모집완료': '모집중'}
                    </span>
                </p>
            </div>
        </Link>
    );
};

export default PotCard;