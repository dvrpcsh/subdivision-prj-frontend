import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const OAuth2RedirectPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        //URL의 쿼리 파라미터에서 'token' 값을 추출합니다.
        const token = searchParams.get('token');

        if(token) {
            //토큰이 없으면 로그인 페이지로 돌려보냅니다.
            alert('로그인에 실패했습니다.');
            navigate('/login');
        }
    }, [searchParams, navigate]);

    return (
        <div style={{ padding: '50px', textAlign: 'center' }}>
            <h2>로그인 처리 중입니다...</h2>
        </div>
    );
};

export default OAuth2RedirectPage;