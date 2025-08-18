import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './PotCreatePage.css';

const PotCreatePage = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [productName, setProductName] = useState('');
    const [maximumHeadcount, setMaximumHeadcount] = useState(2);
    //이미지 파일과 미리보기 URL을 위한 state 추가
    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const navigate = useNavigate();

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

    //폼 제출 시 실행 될 핸들러
    const handleSubmit = async (e) => {
        e.preventDefault();
        let imageUrl = '';

        //이미지가 선택되었으면 S3에 먼저 업로드
        if(imageFile) {
            const formData = new FormData();
            formData.append('image', imageFile);

            try {
                const token = localStorage.getItem('jwt');
                const imageRes = await axios.post('http://localhost:8080/api/images/upload', formData, {
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
                maximumHeadcount: parseInt(maximumHeadcount, 10),
                imageUrl,
                //위치 정보는 실제 앱에서는 Geolocation으로 받아와야 합니다. 여기서는 임시로 사용
                latitude: 35.179554,
                longitude: 129.075642
            };

            const response = await axios.post('http://localhost:8080/api/pots', potData, {
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

                <div className="form-group">
                    <label htmlFor="maximumHeadcount">최대 참여 인원</label>
                    <input id="maximumHeadcount" type="number" value={maximumHeadcount} onChange={(e) => setMaximumHeadcount(e.target.value)} min="2" required />
                </div>

                {/* 이미지 선택 UI */}
                <div className="form-group">
                    <label>상품 이미지: </label>
                    <input id="image" type="file" accept="image/*" onChange={handleImageChange} />
                </div>

                {/* 이미지 미리보기 UI */}
                {previewUrl && (
                    <div>
                        <p>미리보기:</p>
                        <img src={previewUrl} alt="Preview" className="preview-image" />
                    </div>
                )}

                <button type="submit" className="submit-button">작성 완료</button>
            </form>
        </div>
    );
};

export default PotCreatePage;