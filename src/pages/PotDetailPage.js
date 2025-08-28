import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { Map, MapMarker } from 'react-kakao-maps-sdk';
import '../components/PotStatusBadge.css';
import noImage from '../assets/no-image.jpg';
import './PotDetailPage.css';
import { PotCategory } from '../constants/categories';
import ChatRoom from '../components/ChatRoom';

const PotDetailPage = () => {

    //URL 경로의 파라미터(:potId)를 가져옵니다.
    const { potId } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useContext(AuthContext);

    //팟 상세 정보를 저장할 state
    const [pot, setPot] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // 채팅 모달의 열림/닫힘 상태를 관리하는 state 추가
    const [isChatOpen, setIsChatOpen] = useState(false);

    //페이지가 열람될 때 한 번만 API를 호출합니다.
    const fetchPotDetails = async () => {
        try {
            const response = await api.get(`/api/pots/${potId}`);
            setPot(response.data);
        } catch (err) {
            setError('게시물을 불러오는 데 실패했습니다.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // 페이지가 처음 열릴 때 팟 상세 정보를 불러옵니다.
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
                await api.delete(`/api/pots/${potId}`);
                alert('팟이 삭제되었습니다.');
                navigate('/map'); // 메인 페이지로 이동
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
            await api.post(`/api/pots/${potId}/join`);
            alert('팟 참여가 완료되었습니다.');
            fetchPotDetails(); // 참여 후 최신 정보로 갱신
        } catch (err) {
            alert(err.response?.data.message || '팟 참여에 실패했습니다.');
        }
    };

    //팟 참여 취소 핸들러
    const handleLeave = async () => {
        if (window.confirm('정말로 팟 참여를 취소하시겠습니까?')) {
            try {
                await api.delete(`/api/pots/${potId}/leave`);
                alert('팟 참여를 취소했습니다.');
                fetchPotDetails(); // 취소 후 최신 정보로 갱신
            } catch (err) {
                alert(err.response?.data.message || '참여 취소에 실패했습니다.');
            }
        }
    };

    //현재 사용자가 작성자인지 확인
    const isOwner = currentUser && pot && currentUser.nickname === pot.authorNickname;
    //모집인원에 따른 모집중/모집완료 구분 값
    const isFull = pot.currentHeadcount >= pot.maximumHeadcount;

    if(!pot) return <div>게시물 정보를 찾을 수 없습니다.</div>;

    //모집 완료 여부를 확인하는 변수
    const isCompleted = pot.currentHeadcount >= pot.maximumHeadcount;

    //content의 줄바꿈(\n)을 <br> 태그로 변환한 HTML 문자열을 미리 만듭니다.
    const contentWithBreaks = pot.content.replace(/\n/g, '<br />');

    //팟에 참여했는지 여부를 나타내는 변수
    const isJoined = currentUser && pot.members?.some(p => p.nickname === currentUser.nickname);

    //성공적으로 데이터를 받아왔을 때 상세 정보 표시
    return (
        <>
            <div className="pot-detail-container">
                <div className="detail-grid">
                    {/* --- 좌측 영역: 이미지 및 지도 --- */}
                    <div className="left-column">
                        <div className="pot-image-wrapper"><img src={pot.imageUrl || noImage} alt={pot.productName} /></div>
                        <div className="pot-map-wrapper">
                            <Map center={{ lat: pot.latitude, lng: pot.longitude }} style={{ width: '100%', height: '100%' }} level={3} draggable={false}>
                                <MapMarker position={{ lat: pot.latitude, lng: pot.longitude }} />
                            </Map>
                        </div>
                    </div>

                    {/* --- 우측 영역: 정보 및 액션 --- */}
                    <div className="right-column">
                        <div className="pot-header">
                            <span className="pot-category">{PotCategory[pot.category] || pot.category}</span>
                            <h1 className="pot-title">{pot.title}</h1>
                            <p className="creator-info">작성자: {pot.authorNickname}</p>
                        </div>

                        <div className="pot-info-section">
                            <h3>상품 정보</h3>
                            <p><strong>상품명:</strong> {pot.productName}</p>
                            <p><strong>거래 위치:</strong> {pot.address} {pot.detailAddress}</p>
                            <p><strong>총 가격:</strong> {pot.price ? pot.price.toLocaleString() : '0'}원</p>
                            <p><strong>내용:</strong></p>
                            <p className="pot-content">{pot.content}</p>
                        </div>

                        <div className="pot-info-section">
                            <h3>참여 현황</h3>
                            <p><strong>참여 인원:</strong> {pot.currentHeadcount} / {pot.maximumHeadcount} 명</p>
                            <p><strong>1인당 부담 비용:</strong> {pot.price ? Math.floor(pot.price / pot.maximumHeadcount).toLocaleString() : '0'}원</p>
                            <div className="participants-list">
                                <strong>참여자:</strong>
                                {pot.members.map((member, index) => <span key={index} className="participant-tag">{member.nickname}</span>)}
                            </div>
                        </div>

                        {/* --- 액션 버튼 영역 --- */}
                        <div className="action-buttons">
                            {isOwner ? (
                                <>
                                    {/* 채팅방 참여 버튼을 추가하고, isJoined 로직을 통합합니다. */}
                                    <button onClick={() => setIsChatOpen(true)} className="chat-button">채팅방 참여</button>
                                    <button onClick={handleEdit} className="edit-button">수정하기</button>
                                    <button onClick={handleDelete} className="delete-button">삭제하기</button>
                                </>
                            ) : isJoined ? (
                                <>
                                    <button onClick={() => setIsChatOpen(true)} className="chat-button">채팅방 보기</button>
                                    <button onClick={handleLeave} className="leave-button">참여 취소하기</button>
                                </>
                            ) : isFull ? (
                                <button className="join-button disabled" disabled>모집 마감</button>
                            ) : (
                                <button onClick={handleJoin} className="join-button">참여하기</button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* isChatOpen이 true일 때만 채팅 모달을 화면에 렌더링합니다. */}
            {isChatOpen && (
                <div className="chat-modal-overlay">
                    <div className="chat-modal-content">
                        <button onClick={() => setIsChatOpen(false)} className="chat-close-button">×</button>
                        <ChatRoom potId={potId} />
                    </div>
                </div>
            )}
        </>
  );
};

export default PotDetailPage;