import React, { useState } from 'react';
import { Map, MapMarker, MarkerClusterer, MapInfoWindow } from 'react-kakao-maps-sdk';
import { useNavigate } from 'react-router-dom';

const KakaoMap = ({ userLocation, pots = [], setMap }) => {
    const navigate = useNavigate();
    //마우스를 올린 마커의 정보창을 관리하기 위한 state를 추가합니다.
    const [hoveredPotId, setHoveredPotId] = useState(null);

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
        <div style={{ width: '100%', height: '80%' }}>
            <Map
                center={{ lat: userLocation.latitude, lng: userLocation.longitude }}
                style={{ width: '100%', height: '100%' }}
                // 초기 확대 레벨은 부모 컴포넌트에서 제어하므로 여기서는 기본값(예: 5)으로 설정합니다.
                level={5}
                onCreate={setMap}
            >
                {/* 사용자 위치 마커는 클러스터에 포함되지 않도록 바깥에 위치 */}
                <MapMarker position={{ lat: userLocation.latitude, lng: userLocation.longitude }}>
                    <div style={{ padding: "5px", color: "red", textAlign: "center" }}>📍 내 위치</div>
                </MapMarker>

                {/* 주변 팟 마커들 뭉치면 숫자로 보임(MarkerClusterer적용) */}
                <MarkerClusterer
                    averageCenter={true} // 클러스터 마커를 중앙으로 설정
                    minLevel={6} // 클러스터 할 최소 지도 레벨 (숫자가 작을수록 확대된 상태)
                >
                    {/* 주변 팟 마커들 */}
                    {pots.map((pot) => (
                        <MapMarker
                            key={'pot-' + pot.potId}
                            position={{ lat: pot.latitude, lng: pot.longitude }}
                            onClick={() => handleMarkerClick(pot.potId)}
                            onMouseOver={() => setHoveredPotId(pot.potId)}
                            onMouseOut={() => setHoveredPotId(null)}
                            isClickable={true}
                        >
                            {/* 마우스를 올린 마커에만 정보창 표시 */}
                            {hoveredPotId === pot.potId && (
                                <MapInfoWindow position={{ lat: pot.latitude, lng: pot.longitude }}>
                                    <div style={{ padding: "5px", color: "#000", whiteSpace: "nowrap", fontSize: "14px" }}>
                                        🛒 {pot.title}
                                    </div>
                                </MapInfoWindow>
                            )}
                        </MapMarker>
                    ))}
                </MarkerClusterer>
            </Map>
        </div>
     );
};

export default KakaoMap;