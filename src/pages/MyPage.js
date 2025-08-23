import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const MyPage = () => {
    //const [activeTab, setActiveTab] = useState([]);
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
                //각 API 호출에 headers를 추가합니다.
                const config = {
                    headers: { 'Authorization': `Bearer ${token}`}
                };

                //두 개의 API를 동시에 호출합니다.
                const [myPotsRes, joinedPotsRes] = await Promise.all([
                    axios.get('http://localhost:8080/api/mypage/my-pots', config),
                    axios.get('http://localhost:8080/api/mypage/joined-pots',config)
                ]);

                console.log("내가 만든 팟 API 응답:", myPotsRes.data);
                console.log("내가 만든 팟 데이터 타입:", Array.isArray(myPotsRes.data));

                console.log("내가 참여한 팟 API 응답:", joinedPotsRes.data);
                console.log("내가 참여한 팟 데이터 타입:", Array.isArray(joinedPotsRes.data));

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

        fetchMyPageData();
    }, []);

    if(loading) return <div>로딩 중...</div>;
    if(error) return <div>{error}</div>;

    //탭에 따라 보여줄 목록을 결정하는 함수
    /*
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
    */
    return (
        <div style={{ padding: '20px' }}>
            <h2>마이페이지</h2>
            <hr />

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