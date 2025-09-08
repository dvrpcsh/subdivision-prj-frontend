import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './BoardWritePage.module.css';

const BoardWrite = () => {
    const navigate = useNavigate();
    // 제목과 내용을 위한 state를 생성합니다.
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    /**
     * '등록' 버튼 클릭 시 실행될 함수입니다.
     * @param {React.FormEvent<HTMLFormElement>} e - 폼 제출 이벤트 객체
     */
    const handleSubmit = (e) => {
        e.preventDefault(); // 폼의 기본 제출 동작(새로고침)을 방지합니다.

        // 입력값 유효성 검사
        if (!title.trim()) {
            alert('제목을 입력해주세요.');
            return;
        }
        if (!content.trim()) {
            alert('내용을 입력해주세요.');
            return;
        }

        // TODO: 이곳에 실제 서버로 데이터를 전송하는 API 호출 로직을 추가해야 합니다.
        console.log('새로운 게시글:', { title, content });
        alert('게시글이 성공적으로 등록되었습니다.');

        // 등록 후에는 게시판 목록 페이지로 이동합니다.
        navigate('/board');
    };

    /**
     * '취소' 버튼 클릭 시 실행될 함수입니다.
     */
    const handleCancel = () => {
        // 사용자가 취소를 확인하도록 confirm 대화상자를 띄웁니다.
        if (window.confirm('작성을 취소하시겠습니까? 변경사항이 저장되지 않습니다.')) {
            navigate('/board'); // 게시판 목록으로 돌아갑니다.
        }
    };

    return (
        <div className={styles.writeContainer}>
            <h1>새 글 작성</h1>
            <form onSubmit={handleSubmit} className={styles.writeForm}>
                <div className={styles.formGroup}>
                    <label htmlFor="title">제목</label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="제목을 입력하세요"
                        className={styles.inputTitle}
                    />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="content">내용</label>
                    <textarea
                        id="content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="내용을 입력하세요"
                        className={styles.textareaContent}
                        rows="15"
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

export default BoardWrite;
