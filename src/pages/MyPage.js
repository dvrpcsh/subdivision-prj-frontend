import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const MyPage = () => {
    const [activeTab, setActiveTab] = useState([]);
    const [myPots, setMyPots] = useState([]);
    const [joinedPots, setJoinedPots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchMyPageData = async () => {
            const token = localStorage.getItem('jwt');

            if(!token) {
                setError('로그인이 필요합니다.');
                setLoading(false);

                return;
            }

            try {
                //두 개의 API를 동시에 호출합니다.
                const [myPotsRes, joinedPotsRes] = await Promise.all([
                    axios.get('http://localhost:8080/api/mypage/my-pots', {
                       headers: { 'Authorization': `Bearer ${token}` }
                    }),
                    axios.get('http://localhost:8080/api/mypage/joined-pots', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    })
                ]);

                setMyPots(myPotsRes.data);
                setJoinedPots(joinedPotsRes.data);
            } catch(err) {
                setError('데이터를 불러오는 데 실패했습니다.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchMyPageData();
    }, []);

    if(loading) return <div>로딩 중...</div>;
    if(error) return <div>{error}</div>;

    //탭에 따라 보여줄 목록을 결정하는 함수
    const renderPotList = () => {
        const pots = activeTab === 'my' ? myPots : joinedPots;
        const emptyMessage = activeTab === 'my' ? '내가 만든 팟이 없습니다.' : '참여한 팟이 없습니다.';

        if(pots.length === 0) {
            return <p>{emptyMessage}</p>;
        }

        return (
            <ul>
                {pots.map(pot => (
                    <li key={`${activeTab}-${pot.potId}`}>
                        <Link to={`/pots/${pot.potId}`}>{pot.title}</Link>
                    </li>
                ))}
            </ul>
        );
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>마이페이지</h2>
            <hr />

            {/* 탭 버튼 UT*/}
            <div style={{ marginBottom: '20px' }}>
                <button
                    onClick={() => setActiveTab('my')}
                    style={{
                        padding: '10px 15px',
                        marginRight: '10px',
                        cursor: 'pointer',
                        backgroundColor: activeTab === 'my' ? '#61dafb' : 'gray'
                    }}
                >
                    내가 만든 팟 ({myPots.length})
                </button>
                <button
                    onClick={() => setActiveTab('joined')}
                    style={{
                        padding: '10px 15px',
                        cursor: 'pointer',
                        backgroundColor: activeTab === 'joined' ? '#61dafb' : 'gray'
                    }}
                >
                    내가 참여한 팟 ({joinedPots.length})
                </button>
            </div>

            { /* 선택된 탭에 맞는 목록을 렌더링 */ }
            <div>
                {renderPotList()}
            </div>
        </div>
    );
};

export default MyPage;