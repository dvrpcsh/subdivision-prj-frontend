import React from 'react';
import { Map, MapMarker } from 'react-kakao-maps-sdk';
import { useNavigate } from 'react-router-dom';

const KakaoMap = ({ userLocation, pots = [], setMap }) => {
    const navigate = useNavigate();

    /**
     *  KakaoMap 컴포넌트는 순수 지도 렌더링만 담당
     *  지도 관련 모든 제어는 MapPage.js에서 담당
     */

     //마커를 클릭했을 때 실행될 함수
     const handleMarkerClick = (potId) => {
        navigate(`/pots/${potId}`);
     }

     if(!userLocation) {
        return (
            <div style={{ width: '100%', height: '400px', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                지도 로딩 중...
            </div>
        );
     }

     return (
        <div style={{ width: '100%', height: '400px' }}>
            <Map
                center={{ lat: userLocation.latitude, lng: userLocation.longitude }}
                style={{ width: '100%', height: '100%' }}
                  // 초기 확대 레벨은 부모 컴포넌트에서 제어하므로 여기서는 기본값(예: 2)으로 설정합니다.
                  level={2}
                  onCreate={setMap}
            >
                {/* 사용자 위치 마커 */}
                <MapMarker position={{ lat: userLocation.latitude, lng: userLocation.longitude }}>
                    <div style={{ padding: "5px", color: "red", textAlign: "center" }}>📍 내 위치</div>
                </MapMarker>

                {/* 주변 팟 마커들 */}
                {pots.map((pot) => (
                    <MapMarker
                        key={'pot-' + pot.potId}
                        position={{ lat: pot.latitude, lng: pot.longitude }}
                        onClick={() => handleMarkerClick(pot.potId)}
                        isClickable={true}
                    >
                        <div style={{ padding: "5px", color: "#000", whiteSpace: "nowrap" }}>
                            🛒 {pot.title}
                        </div>
                    </MapMarker>
                ))}
            </Map>
        </div>
     );
};

export default KakaoMap;