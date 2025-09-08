import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './BoardPage.module.css';

// 게시판 초기 더미 데이터
const initialPosts = [
    { id: 1, title: '첫 번째 게시글입니다.', author: '관리자', date: '2025-09-08' },
    { id: 2, title: '자유게시판에 오신 것을 환영합니다!', author: '운영자', date: '2025-09-08' },
    { id: 3, title: '이곳에 자유롭게 글을 작성해주세요.', author: '홍길동', date: '2025-09-07' },
];

const Board = () => {
    // 게시글 목록 상태를 관리합니다.
    const [posts, setPosts] = useState(initialPosts);

    return (
        <div className={styles.boardContainer}>
            <div className={styles.boardHeader}>
                <h1>자유게시판</h1>
                {/* '/board/new' 경로로 이동하는 글쓰기 버튼입니다. */}
                <Link to="/board/new" className={styles.writeButton}>
                    글쓰기
                </Link>
            </div>
            <table className={styles.postsTable}>
                <thead>
                    <tr>
                        <th className={styles.thNo}>번호</th>
                        <th className={styles.thTitle}>제목</th>
                        <th className={styles.thAuthor}>작성자</th>
                        <th className={styles.thDate}>작성일</th>
                    </tr>
                </thead>
                <tbody>
                    {/* posts 배열을 순회하며 각 게시글을 테이블 행으로 렌더링합니다. */}
                    {posts.map(post => (
                        <tr key={post.id}>
                            <td>{post.id}</td>
                            <td className={styles.tdTitle}>
                                {/* 각 게시글의 상세 페이지로 이동하는 링크입니다. */}
                                <Link to={`/board/${post.id}`} className={styles.postLink}>
                                    {post.title}
                                </Link>
                            </td>
                            <td>{post.author}</td>
                            <td>{post.date}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Board;
