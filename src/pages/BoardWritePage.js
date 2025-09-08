import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api'; // API 모듈 import
import styles from './BoardWritePage.module.css';

const BoardWritePage = () => {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) {
            alert('제목과 내용을 모두 입력해주세요.');
            return;
        }
        try {
            // POST /api/board API 호출
            await api.post('/api/board', { title, content });
            alert('게시글이 성공적으로 등록되었습니다.');
            navigate('/board');
        } catch (err) {
            console.error("게시글 작성 실패:", err);
            alert(err.response?.data?.message || "게시글 등록에 실패했습니다.");
        }
    };

    const handleCancel = () => {
        if (window.confirm('작성을 취소하시겠습니까? 변경사항이 저장되지 않습니다.')) {
            navigate('/board');
        }
    };

    return (
        <div className={styles.writeContainer}>
            <h1>새 글 작성</h1>
            <form onSubmit={handleSubmit} className={styles.writeForm}>
                <div className={styles.formGroup}>
                    <label htmlFor="title">제목</label>
                    <input
                        type="text" id="title" value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="제목을 입력하세요" className={styles.inputTitle} required
                    />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="content">내용</label>
                    <textarea
                        id="content" value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="내용을 입력하세요" className={styles.textareaContent} rows="15" required
                    />
                </div>
                <div className={styles.buttonContainer}>
                    <button type="submit" className={styles.submitButton}>등록</button>
                    <button type="button" onClick={handleCancel} className={styles.cancelButton}>취소</button>
                </div>
            </form>
        </div>
    );
};

export default BoardWritePage;
