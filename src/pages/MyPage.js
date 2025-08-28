import React, { useState, useEffect, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import PotCard from '../components/PotCard';
// [핵심 수정] '.module.css'를 제거하여 일반 CSS 파일로 불러옵니다.
import './MyPage.css';

const MyPage = () => {
    const { currentUser } = useContext(AuthContext);
    const [myPots, setMyPots] = useState([]);
    const [joinedPots, setJoinedPots] = useState([]);
    const [activeTab, setActiveTab] = useState('myPots');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [newNickname, setNewNickname] = useState(currentUser?.nickname || '');

    useEffect(() => {
        const fetchMyPageData = async () => {
            const token = localStorage.getItem('jwt');
            if (!token) {
                setError('로그인이 필요합니다.');
                setLoading(false);
                return;
            }
            try {
                const config = { headers: { 'Authorization': `Bearer ${token}` } };
                const [myPotsRes, joinedPotsRes] = await Promise.all([
                    api.get('/api/mypage/my-pots', config),
                    api.get('/api/mypage/joined-pots', config)
                ]);
                setMyPots(Array.isArray(myPotsRes.data) ? myPotsRes.data : []);
                setJoinedPots(Array.isArray(joinedPotsRes.data) ? joinedPotsRes.data : []);
            } catch (err) {
                setError('데이터를 불러오는 데 실패했습니다.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchMyPageData();
    }, []);

    const handleNicknameUpdate = async () => {
        const token = localStorage.getItem('jwt');
        if (!newNickname.trim()) {
            alert('변경할 닉네임을 입력해주세요.');
            return;
        }
        try {
            await api.patch('/api/mypage/nickname',
                { nickname: newNickname },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            alert('닉네임이 성공적으로 변경되었습니다.');
            window.location.reload();
        } catch (err) {
            alert(err.response?.data?.message || '닉네임 변경에 실패했습니다.');
            console.error(err);
        }
    };

    if (loading) return <div>로딩 중...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="mypage-container">
            <div className="profile-card">
                <div className="profile-info">
                    <span className="profile-greeting">안녕하세요!</span>
                    {isEditing ? (
                        <div className="nickname-edit-form">
                            <input
                                type="text"
                                value={newNickname}
                                onChange={(e) => setNewNickname(e.target.value)}
                                className="nickname-input"
                                placeholder="새 닉네임"
                            />
                            <button onClick={handleNicknameUpdate} className="save-btn">저장</button>
                            <button onClick={() => setIsEditing(false)} className="cancel-btn">취소</button>
                        </div>
                    ) : (
                        <div className="nickname-display">
                            <h2 className="nickname">{currentUser?.nickname}님</h2>
                            <button onClick={() => setIsEditing(true)} className="edit-btn">닉네임 변경</button>
                        </div>
                    )}
                    <p className="email">{currentUser?.email}</p>
                </div>
            </div>

            <div className="pot-tabs">
                <button
                    className={`tab-btn ${activeTab === 'myPots' ? 'active' : ''}`}
                    onClick={() => setActiveTab('myPots')}
                >
                    내가 만든 팟 ({myPots.length})
                </button>
                <button
                    className={`tab-btn ${activeTab === 'joinedPots' ? 'active' : ''}`}
                    onClick={() => setActiveTab('joinedPots')}
                >
                    내가 참여한 팟 ({joinedPots.length})
                </button>
            </div>

            <div className="pot-list-container">
                {activeTab === 'myPots' && (
                    <div className="pot-grid">
                        {myPots.length > 0 ? (
                            myPots.map(pot => <PotCard key={`my-${pot.potId}`} pot={pot} />)
                        ) : (
                            <p className="empty-message">아직 직접 만든 팟이 없어요.</p>
                        )}
                    </div>
                )}
                {activeTab === 'joinedPots' && (
                    <div className="pot-grid">
                        {joinedPots.length > 0 ? (
                            joinedPots.map(pot => <PotCard key={`joined-${pot.potId}`} pot={pot} />)
                        ) : (
                            <p className="empty-message">아직 참여한 팟이 없어요.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyPage;
