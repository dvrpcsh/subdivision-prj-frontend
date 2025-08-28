import React, { useState, useEffect } from 'react';
import { Map, MapMarker } from 'react-kakao-maps-sdk';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { useDaumPostcodePopup } from 'react-daum-postcode';
import './PotCreatePage.css';
import { PotCategory } from '../constants/categories';

const PotCreatePage = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [productName, setProductName] = useState('');
    const [maximumHeadcount, setMaximumHeadcount] = useState(2);
    const [price, setPrice] = useState('');
    //이미지 파일과 미리보기 URL을 위한 state 추가
    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [category, setCategory] = useState('FOOD');

    //위치 및 주소찾기
    const openPostcodePopup = useDaumPostcodePopup();
    const [location, setLocation] = useState(null);
    const [address, setAddress] = useState('');
    const [detailAddress, setDetailAddress] = useState('');
    const [isPostcodeOpen, setIsPostcodeOpen] = useState(false);
    const navigate = useNavigate();

    //지도에 표시할 마커의 위치를 위한 state
    const [markerPosition, setMarkerPosition] = useState(null);

    //컴포넌트가 처음 로딩될 때 사용자의 현재 위치를 가져와 지도를 초기화합니다.
    useEffect(() => {
        navigator.geolocation.getCurrentPosition((position) => {
            const { latitude, longitude } = position.coords;
            const userCoords = { lat: latitude, lng: longitude };
            setLocation(userCoords);
            setMarkerPosition(userCoords);
        });
    }, []);

    //총 가격과 인원수에 따라 1인당 부담 비용을 실시간으로 계산합니다.
    const costPerPerson = (price && maximumHeadcount > 0)
        ? Math.floor(price / maximumHeadcount)
        : 0;

    //이미지 파일 선택 시 실행 될 핸들러
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if(file) {
            setImageFile(file);
            //FileReader를 사용하거나 URL.createObjectURL을 사용하여 미리보기 생성
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
            }
            reader.readAsDataURL(file);
        }
    };

    //주소찾기 팝업을 열고 닫는 핸들러
    const handleTogglePostcode = () => {
        setIsPostcodeOpen(!isPostcodeOpen);
    };

    //'주소 검색' 버튼 클릭 시 실행될 핸들러
    const handleAddressSearch = () => {
        openPostcodePopup({ onComplete: handleCompletePostcode });
    }

    //주소찾기 완료 후 실행될 핸들러
    const handleCompletePostcode = (data) => {
        let fullAddress = data.address;
        let extraAddress = '';

        if(data.addressType === 'R') {
            if(data.bname !== '') {
                extraAddress += data.bname;
            }
            if(data.buildingName !== '') {
                extraAddress += (extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName);
            }
            fullAddress += (extraAddress !== '' ? ` (${extraAddress})` : '');
        }

        setAddress(fullAddress); //주소 state 업데이트

        //주소를 좌표로 변환
        const geocoder = new window.kakao.maps.services.Geocoder();
        geocoder.addressSearch(fullAddress, (result, status) => {
            if(status === window.kakao.maps.services.Status.OK) {
                const newCoords = { lat: parseFloat(result[0].y), lng: parseFloat(result[0].x)};
                setLocation(newCoords); //좌표 state 업데이트
            }
        });

        setIsPostcodeOpen(false); //팝업 닫기
    }

    //지도를 클릭했을 때 실행될 핸들러
    const handleMapClick = (_map, mouseEvent) => {
        const latlng = mouseEvent.latLng;
        const newCoords = { lat: latlng.getLat(), lng: latlng.getLng() };

        //클릭한 위치의 좌표를 location과 markerPosition state에 업데이트합니다.
        setLocation(newCoords);
        setMarkerPosition(newCoords);

        //카카오맵 지오코더 API를 사용해 좌표를 주소로 변환합니다.
        const geocoder = new window.kakao.maps.services.Geocoder();
        geocoder.coord2Address(newCoords.lng, newCoords.lat, (result, status) => {
            if(status === window.kakao.maps.services.Status.OK) {
                //도로명 주소가 있으면 도로명 주소를, 없으면 지번 주소를 사용합니다.
                const addressName = result[0].road_address
                ? result[0].road_address.address_name
                : result[0].address.address_name;

                //변환된 주소를 address state에 업데이트하여 입력창에 표시합니다.
                setAddress(addressName);
            }
        })

    }

    //폼 제출 시 실행 될 핸들러
    const handleSubmit = async (e) => {
        e.preventDefault();

        //주소가 입력되었는지 유효성 검사
        if(!location) {
            alert('주소를 입력해주세요.');

            return;
        }

        //가격이 입력되었는지 유효성 검사
        if(!price) {
            alert('가격을 입력해주세요.');

            return;
        }

        let imageUrl = '';

        //이미지가 선택되었으면 S3에 먼저 업로드
        if(imageFile) {
            const formData = new FormData();
            formData.append('image', imageFile);

            try {
                const token = localStorage.getItem('jwt');
                const imageRes = await api.post('/api/images/upload', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${token}`
                    }
                });
                imageUrl = imageRes.data; //응답으로 받은 S3 URL
            } catch(err) {
                console.error('Image upload failed:', err);
                alert('이미지 업로드에 실패했습니다.');

                return;
            }
        }

        //이미지 URL과 함께 팟 생성 API 호출
        try {
            const token = localStorage.getItem('jwt');
            const potData = {
                title,
                content,
                productName,
                imageUrl,
                maximumHeadcount: parseInt(maximumHeadcount, 10),
                price: parseInt(price, 10),
                latitude: location.lat,
                longitude: location.lng,
                category,
                address,
                detailAddress
            };

            const response = await api.post('/api/pots', potData, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            //생성이 성공하면 해당 팟의 상세 페이지로 이동
            const newPotId = response.data.potId;
            navigate(`/pots/${newPotId}`);
        } catch(err) {
            console.error('Pot creation failed:', err);
            alert('게시물 생성에 실패했습니다.');
        }
    };

    return (
        <div className="create-pot-container">
            <h2>새로운 팟 만들기</h2>
            <form onSubmit={handleSubmit} className="pot-form">
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

                {/* 카테고리 선택 드롭다운 */}
                <div className="form-group">
                    <label htmlFor="category">카테고리</label>
                    <select
                        id="category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        required
                    >
                        {Object.entries(PotCategory).map(([key, displayName]) => (
                            <option key={key} value={key}>
                                {displayName}
                            </option>
                        ))}
                    </select>
                </div>

                {/* 가격 및 인원 설정 섹션*/}
                <div className="form-group price-section">
                    <div className="price-input">
                        <label htmlFor="price">총 가격</label>
                        <input id="price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="총액(원)" required />
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

                {/* 주소 관련 UI */}
                <div className="form-group">
                    <label>팟 생성 위치</label>
                    <div className="address-search-bar">
                        <button type="button" onClick={handleAddressSearch}>주소 검색</button>
                        <input type="text" value={address} placeholder="주소" readOnly />
                    </div>
                    <input type="text" value={detailAddress} onChange={(e) => setDetailAddress(e.target.value)} placeholder="상세주소 입력" />
                </div>

                {/*위치 선택 지도*/}
                <div className="form-group">
                    <p style={{fontSize: '14px', color: '#666'}}>또는 지도에서 직접 위치를 클릭하세요.</p>
                    {/* 지도가 로딩되었을 때만 (location state가 있을 때만) Map을 렌더링합니다. */}
                    {location && (
                        <div style={{ width: '100%', height: '400px' }}>
                            <Map
                                center={location}
                                style={{ width: '100%', height: '100%' }}
                                level={3}
                                onClick={handleMapClick} // 지도에 클릭 이벤트 핸들러를 연결합니다.
                            >
                                {/* 클릭한 위치에 마커를 표시합니다. */}
                                {markerPosition && <MapMarker position={markerPosition} />}
                            </Map>
                        </div>
                    )}
                </div>

                {/* 이미지 선택 UI */}
                <div className="form-group">
                    <label htmlFor="image">상품 이미지 (선택)</label>
                    <input id="image" type="file" accept="image/*" onChange={(e) => handleImageChange(e)} />
                </div>
                {previewUrl && (<div className="preview-container"><img src={previewUrl} alt="Preview" className="preview-image" /></div>)}

                <button type="submit" className="submit-button">작성 완료</button>
            </form>
        </div>
    );
};

export default PotCreatePage;