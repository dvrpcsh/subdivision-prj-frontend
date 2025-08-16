import React, { useState, useEffect, useRef } from 'react';
import { Map, MapMarker } from 'react-kakao-maps-sdk';

const KakaoMap = ({ userLocation, pots = [] }) => {
  const [map, setMap] = useState();

  // 디버깅을 위한 로그
  useEffect(() => {
    //map객체와 userLocation이 모두 준비되었을 때만 로직을 실행합니다.
    if (map && userLocation) {
          //사용자의 현재 위치를 나타내는 LatLng 객체를 생성합니다.
          const centerPoint = new window.kakao.maps.LatLng(userLocation.latitude, userLocation.longitude);

          //지도의 중심을 사용자의 현재 위치로 부드럽게 이동시킵니다.
          map.panTo(centerPoint);

          //지도 타일 깨짐 현상을 방지하기 위한 relayout을 실행합니다.
          const timer = setTimeout(() => {
            map.relayout();
          }, 0);

          return () => clearTimeout(timer);
        }
      }, [map, userLocation, pots]);

  if (!userLocation) {
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
          level={5}
          onCreate={setMap}
        >
          {/* 사용자 위치 마커 (선택 사항) */}
          <MapMarker position={{ lat: userLocation.latitude, lng: userLocation.longitude }}>
            <div style={{ padding: "5px", color: "red", textAlign: "center" }}>📍 내 위치</div>
          </MapMarker>

          {pots.map((pot) => (
            <MapMarker
              key={`pot-${pot.id}`}
              position={{ lat: pot.latitude, lng: pot.longitude }}
              title={pot.title}
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