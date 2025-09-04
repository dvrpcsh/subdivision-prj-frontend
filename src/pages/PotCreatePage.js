/**
 * PotCreatePage.js
 * * 새로운 팟(공동구매)을 생성하는 페이지입니다.
 * - 카카오맵 API를 사용하여 위치를 지정합니다.
 * - Daum 우편번호 서비스를 통해 주소를 검색합니다.
 * - 이미지 파일을 선택하여 S3에 업로드하고, 그 경로를 포함하여 팟 생성을 요청합니다.
 */
import React, { useState, useEffect } from 'react';
import { Map, MapMarker } from 'react-kakao-maps-sdk';
import api from '../api'; // 모든 API 요청을 처리하는 Axios 인스턴스
import { useNavigate } from 'react-router-dom';
import { useDaumPostcodePopup } from 'react-daum-postcode';
import './PotCreatePage.css';
import { PotCategory } from '../constants/categories';

const PotCreatePage = () => {
    // 폼의 각 입력 필드에 대한 상태(State)
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [productName, setProductName] = useState('');
    const [maximumHeadcount, setMaximumHeadcount] = useState(2); // 최소 인원은 2명부터 시작
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('FOOD'); // 기본 카테고리 설정

    // 이미지 파일과 이미지 미리보기를 위한 상태
    const [imageFile, setImageFile] = useState(null); // 사용자가 선택한 실제 이미지 파일
    const [previewUrl, setPreviewUrl] = useState(''); // 이미지 선택 시 보여줄 미리보기 URL

    // 위치 정보(위도, 경도) 및 주소 관련 상태
    const openPostcodePopup = useDaumPostcodePopup(); // Daum 우편번호 팝업을 열기 위한 Hook
    const [location, setLocation] = useState(null); // 위도(lat), 경도(lng)를 저장
    const [address, setAddress] = useState(''); // 주소 검색 또는 지도 클릭으로 얻은 주소
    const [detailAddress, setDetailAddress] = useState(''); // 사용자가 직접 입력하는 상세주소
    const [markerPosition, setMarkerPosition] = useState(null); // 지도에 표시할 마커의 위치

    const navigate = useNavigate(); // 페이지 이동을 위한 Hook

    // 컴포넌트가 처음 렌더링될 때, 사용자의 현재 위치를 기반으로 지도의 기본 위치를 설정합니다.
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const { latitude, longitude } = position.coords;
                const userCoords = { lat: latitude, lng: longitude };
                setLocation(userCoords);
                setMarkerPosition(userCoords);
            });
        }
    }, []); // 빈 배열을 전달하여 컴포넌트가 마운트될 때 한 번만 실행되도록 합니다.

    // 총 가격과 인원수에 따라 1인당 부담 비용을 실시간으로 계산합니다.
    const costPerPerson = (price && maximumHeadcount > 0)
        ? Math.floor(price / maximumHeadcount) // 소수점 이하는 버립니다.
        : 0;

    // '이미지 선택' 버튼을 통해 사용자가 파일을 선택했을 때 실행되는 함수입니다.
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file); // 선택된 파일을 상태에 저장
            // FileReader API를 사용하여 이미지 파일의 내용을 읽고,
            // 데이터 URL로 변환하여 이미지 미리보기를 생성합니다.
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // '주소 검색' 버튼 클릭 시 Daum 우편번호 팝업을 엽니다.
    const handleAddressSearch = () => {
        openPostcodePopup({ onComplete: handleCompletePostcode });
    };

    // 주소 검색이 완료되면 호출되는 콜백 함수입니다.
    const handleCompletePostcode = (data) => {
        setAddress(data.address); // 선택된 주소를 상태에 저장
        // 주소를 좌표로 변환하기 위해 카카오맵의 Geocoder 서비스를 사용합니다.
        const geocoder = new window.kakao.maps.services.Geocoder();
        geocoder.addressSearch(data.address, (result, status) => {
            if (status === window.kakao.maps.services.Status.OK) {
                const newCoords = { lat: parseFloat(result[0].y), lng: parseFloat(result[0].x) };
                setLocation(newCoords); // 변환된 좌표를 지도 중심과 마커 위치로 설정
                setMarkerPosition(newCoords);
            }
        });
    };

    // 지도를 클릭했을 때 실행되는 함수입니다.
    const handleMapClick = (_map, mouseEvent) => {
        const latlng = mouseEvent.latLng;
        const newCoords = { lat: latlng.getLat(), lng: latlng.getLng() };
        setLocation(newCoords); // 클릭된 위치의 좌표를 저장
        setMarkerPosition(newCoords);
        // Geocoder를 사용하여 클릭된 좌표를 주소로 변환하고, 주소 입력창에 표시합니다.
        const geocoder = new window.kakao.maps.services.Geocoder();
        geocoder.coord2Address(newCoords.lng, newCoords.lat, (result, status) => {
            if (status === window.kakao.maps.services.Status.OK) {
                const addressName = result[0].road_address
                    ? result[0].road_address.address_name
                    : result[0].address.address_name;
                setAddress(addressName);
            }
        });
    };

    /**
     * '작성 완료' 버튼 클릭 시 실행되는 메인 함수입니다.
     * 1. (이미지가 있다면) 먼저 이미지를 S3에 업로드합니다.
     * 2. 업로드 성공 시 받은 이미지 URL과 함께 나머지 폼 데이터를 서버에 보내 팟을 생성합니다.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!location || !address) {
            alert('팟 생성 위치를 지정해주세요.');
            return;
        }

        let imageUrl = ''; // 팟 생성 요청에 포함될 최종 이미지 URL

        // --- 1단계: 이미지 업로드 (이미지 파일이 선택된 경우에만 실행) ---
        if (imageFile) {
            const formData = new FormData();
            formData.append('image', imageFile);

            try {
                // `api.post`를 호출합니다. `api.js`의 인터셉터가 자동으로 Authorization 헤더를 추가해줍니다.
                // 💡 [핵심] 헤더를 직접 설정하지 않습니다.
                // 'Content-Type': 'multipart/form-data' 헤더는 브라우저가 FormData를 보낼 때
                // 고유한 boundary 값과 함께 자동으로 생성해주므로, 절대 직접 설정하면 안 됩니다.
                const imageRes = await api.post('/api/images/upload', formData);
                
                // 서버로부터 응답받은 이미지 경로(Key)를 imageUrl 변수에 저장합니다.
                imageUrl = imageRes.data; 

            } catch (err) {
                // 이미지 업로드 API 호출이 실패한 경우 (e.g., 토큰 만료 등)
                console.error('Image upload failed:', err);
                // 서버에서 보낸 에러 메시지가 있다면 보여주고, 없다면 기본 메시지를 보여줍니다.
                alert(err.response?.data?.message || '이미지 업로드에 실패했습니다.');
                return; // 팟 생성을 중단합니다.
            }
        }

        // --- 2단계: 팟 생성 (이미지 업로드 성공 후 또는 이미지가 없는 경우 실행) ---
        try {
            const potData = {
                title,
                content,
                productName,
                imageUrl, // 1단계에서 받은 URL 또는 빈 문자열
                maximumHeadcount: parseInt(maximumHeadcount, 10),
                price: parseInt(price, 10),
                latitude: location.lat,
                longitude: location.lng,
                category,
                address,
                detailAddress
            };
            
            // `api.post`를 호출합니다. `api.js`의 인터셉터가 자동으로 Authorization 헤더를 추가해줍니다.
            const response = await api.post('/api/pots', potData);

            // 생성이 성공하면, 응답으로 받은 새로운 팟의 ID를 이용해 상세 페이지로 이동합니다.
            const newPotId = response.data.potId;
            navigate(`/pots/${newPotId}`);

        } catch (err) {
            console.error('Pot creation failed:', err);
            alert(err.response?.data?.message || '게시물 생성에 실패했습니다.');
        }
    };

    // JSX 렌더링 부분
    return (
        <div className="create-pot-container">
            <h2>새로운 팟 만들기</h2>
            <form onSubmit={handleSubmit} className="pot-form">
                {/* 각 입력 필드와 UI 요소들 */}
                <div className="form-group">
                    <label htmlFor="title">제목</label>
                    <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
                </div>

                <div className="form-group">
                    <label htmlFor="productName">상품명</label>
                    <input id="productName" type="text" value={productName} onChange={(e) => setProductName(e.target.value)} required />
                </div>

                <div className="form-group">
                    <label htmlFor="content">내용</label>
                    <textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} required />
                </div>

                <div className="form-group">
                    <label htmlFor="category">카테고리</label>
                    <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} required>
                        {Object.entries(PotCategory).map(([key, displayName]) => (
                            <option key={key} value={key}>{displayName}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group price-section">
                    <div className="price-input">
                        <label htmlFor="price">총 가격</label>
                        <input
                            id="price"
                            type="text"
                            pattern="[0-9]*"
                            inputMode="numeric"
                            value={price}
                            onChange={(e) => setPrice(e.target.value.replace(/[^0-9]/g, ''))}
                            placeholder="총액(원)"
                            required
                        />
                    </div>
                    <div className="headcount-input">
                        <label htmlFor="maximumHeadcount">최대 참여 인원</label>
                        <input id="maximumHeadcount" type="number" value={maximumHeadcount} onChange={(e) => setMaximumHeadcount(e.target.value)} min="2" required />
                    </div>
                    <div className="cost-display">
                        <label>1인당 부담 비용</label>
                        <p>{costPerPerson.toLocaleString()} 원</p>
                    </div>
                </div>
                
                <div className="form-group">
                    <label>팟 생성 위치</label>
                    <div className="address-search-bar">
                        <button type="button" onClick={handleAddressSearch}>주소 검색</button>
                        <input type="text" value={address} placeholder="주소" readOnly />
                    </div>
                    <input type="text" value={detailAddress} onChange={(e) => setDetailAddress(e.target.value)} placeholder="상세주소 입력" />
                </div>

                <div className="form-group">
                    <p style={{ fontSize: '14px', color: '#666' }}>또는 지도에서 직접 위치를 클릭하세요.</p>
                    {location && (
                        <div style={{ width: '100%', height: '400px' }}>
                            <Map center={location} style={{ width: '100%', height: '100%' }} level={3} onClick={handleMapClick}>
                                {markerPosition && <MapMarker position={markerPosition} />}
                            </Map>
                        </div>
                    )}
                </div>

                <div className="form-group">
                    <label htmlFor="image">상품 이미지 (선택)</label>
                    <input id="image" type="file" accept="image/*" onChange={handleImageChange} />
                </div>
                {previewUrl && (<div className="preview-container"><img src={previewUrl} alt="Preview" className="preview-image" /></div>)}

                <button type="submit" className="submit-button">작성 완료</button>
            </form>
        </div>
    );
};

export default PotCreatePage;

