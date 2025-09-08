import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './BoardWritePage.module.css';

// 임시 데이터. 실제로는 서버로부터 데이터를 받아와야 합니다.
const initialPosts = [
    { id: 1, title: '첫 번째 게시글입니다.', author: '김유저', date: '2024-01-01', content: '이것은 첫 번째 게시글의 상세 내용입니다. \n\n자유롭게 내용을 작성해주세요.' },
    { id: 2, title: '두 번째 게시글입니다.', author: '이유저', date: '2024-01-02', content: '두 번째 글의 내용입니다. \n\nReact Router를 사용하여 페이지를 만들고 있습니다.' },
    { id: 3, title: '세 번째 게시글입니다.', author: '박유저', date: '2024-01-03', content: '마지막 임시 게시글입니다. \n\n실제로는 서버 API를 호출하여 데이터를 가져와야 합니다.' },
];

const BoardEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    // 컴포넌트가 처음 마운트될 때, 기존 게시글 데이터를 불러옵니다.
    useEffect(() => {
        const postToEdit = initialPosts.find(p => p.id === parseInt(id));
        if (postToEdit) {
            setTitle(postToEdit.title);
            setContent(postToEdit.content);
        } else {
            alert('수정할 게시글을 찾을 수 없습니다.');
            navigate('/board');
        }
    }, [id, navigate]);

    /**
     * '수정 완료' 버튼 클릭 시 실행될 함수입니다.
     */
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) {
            alert('제목과 내용을 모두 입력해주세요.');
            return;
        }

        // TODO: 실제 서버에 수정된 데이터를 전송하는 API 호출 로직을 추가해야 합니다.
        console.log('수정된 게시글:', { id, title, content });
        alert('게시글이 성공적으로 수정되었습니다.');
        // 수정 후에는 해당 게시글의 상세 페이지로 다시 이동합니다.
        navigate(`/board/${id}`);
    };

    /**
     * '취소' 버튼 클릭 시 실행될 함수입니다.
     */
    const handleCancel = () => {
        if (window.confirm('수정을 취소하시겠습니까? 변경사항이 저장되지 않습니다.')) {
            navigate(`/board/${id}`); // 상세 페이지로 돌아갑니다.
        }
    };

    return (
        <div className={styles.writeContainer}>
            <h1>게시글 수정</h1>
            <form onSubmit={handleSubmit} className={styles.writeForm}>
                <div className={styles.formGroup}>
                    <label htmlFor="title">제목</label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className={styles.inputTitle}
                    />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="content">내용</label>
                    <textarea
                        id="content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className={styles.textareaContent}
                        rows="15"
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

export default BoardEdit;
