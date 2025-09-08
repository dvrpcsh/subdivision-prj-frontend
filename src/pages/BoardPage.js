import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api'; // API 모듈 import
import styles from './BoardPage.module.css';

const BoardPage = () => {
    const [posts, setPosts] = useState([]);
    // 로딩 및 에러 상태 추가
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 컴포넌트가 마운트될 때 API를 호출하여 게시글 목록을 가져옵니다.
    useEffect(() => {
        const fetchPosts = async () => {
            try {
                setLoading(true);
                setError(null);
                // GET /api/board API 호출 (페이징이 적용된 경우, params로 page 정보를 넘길 수 있습니다)
                const response = await api.get('/api/board');
                setPosts(response.data.content); // Page 객체에서 실제 목록은 content에 있습니다.
            } catch (err) {
                console.error("게시글 목록 조회 실패:", err);
                setError("게시글 목록을 불러오는 데 실패했습니다.");
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []); // 빈 배열을 전달하여 한 번만 실행되도록 합니다.

    if (loading) return <div className={styles.boardContainer}><h2>로딩 중...</h2></div>;
    if (error) return <div className={styles.boardContainer}><h2>오류: {error}</h2></div>;

    return (
        <div className={styles.boardContainer}>
            <div className={styles.boardHeader}>
                <h1>자유게시판</h1>
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
                    {posts.length > 0 ? (
                        posts.map(post => (
                            <tr key={post.id}>
                                <td>{post.id}</td>
                                <td className={styles.tdTitle}>
                                    <Link to={`/board/${post.id}`} className={styles.postLink}>
                                        {post.title}
                                    </Link>
                                </td>
                                <td>{post.author}</td>
                                <td>{post.date}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4">게시글이 없습니다.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default BoardPage;
