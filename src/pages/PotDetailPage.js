import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const PotDetailPage = () => {
    //URL 경로의 파라미터(:potId)를 가져옵니다.
    const { potId } = useParams();
    const navigate = useNavigate();

    //팟 상세 정보를 저장할 state
    const [pot, setPot] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    //이전 페이지로 이동
    const handleGoBack = () => {
        navigate(-1);
    }

    //페이지가 열람될 때 한 번만 API를 호출합니다.
    useEffect(() => {
        const fetchPotDetails = async () => {
            try{
                const token = localStorage.getItem('jwt');
                const response = await axios.get(`http://localhost:8080/api/pots/${potId}`, {
                    headers: { 'Authorization':`Bearer ${token}`}
                });
                setPot(response.data);
            } catch(err) {
                setError('게시물을 불러오는 데 실패했습니다.');
                console.log(err);
            } finally {
                setLoading(false);
            }
        };

        fetchPotDetails();
    }, [potId]); //potId가 변경될 때 마다 다시 호출합니다.

    //로딩 및 에러 상태에 따른 UI 표시
    if(loading) return <div>로딩 중...</div>;
    if(error) return <div>{error}</div>;
    if(!pot) return <div>게시물 정보를 찾을 수 없습니다.</div>;

    //성공적으로 데이터를 받아왔을 때 상세 정보 표시
    return (
        <div style={{ padding: '20px' }}>
            {/* 뒤로가기 버튼 추가*/}
            <button
                onClick={handleGoBack}
                style={{ marginBottom: '20px', padding: '8px 15px', cursor: 'pointer' }}
            >
                ← 뒤로가기
            </button>

            <h1>{pot.title}</h1>
            <p><strong>작성자:</strong> {pot.authorNickname}</p>
            <hr />
            <h3>상품 정보</h3>
            <p><strong>상품명:</strong> {pot.productName}</p>
            <p><strong>내용: </strong> {pot.content}</p>
            <hr />
            <h3>참여 현황</h3>
            <p>{pot.currentHeadcount} / {pot.maximumHeadcount} 명</p>
            <h4>참여자 목록</h4>
            <ul>
                {pot.members.map((member, index) => (
                    <li key={index}>{member.nickname}</li>
                ))}
            </ul>
        </div>
    );
};

export default PotDetailPage;