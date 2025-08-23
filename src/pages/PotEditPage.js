import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useDaumPostcodePopup } from 'react-daum-postcode';
import './PotCreatePage.css';
import { PotCategory } from '../constants/categories';
import LocationPicker from '../components/LocationPicker';

const PotEditPage = () => {
    const { potId } = useParams();
    const navigate = useNavigate();

    //폼 데이터를 관리할 state
    const [potData, setPotData] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [loading, setLoading] = useState(true);

    //주소 검색을 위한 state
    const [address, setAddress] = useState('');
    const [detailAddress, setDetailAddress] = useState('');

    //Daum Postcode 훅 호출
    const openPostcodePopup = useDaumPostcodePopup();

    //페이지 로딩 시, 기존 팟 데이터를 불러오는 useEffect
    useEffect(() => {
        const fetchPotData = async () => {
            try{
                const token = localStorage.getItem('jwt');
                const response = await axios.get(`http://localhost:8080/api/pots/${potId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                //category 값이 없을 경우 기본값을 설정해줍니다.
                const fetchedData = response.data;
                if (!fetchedData.category) {
                    fetchedData.category = 'ETC'; // 기본 카테고리를 ETC로 설정
                }

                setPotData(response.data);
                setPreviewUrl(response.data.imageUrl); // 기존 이미지 미리보기 설정
            } catch(error) {
                console.error("게시물 정보를 불러오는데 실패했습니다.", error);
                alert("게시물 정보를 불러올 수 없습니다.");
                navigate('/');
            } finally {
                setLoading(false); //로딩 완료
            }
        };
        fetchPotData();
    }, [potId, navigate]);

    //폼 입력값이 변경될 때 마다 potData state를 업데이트하는 핸들러
    const handleChange = (e) => {
        const { name, value } = e.target;
        setPotData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    //이미지 변경 핸들러
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setPreviewUrl(reader.result);
            reader.readAsDataURL(file);
        }
    };

    //위치 선택 핸들러
    const handleLocationSelect = (selectedLocation) => {
        setPotData(prev => ({ ...prev, latitude: selectedLocation.lat, longitude: selectedLocation.lng }));
    };

    //주소 검색 완료 핸들러
    const handleCompletePostcode = (data) => {
        setAddress(data.address);
        const geocoder = new window.kakao.maps.services.Geocoder();
        geocoder.addressSearch(data.address, (result, status) => {
            if (status === window.kakao.maps.services.Status.OK) {
                const newCoords = { lat: parseFloat(result[0].y), lng: parseFloat(result[0].x) };
                handleLocationSelect(newCoords); // 위치 state 업데이트
            }
        });
    };

    //주소 검색 버튼 핸들러
    const handleAddressSearch = () => {
        openPostcodePopup({ onComplete: handleCompletePostcode });
    };

    //폼 제출 핸들러
    const handleSubmit = async (e) => {
        e.preventDefault();
        let finalImageUrl = potData.imageUrl;

        //새 이미지가 선택되었으면 S3에 업로드
        if(imageFile) {
            const formData = new FormData();
            formData.append('image', imageFile);

            try {
                const token = localStorage.getItem('jwt');
                const imageRes = await axios.post('http://localhost:8080/api/images/upload', formData, {
                    headers: { /* ... */ }
                });
                finalImageUrl = imageRes.data; // 새 이미지 키로 교체
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
                maximumHeadcount: parseInt(potData.maximumHeadcount, 10),
            };
            await axios.put(`http://localhost:8080/api/pots/${potId}`, dataToSubmit, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            alert('게시물이 성공적으로 수정되었습니다.');
            navigate(`/pots/${potId}`);
        } catch (error) {
            alert("게시물 수정에 실패했습니다.");
        }
    };

    if (loading) return <div>로딩 중...</div>;

    return (
        <div className="create-pot-container">
            <h2>팟 수정하기</h2>
            <form onSubmit={handleSubmit} className="pot-form">
                {/* 제목 */}
                <div className="form-group">
                    <label htmlFor="title">제목</label>
                    <input id="title" name="title" type="text" value={potData.title} onChange={handleChange} required />
                </div>
                {/* 상품명 */}
                <div className="form-group">
                    <label htmlFor="productName">상품명</label>
                    <input id="productName" name="productName" type="text" value={potData.productName} onChange={handleChange} required />
                </div>
                {/* 내용 */}
                <div className="form-group">
                    <label htmlFor="content">내용</label>
                    <textarea id="content" name="content" value={potData.content} onChange={handleChange} required />
                </div>
                {/* 카테고리 */}
                <div className="form-group">
                    <label htmlFor="category">카테고리</label>
                    <select id="category" name="category" value={potData.category} onChange={handleChange} required >
                        {Object.entries(PotCategory).map(([key, displayName]) => (
                            <option key={key} value={key}>{displayName}</option>
                        ))}
                    </select>
                </div>
                {/* 주소 검색 및 위치 선택 UI*/}
                <div className="form-group">
                    <label>팟 위치</label>
                    <button type="button" onClick={handleAddressSearch}>주소 검색</button>
                    <input type="text" value={address || '주소 검색 또는 지도를 클릭하세요'} readOnly />
                    {/* 상세 주소는 수정 시에는 의미가 없으므로 제거하거나 필요에 따라 추가 */}
                </div>
                {/* 위치 선택 */}
                <div className="form-group">
                    <label>팟 위치</label>
                    <LocationPicker onLocationSelect={handleLocationSelect} selectedLocation={{ lat: potData.latitude, lng: potData.longitude }} />
                </div>
                {/* 최대 인원 */}
                <div className="form-group">
                    <label htmlFor="maximumHeadcount">최대 참여 인원</label>
                    <input id="maximumHeadcount" name="maximumHeadcount" type="number" value={potData.maximumHeadcount} onChange={handleChange} min="2" required />
                </div>
                {/* 이미지 업로드 */}
                <div className="form-group">
                    <label htmlFor="image">상품 이미지 변경</label>
                    <input id="image" type="file" accept="image/*" onChange={handleImageChange} />
                </div>
                {previewUrl && (
                    <div className="form-group">
                        <label>미리보기</label>
                        <img src={previewUrl} alt="Preview" className="preview-image" />
                    </div>
                )}

                <button type="submit" className="submit-button">수정 완료</button>
            </form>
        </div>
    );
};

export default PotEditPage;