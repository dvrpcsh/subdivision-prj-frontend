import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import styles from './BoardDetailPage.module.css';

// TODO: 추후 서버에서 받아올 실제 데이터로 교체해야 합니다.
// 현재는 Board.js와 동일한 임시 데이터를 사용합니다.
const initialPosts = [
    { id: 1, title: '첫 번째 게시글입니다.', author: '김유저', date: '2024-01-01', content: '이것은 첫 번째 게시글의 상세 내용입니다. \n\n자유롭게 내용을 작성해주세요.' },
    { id: 2, title: '두 번째 게시글입니다.', author: '이유저', date: '2024-01-02', content: '두 번째 글의 내용입니다. \n\nReact Router를 사용하여 페이지를 만들고 있습니다.' },
    { id: 3, title: '세 번째 게시글입니다.', author: '박유저', date: '2024-01-03', content: '마지막 임시 게시글입니다. \n\n실제로는 서버 API를 호출하여 데이터를 가져와야 합니다.' },
];

const BoardDetail = () => {
    // URL 파라미터에서 게시글의 id를 가져옵니다. (예: /board/1 -> id는 '1')
    const { id } = useParams();
    const navigate = useNavigate();
    // id에 해당하는 게시글을 임시 데이터에서 찾습니다.
    const post = initialPosts.find(p => p.id === parseInt(id));

    /**
     * '삭제' 버튼 클릭 시 실행될 함수입니다.
     */
    const handleDelete = () => {
        if (window.confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
            // TODO: 실제 서버에 삭제 요청을 보내는 API 호출 로직을 추가해야 합니다.
            console.log(`게시글 ${id} 삭제 요청`);
            alert('게시글이 삭제되었습니다.');
            // 삭제 후에는 게시판 목록으로 이동합니다.
            navigate('/board');
        }
    };

    // id에 해당하는 게시글이 없을 경우 메시지를 표시합니다.
    if (!post) {
        return <div className={styles.container}>게시글을 찾을 수 없습니다.</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.postHeader}>
                <h1 className={styles.postTitle}>{post.title}</h1>
                <div className={styles.postMeta}>
                    <span>작성자: {post.author}</span>
                    <span>작성일: {post.date}</span>
                </div>
            </div>
            {/* white-space: pre-wrap; 스타일을 통해 \n(줄바꿈) 문자를 그대로 렌더링합니다. */}
            <div className={styles.postContent}>
                {post.content}
            </div>
            <div className={styles.buttonContainer}>
                {/* TODO: 추후 현재 로그인한 사용자가 작성자일 경우에만 보이도록 로직을 추가해야 합니다. */}
                <button className={styles.editButton}>수정</button>
                <button onClick={handleDelete} className={styles.deleteButton}>삭제</button>
                <Link to="/board" className={styles.listButton}>목록</Link>
            </div>
        </div>
    );
};

export default BoardDetail;
