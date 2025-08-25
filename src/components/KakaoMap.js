import React, { useRef } from 'react';
import { Map, MapMarker, MarkerClusterer, MapInfoWindow } from 'react-kakao-maps-sdk';
import { useNavigate } from 'react-router-dom';

const KakaoMap = ({ userLocation, pots = [], setMap, hoveredPotId, setHoveredPotId }) => {
    const navigate = useNavigate();
    const timerRef = useRef(null);
    const hoveredPot = pots.find((pot) => pot.potId === hoveredPotId);

    /**
     *  KakaoMap 컴포넌트는 순수 지도 렌더링만 담당
     *  지도 관련 모든 제어는 MapPage.js에서 담당
     */

     //마커를 클릭했을 때 실행될 함수
     const handleMarkerClick = (potId) => {
        navigate(`/pots/${potId}`);
     }

     //마커 위에 마우스를 올렸을 때 실행될 함수
      const handleMouseOverMarker = (potId) => {
         // 이전에 설정된 '숨기기' 타이머가 있다면 취소합니다.
         clearTimeout(timerRef.current);
         // 현재 마커를 활성화합니다.
         setHoveredPotId(potId);
      }

      //마커나 정보창에서 마우스를 뗐을 때 실행될 함수
      const handleMouseOut = () => {
         // 100ms (0.1초) 후에 정보창을 숨기는 타이머를 설정합니다.
         timerRef.current = setTimeout(() => {
             setHoveredPotId(null);
         }, 100);
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

                {pots.length > 0 && (
                    <MarkerClusterer
                        key={JSON.stringify(pots)}
                        averageCenter={true}
                        minLevel={4}
                        styles={[{ width: "30px", height: "30px", background: "rgba(51, 204, 255, .8)", borderRadius: "15px", color: "#fff", textAlign: "center", fontWeight: "bold", lineHeight: "31px" }]}
                    >
                        {pots.map((pot) => (
                            <MapMarker
                                key={'pot-' + pot.potId}
                                position={{ lat: pot.latitude, lng: pot.longitude }}
                                onClick={() => handleMarkerClick(pot.potId)}
                                onMouseOver={() => handleMouseOverMarker(pot.potId)}
                                onMouseOut={handleMouseOut}
                                isClickable={true}
                            >
                            </MapMarker>
                        ))}
                    </MarkerClusterer>
                )}

                {/* 정보창을 지도 레벨에서 직접, 단 하나만 렌더링합니다. */}
                {/* hoveredPot 객체가 존재할 때만 정보창이 보이게 됩니다. */}
                {hoveredPot && (
                    <MapInfoWindow
                        position={{ lat: hoveredPot.latitude, lng: hoveredPot.longitude }}
                        onClose={() => setHoveredPotId(null)}
                    >
                        {/* 정보창 div에도 마우스 이벤트 핸들러를 추가합니다. */}
                        {/* 마우스가 정보창 안으로 들어오면 '숨기기' 타이머를 취소합니다. */}
                        <div
                            style={{ padding: "5px", color: "#000", whiteSpace: "nowrap", fontSize: "14px" }}
                            onMouseOver={() => clearTimeout(timerRef.current)}
                            onMouseOut={handleMouseOut}
                        >
                            🛒 {hoveredPot.title}
                        </div>
                    </MapInfoWindow>
                )}
            </Map>
        </div>
     );
};

export default KakaoMap;