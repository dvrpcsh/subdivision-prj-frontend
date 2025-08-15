import React, { useState, useEffect } from 'react';
import axios from 'axios';

//부모로부터 jwt와 onLogout 함수를 props로 받습니다.
function PotListPage({jwt, onLogout}) {
    const [pots, setPots] = useState([]);

    useEffect(() => {
        const fetchPots = async() => {
            try {
                const response = await axios.get("http://localhost:8080/api/pots", {
                    headers: { 'Authorization': `Bearer ${jwt}` }
                });
                setPots(response.data);
            } catch(error) {
                console.error("팟 목록 로딩 실패:", error);
            }
        };

        if(jwt) {
            fetchPots();
        }
    }, [jwt]); //jwt가 변경될 때 마다 데이터를 다시 불러옵니다.

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