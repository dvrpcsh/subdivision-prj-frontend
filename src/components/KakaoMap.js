import React, { useState, useEffect, useRef } from 'react';
import { Map, MapMarker, MapInfoWindow } from 'react-kakao-maps-sdk';
import { useNavigate } from 'react-router-dom';

const KakaoMap = ({ userLocation, pots = [] }) => {
  const [map, setMap] = useState();
  //const [openInfoWindowId, setOpenInfoWindowId] = useState(null);
  const navigate = useNavigate();

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

          return () => {clearTimeout(timer)};
        }
      }, [map, userLocation, pots]);

  //마커를 클릭했을 때 실행될 함수
  const handleMarkerClick = (potId) => {
    console.log('마커 클릭! 이동할 Pot ID:', potId);
    //상세페이지 경로로 이동
    navigate(`/pots/${potId}`);
  }

  //마커에 마우스를 갖다대면 발생하는 이벤트
  /*
  const handleMouseOver = (potId) => {
    setOpenInfoWindowId(potId);
  }
  */

  //마커에서 마우스를 떼면 발생하면 이벤트
  /*
  const handleMouseOut = () => {
    setOpenInfoWindowId(null);
  }
  */

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

          {/* 주변 팟 마커들 */}
          {pots.map((pot) => (
            <MapMarker
              key={'pot-' +pot.potId}
              position={{ lat: pot.latitude, lng: pot.longitude }}
              //마커에 onClick 이벤트 핸들러 추가
              onClick={() => handleMarkerClick(pot.potId)}

              //onMouseOver={() => handleMouseOver(pot.potId)}
              //onMouseOut={handleMouseOut}

              //isClickable을 true로 설정하여 클릭 가능함을 명시
              isClickable을={true}
            >
              {/* 마커 위에 항상 표시될 정보창(기본: 숨겨져 있다가 호버 시 나타남) */}
              {/*
              {openInfoWindowId === pot.potId && (
                <MapInfoWindow position={{ lat: pot.latitude, lng: pot.longitude }}>
                    <div style={{ padding: "5px", color: "#000", whiteSpace: "nowrap" }}>
                      🛒 {pot.title}
                    </div>
                </MapInfoWindow>
              )}
              */}
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