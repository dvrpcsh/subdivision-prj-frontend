import React, { useState, useEffect } from 'react';
import axios from 'axios';
import KakaoMap from './KakaoMap';

const LocationFinder = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState('');
  const [pots, setPots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError);
  }, []);

  const handleSuccess = (position) => {
    const { latitude, longitude } = position.coords;
    setLocation({ latitude, longitude });
    fetchNearbyPots(latitude, longitude);
  };

  const handleError = (error) => {
    setError(error.message);
    setLoading(false);
  };

  const fetchNearbyPots = async (latitude, longitude) => {
    try {
      const token = localStorage.getItem('jwt');
      if (!token) {
        setError('로그인이 필요합니다.');
        setLoading(false);
        return;
      }

      const response = await axios.get('http://localhost:8080/api/pots/nearby', {
        params: { lat: latitude, lon: longitude, dist: 100 },
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setPots(response.data || []);

    } catch (err) {
      setError('주변 팟 목록을 불러오는 데 실패했습니다.');
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: '100%' }}>
      <h2>내 위치 찾기</h2>
      {location ? (
        <p>위도: {location.latitude}, 경도: {location.longitude}</p>
      ) : (
        <p>{error ? `오류: ${error}` : '위치를 찾는 중...'}</p>
      )}

      {/* 지도 컨테이너를 고정 높이로 설정 */}
      <div style={{ marginTop: '20px', marginBottom: '20px' }}>
        <KakaoMap userLocation={location} pots={pots} />
      </div>

      <h2>주변 팟 목록 (총 {pots.length}개)</h2>
      {loading ? (
              <p>팟 목록을 불러오는 중...</p>
            ) : pots.length > 0 ? (
              <ul>
                {pots.map((pot) => (
                  <li key={pot.id}>
                    <strong>{pot.title}</strong> - {pot.productName}
                  </li>
                ))}
              </ul>
      ) : (
        <p>주변에 진행 중인 팟이 없습니다.</p>
      )}
    </div>
  );
};

export default LocationFinder;