// [최종 확인] 이 파일은 프로젝트의 `api.js` (환경 변수 및 'jwt' 토큰 사용)와 완벽하게 호환됩니다.
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api'; // API 모듈 import
import styles from './BoardWritePage.module.css';

const BoardEditPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    // 컴포넌트가 처음 렌더링될 때, 기존 게시글 데이터를 API로 불러옵니다.
    useEffect(() => {
        const fetchPost = async () => {
            try {
                const response = await api.get(`/api/board/${id}`);
                setTitle(response.data.title);
                setContent(response.data.content);
            } catch (err) {
                console.error("게시글 정보 조회 실패:", err);
                alert("게시글 정보를 불러오는 데 실패했습니다.");
                navigate('/board');
            }
        };
        fetchPost();
    }, [id, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) {
            alert('제목과 내용을 모두 입력해주세요.');
            return;
        }
        try {
            // PUT /api/board/{id} API 호출
            await api.put(`/api/board/${id}`, { title, content });
            alert('게시글이 성공적으로 수정되었습니다.');
            navigate(`/board/${id}`);
        } catch (err) {
            console.error("게시글 수정 실패:", err);
            alert(err.response?.data?.message || "게시글 수정에 실패했습니다.");
        }
    };

    const handleCancel = () => {
        if (window.confirm('수정을 취소하시겠습니까? 변경사항이 저장되지 않습니다.')) {
            navigate(`/board/${id}`);
        }
    };

    return (
        <div className={styles.writeContainer}>
            <h1>게시글 수정</h1>
            <form onSubmit={handleSubmit} className={styles.writeForm}>
                <div className={styles.formGroup}>
                    <label htmlFor="title">제목</label>
                    <input
                        type="text" id="title" value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className={styles.inputTitle} required
                    />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="content">내용</label>
                    <textarea
                        id="content" value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className={styles.textareaContent} rows="15" required
                    />
                </div>
                <div className={styles.buttonContainer}>
                    <button type="submit" className={styles.submitButton}>수정 완료</button>
                    <button type="button" onClick={handleCancel} className={styles.cancelButton}>취소</button>
                </div>
            </form>
        </div>
    );
};

export default BoardEditPage;

