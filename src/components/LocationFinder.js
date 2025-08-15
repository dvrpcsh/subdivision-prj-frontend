import React, { useState, useEffect } from 'react';

// 이 컴포넌트는 사용자의 현재 위치를 찾아 그 좌표를 화면에 표시하는 역할을 합니다.
const LocationFinder = () => {
    //사용자의 위치 정보를 저장할 state(latitude, longitude)
    const [location, setLocation] = useState(null);
    //오류 메시지를 저장할 state
    const [error, setError] = useState('');

    //컴포넌트가 처음 렌더링될 때 한 번만 실행됩니다.
    useEffect(() => {
        //Geolocation API가 브라우저에서 지원되는지 확인합니다.
        if(!navigator.geolocation) {
            setError('Geolocation is not supported by your browser.');

            return;
        }

        //getCurrentPosition 메서드를 호출하여 사용자의 현재 위치를 요청합니다.
        //이 함수는 성공 콜백과 실패 콜백, 두 개의 함수를 인자로 받습니다.
        navigator.geolocation.getCurrentPosition(handleSuccess, handleError);
    }, []); //빈 배열을 전달하여 최초 렌더링 시에만 실행되도록 합니다.

    //위치 정보 요청에 성공했을 때 실행될 콜백 함수입니다.
    const handleSuccess = (position) => {
        const { latitude, longitude } = position.coords;
        //받아온 위도와 경도 값을 location state에 저장합니다.
        setLocation({
            latitude,
            longitude
        });
    };

    //위치 정보 요청에 실패했을 때 실행될 콜백 함수입니다.
    const handleError = (error) => {
        setError(error.message);
    };

    return (
        <div>
            <h2>내 위치 찾기</h2>
            {location ? (
                <p>
                    위도 (Latitude): {location.latitude}, 경도 (Longitude): {location.longitude}
                </p>
            ) : (
                <p>{error ? `오류: ${error}` : '위치를 찾는 중...'}</p>
            )}
        </div>
    );
};

export default LocationFinder;