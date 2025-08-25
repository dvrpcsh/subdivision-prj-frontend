import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './PotDetailPage.module.css';
import { AuthContext } from '../context/AuthContext';
import '../components/PotStatusBadge.css';

const PotDetailPage = () => {

    //URL 경로의 파라미터(:potId)를 가져옵니다.
    const { potId } = useParams();
    const navigate = useNavigate();

    //팟 상세 정보를 저장할 state
    const [pot, setPot] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    //Context에서 현재 사용자 정보 가져오기
    const { currentUser } = useContext(AuthContext);

    //페이지가 열람될 때 한 번만 API를 호출합니다.
    const fetchPotDetails = async () => {
        try {
            const token = localStorage.getItem('jwt');
            const response = await axios.get(`http://localhost:8080/api/pots/${potId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setPot(response.data);
        } catch (err) {
            setError('게시물을 불러오는 데 실패했습니다.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPotDetails();
    }, [potId]);

    //로딩 및 에러 상태에 따른 UI 표시
    if(loading) return <div>로딩 중...</div>;
    if(error) return <div>{error}</div>;
    if(!pot) return <div>게시물 정보를 찾을 수 없습니다.</div>;

    //삭제 버튼 핸들러
    const handleDelete = async () => {
        if (window.confirm('정말로 이 팟을 삭제하시겠습니까?')) {
            try {
                const token = localStorage.getItem('jwt');
                await axios.delete(`http://localhost:8080/api/pots/${potId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                alert('팟이 삭제되었습니다.');
                navigate('/'); // 메인 페이지로 이동
            } catch (err) {
                alert('삭제에 실패했습니다.');
                console.error(err);
            }
        }
    };

    //수정 버튼 핸들러
    const handleEdit = () => {
        //수정 페이지 경로로 이동합니다.
        navigate(`/pots/${potId}/edit`)
    }

    //팟 참여 핸들러
    const handleJoin = async () => {
        try {
            const token = localStorage.getItem('jwt');
            await axios.post(`http://localhost:8080/api/pots/${potId}/join`, {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            alert('팟 참여가 완료되었습니다.');
            fetchPotDetails(); // 상태를 갱신하기 위해 데이터를 다시 불러옵니다.
        } catch (err) {
            alert(err.response?.data.message || '팟 참여에 실패했습니다.');
        }
    };

    //팟 참여 취소 핸들러
    const handleLeave = async () => {
        if (window.confirm('정말로 팟 참여를 취소하시겠습니까?')) {
            try {
                const token = localStorage.getItem('jwt');
                await axios.delete(`http://localhost:8080/api/pots/${potId}/leave`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                alert('팟 참여를 취소했습니다.');
                fetchPotDetails(); // 상태를 갱신하기 위해 데이터를 다시 불러옵니다.
            } catch (err) {
                alert(err.response?.data.message || '참여 취소에 실패했습니다.');
            }
        }
    };

    //현재 사용자가 작성자인지 확인
    const isAuthor = currentUser && pot && currentUser.nickname === pot.authorNickname;
    //모집인원에 따른 모집중/모집완료 구분 값
    const isFull = pot.currentHeadcount >= pot.maximumHeadcount;

    if(!pot) return <div>게시물 정보를 찾을 수 없습니다.</div>;

    //모집 완료 여부를 확인하는 변수
    const isCompleted = pot.currentHeadcount >= pot.maximumHeadcount;

    //성공적으로 데이터를 받아왔을 때 상세 정보 표시
    return (
        <div className={styles.pageContainer}>
          <button onClick={() => navigate('/')} className={styles.backButton}>
            ← 목록으로 돌아가기
          </button>

          <div className={styles.potHeader}>
            <h1>{pot.title}</h1>
            <p className={styles.author}>작성자: {pot.authorNickname}</p>

            {/* 버튼 렌더링 로직 */}
            <div className={styles.buttonGroup}>
                {isAuthor ? (
                    <>
                        <button onClick={handleEdit} className={styles.editButton}>수정</button>
                        <button onClick={handleDelete} className={styles.deleteButton}>삭제</button>
                    </>
                ) : pot.currentUserJoined ? (
                    <button onClick={handleLeave} className={styles.leaveButton}>참여 취소하기</button>
                ) : isFull ? (
                    <button className={styles.disabledButton} disabled>모집 마감</button>
                ) : (
                    <button onClick={handleJoin} className={styles.joinButton}>팟 참여하기</button>
                )}
            </div>
          </div>

          {pot.imageUrl && (
            <div className={styles.imageContainer}>
              <img src={pot.imageUrl} alt={pot.productName} className={styles.potImage} />
            </div>
          )}

          <div className={styles.section}>
            <h3>상품 정보</h3>
            <p><strong>상품명:</strong> {pot.productName}</p>
            {/* dangerouslySetInnerHTML을 사용하여 줄바꿈(\n)을 <br>로 렌더링 */}
            <p><strong>내용:</strong> <span dangerouslySetInnerHTML={{ __html: pot.content.replace(/\n/g, '<br />') }} /></p>
          </div>

          <div className={styles.section}>
            <h3>참여 현황</h3>
            <p>{pot.currentHeadcount} / {pot.maximumHeadcount} 명
            <span className={`badge ${isCompleted ? 'completed' : 'completed'}`}>
              {isCompleted ? '모집완료' : '모집중'}
            </span>
            </p>
            <h4>참여자 목록</h4>
            <ul className={styles.memberList}>
              {pot.members.map((member, index) => (
                <li key={index}>{member.nickname}</li>
              ))}
            </ul>
          </div>
        </div>
  );
};

export default PotDetailPage;