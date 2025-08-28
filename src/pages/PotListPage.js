import React, { useState, useEffect, useContext } from 'react';
import api from '../api';

//부모로부터 jwt와 onLogout 함수를 props로 받습니다.
function PotListPage() {
    const [pots, setPots] = useState([]);
    const { logout } = useContext(AuthContext);

    useEffect(() => {
        const fetchPots = async() => {
            try {
                const response = await api.get('/api/pots');
                setPots(response.data);
            } catch(error) {
                console.error("팟 목록 로딩 실패:", error);
            }
        };

        if(jwt) {
            fetchPots();
        }
    }, []);

    return (
        <div>
            <button onClick={onLogout}>로그아웃</button>
            <h2>팟 목록</h2>
            <ul>
                {pots.map(pot => (
                    <li key={pot.potId}>
                        <h3>{pot.title} (모집: {pot.currentHeadcount}/{pot.maximumHeadcount})</h3>
                        <p>작성자: {pot.authorNickname}</p>
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default PotListPage;