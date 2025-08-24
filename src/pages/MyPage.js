import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const MyPage = () => {
    const [myPots, setMyPots] = useState([]);
    const [joinedPots, setJoinedPots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [nickname, setNickname] = useState('');
    const [currentUser, setCurrentUser] = useState(null);
    const [newNickname, setNewNickname] = useState('');

    //현재 사용자 정보(닉네임)을 가져오는 함수
    const fetchCurrentUser = async () => {
        const token = localStorage.getItem('jwt');
        if(!token) return;

        try {
            const response = await axios.get('http://localhost:8080/api/users/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setCurrentUser(response.data);
        } catch(err) {
            console.error("사용자 정보 로딩 실패",err);
            setError('사용자 정보를 불러오는데 실패했습니다.');
        }
    };

    useEffect(() => {
        const fetchMyPageData = async () => {
            const token = localStorage.getItem('jwt');

            if(!token) {
                setError('로그인이 필요합니다.');
                setLoading(false);

                return;
            }

            try {
                //각 API 호출에 headers를 추가합니다.
                const config = {
                    headers: { 'Authorization': `Bearer ${token}`}
                };

                //두 개의 API를 동시에 호출합니다.
                const [myPotsRes, joinedPotsRes] = await Promise.all([
                    axios.get('http://localhost:8080/api/mypage/my-pots', config),
                    axios.get('http://localhost:8080/api/mypage/joined-pots',config)
                ]);

                // API 응답이 배열인지 확인하고, 아니면 빈 배열로 설정
                setMyPots(Array.isArray(myPotsRes.data) ? myPotsRes.data : []);
                setJoinedPots(Array.isArray(joinedPotsRes.data) ? joinedPotsRes.data : []);
            } catch(err) {
                setError('데이터를 불러오는 데 실패했습니다.');
                //에러 발생 시에도 안전한게 빈 배열로 초기화합니다.
                setMyPots([]);
                setJoinedPots([]);
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        setLoading(true);
        //두 API를 동시에 호출
        Promise.all([fetchMyPageData(), fetchCurrentUser()]).finally(() => setLoading(false));
    }, []);

    // 닉네임 변경 제출 핸들러
    const handleNicknameUpdate = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('jwt');
        if (!newNickname  || newNickname .trim() === '') {
            alert('변경할 닉네임을 입력해주세요.');
            return;
        }

        try {
            await axios.patch('http://localhost:8080/api/mypage/nickname',
                { nickname: newNickname },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            alert('닉네임이 성공적으로 변경되었습니다.');

            //현재 사용자 정보를 즉시 업데이트합니다.
            setCurrentUser(prevUser => ({
                ...prevUser,
                nickname: newNickname
            }));

            // 입력창을 비웁니다.
            setNewNickname('');
        } catch (err) {
            console.log("닉네임 변경 실패 응답==",err.response);
            if (err.response && err.response.data && err.response.data.message) {
                alert(err.response.data.message);
            } else if (err.response && typeof err.response.data === 'string') {
                // 가끔 문자열로 바로 에러 메시지가 오는 경우도 처리
                alert(err.response.data);
            } else {
                alert('닉네임 변경에 실패했습니다.');
            }
            console.error(err);
        }
    };

    if(loading) return <div>로딩 중...</div>;
    if(error) return <div>{error}</div>;

    return (
        <div style={{ padding: '20px' }}>
            <h2>마이페이지</h2>
            <hr />

            {/* 닉네임 변경 폼 */}
            <div style={{ marginBottom: '30px' }}>
                <h3>프로필 정보</h3>
                <p>이메일: {currentUser ? currentUser.email : '로딩 중...'}</p>
                <p>현재 닉네임: {currentUser ? currentUser.nickname : '로딩 중...'}</p>

                <form onSubmit={handleNicknameUpdate} style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '10px' }}>
                    <label>변경할 닉네임</label>
                    <input
                        type="text"
                        value={newNickname}
                        onChange={(e) => setNewNickname(e.target.value)}
                        placeholder="새로운 닉네임을 입력하세요"
                        style={{ padding: '8px' }}
                    />
                    <button type="submit">닉네임 변경</button>
                </form>
            </div>

            <h3>내가 만든 팟</h3>
            {/* myPots state를 직접 사용하여 목록을 렌더링합니다. */}
            {myPots.length > 0 ? (
                <ul>
                    {myPots.map(pot => (
                        <li key={`my-${pot.potId}`}>
                            <Link to={`/pots/${pot.potId}`}>{pot.title}</Link>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>내가 만든 팟이 없습니다.</p>
            )}

            <hr style={{ marginTop: '30px' }} />

            <h3>내가 참여한 팟</h3>
            {/* joinedPots state를 직접 사용하여 목록을 렌더링합니다. */}
            {joinedPots.length > 0 ? (
                <ul>
                    {joinedPots.map(pot => (
                        <li key={`joined-${pot.potId}`}>
                            <Link to={`/pots/${pot.potId}`}>{pot.title}</Link>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>참여한 팟이 없습니다.</p>
            )}
        </div>
    );
};

export default MyPage;