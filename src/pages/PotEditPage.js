import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { useDaumPostcodePopup } from 'react-daum-postcode';
import './PotCreatePage.css'; // 생성 페이지와 동일한 스타일 시트를 사용합니다.
import { PotCategory } from '../constants/categories';
import { Map, MapMarker } from 'react-kakao-maps-sdk'; // Map과 MapMarker를 직접 사용합니다.

const PotEditPage = () => {
    const { potId } = useParams();
    const navigate = useNavigate();

    // 폼 데이터를 한 번에 관리할 state
    const [potData, setPotData] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [loading, setLoading] = useState(true);

    // 지도 마커 위치를 위한 state
    const [markerPosition, setMarkerPosition] = useState(null);

    // Daum Postcode 훅 호출
    const openPostcodePopup = useDaumPostcodePopup();

    // 페이지 로딩 시, 기존 팟 데이터를 불러오는 useEffect
    useEffect(() => {
        const fetchPotData = async () => {
            try {
                const token = localStorage.getItem('jwt');
                const response = await api.get(`/api/pots/${potId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const fetchedData = response.data;
                console.log("서버에서 받아온 팟 데이터:", fetchedData);

                setPotData(fetchedData);
                setPreviewUrl(fetchedData.imageUrl); // 기존 이미지 미리보기 설정

                // 불러온 데이터로 마커 위치를 설정합니다.
                const initialPosition = { lat: fetchedData.latitude, lng: fetchedData.longitude };
                setMarkerPosition(initialPosition);

            } catch (error) {
                console.error("게시물 정보를 불러오는데 실패했습니다.", error);
                alert("게시물 정보를 불러올 수 없습니다.");
                navigate('/');
            } finally {
                setLoading(false);
            }
        };
        fetchPotData();
    }, [potId, navigate]);

    // 총 가격과 인원수에 따라 1인당 부담 비용을 실시간으로 계산합니다.
    const costPerPerson = (potData?.price && potData?.maximumHeadcount > 0)
        ? Math.floor(potData.price / potData.maximumHeadcount)
        : 0;

    // 폼 입력값이 변경될 때 potData state를 업데이트하는 핸들러
    const handleChange = (e) => {
        const { name, value } = e.target;
        setPotData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    // 이미지 변경 핸들러
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setPreviewUrl(reader.result);
            reader.readAsDataURL(file);
        }
    };

    // 주소 검색 완료 핸들러
    const handleCompletePostcode = (data) => {
        const geocoder = new window.kakao.maps.services.Geocoder();
        geocoder.addressSearch(data.address, (result, status) => {
            if (status === window.kakao.maps.services.Status.OK) {
                const newCoords = { lat: parseFloat(result[0].y), lng: parseFloat(result[0].x) };
                setPotData(prev => ({ ...prev, address: data.address, latitude: newCoords.lat, longitude: newCoords.lng }));
                setMarkerPosition(newCoords);
            }
        });
    };

    // 주소 검색 버튼 핸들러
    const handleAddressSearch = () => {
        openPostcodePopup({ onComplete: handleCompletePostcode });
    };

    // 지도 클릭 핸들러
    const handleMapClick = (_map, mouseEvent) => {
        const latlng = mouseEvent.latLng;
        const newCoords = { lat: latlng.getLat(), lng: latlng.getLng() };
        setMarkerPosition(newCoords);

        const geocoder = new window.kakao.maps.services.Geocoder();
        geocoder.coord2Address(newCoords.lng, newCoords.lat, (result, status) => {
            if (status === window.kakao.maps.services.Status.OK) {
                const addressName = result[0].road_address ? result[0].road_address.address_name : result[0].address.address_name;
                setPotData(prev => ({ ...prev, address: addressName, latitude: newCoords.lat, longitude: newCoords.lng }));
            }
        });
    };

    // 폼 제출 핸들러
    const handleSubmit = async (e) => {
        e.preventDefault();
        let finalImageUrl = potData.imageUrl;

        if (imageFile) {
            const formData = new FormData();
            formData.append('image', imageFile);
            try {
                const token = localStorage.getItem('jwt');
                const imageRes = await api.post('/api/images/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${token}` }
                });
                finalImageUrl = imageRes.data;
            } catch (err) {
                alert('이미지 업로드에 실패했습니다.');
                return;
            }
        }

        try {
            const token = localStorage.getItem('jwt');
            const dataToSubmit = {
                ...potData,
                imageUrl: finalImageUrl,
                price: parseInt(potData.price, 10),
                maximumHeadcount: parseInt(potData.maximumHeadcount, 10),
            };
            await api.put(`/api/pots/${potId}`, dataToSubmit, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            alert('게시물이 성공적으로 수정되었습니다.');
            navigate(`/pots/${potId}`);
        } catch (error) {
            alert("게시물 수정에 실패했습니다.");
        }
    };

    if (loading || !potData) return <div>로딩 중...</div>;

    return (
        <div className="create-pot-container">
            <form onSubmit={handleSubmit} className="pot-form">
                <h2>팟 수정하기</h2>

                <div className="form-group"><label htmlFor="title">제목</label><input id="title" name="title" type="text" value={potData.title} onChange={handleChange} required /></div>
                <div className="form-group"><label htmlFor="productName">상품명</label><input id="productName" name="productName" type="text" value={potData.productName} onChange={handleChange} required /></div>
                <div className="form-group"><label htmlFor="category">카테고리</label><select id="category" name="category" value={potData.category} onChange={handleChange} required>{Object.entries(PotCategory).map(([key, displayName]) => (<option key={key} value={key}>{displayName}</option>))}</select></div>
                <div className="form-group"><label htmlFor="content">내용</label><textarea id="content" name="content" value={potData.content} onChange={handleChange} required /></div>

                {/* 가격 및 인원 설정 섹션 */}
                <div className="form-group price-section">
                    <div className="price-input">
                        <label htmlFor="price">총 가격</label>
                        <input id="price" name="price" type="number" value={potData.price} onChange={handleChange} placeholder="총액(원)" required />
                    </div>
                    <div className="headcount-input">
                        <label htmlFor="maximumHeadcount">최대 인원</label>
                        <input id="maximumHeadcount" name="maximumHeadcount" type="number" value={potData.maximumHeadcount} onChange={handleChange} min="2" required />
                    </div>
                    <div className="cost-display">
                        <label>1인당 부담 비용</label>
                        <p>{costPerPerson.toLocaleString()} 원</p>
                    </div>
                </div>

                {/* 위치 설정 섹션 UI 통일 */}
                <div className="form-group">
                    <label>팟 생성 위치</label>
                    <div className="address-search-bar">
                        <input type="text" value={potData.address} placeholder="주소" readOnly />
                        <button type="button" onClick={handleAddressSearch}>주소 검색</button>
                    </div>
                    <input type="text" name="detailAddress" value={potData.detailAddress} onChange={handleChange} placeholder="상세주소 입력" />
                </div>
                <div className="form-group">
                    <p className="map-guide">또는 지도에서 직접 위치를 클릭하세요.</p>
                    <div className="map-container">
                        <Map center={{ lat: potData.latitude, lng: potData.longitude }} style={{ width: '100%', height: '100%' }} level={3} onClick={handleMapClick}>
                            {markerPosition && <MapMarker position={markerPosition} />}
                        </Map>
                    </div>
                </div>

                {/* 이미지 업로드 섹션 */}
                <div className="form-group">
                    <label htmlFor="image">상품 이미지 변경</label>
                    <div className="file-upload-wrapper">
                        <input id="image" type="file" accept="image/*" onChange={handleImageChange} />
                        <label htmlFor="image" className="file-upload-button">파일 선택</label>
                        <span className="file-name">{imageFile ? imageFile.name : (potData.imageUrl ? '기존 이미지 유지' : '선택된 파일 없음')}</span>
                    </div>
                    {previewUrl && (<div className="preview-container"><img src={previewUrl} alt="Preview" className="preview-image" /></div>)}
                </div>

                <button type="submit" className="submit-button">수정 완료</button>
            </form>
        </div>
    );
};

export default PotEditPage;
