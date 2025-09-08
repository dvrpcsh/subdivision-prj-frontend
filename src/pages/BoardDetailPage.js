import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api';
import styles from './BoardDetail.module.css';

const BoardDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useContext(AuthContext);

    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPostAndComments = async () => {
            setLoading(true);
            setError(null);
            try {
                const [postRes, commentsRes] = await Promise.all([
                    api.get(`/api/board/${id}`),
                    api.get(`/api/board/${id}/comments`)
                ]);
                setPost(postRes.data);
                setComments(commentsRes.data);
            } catch (err) {
                console.error("데이터 조회 실패:", err);
                setError("게시글을 불러오는 데 실패했습니다.");
            } finally {
                setLoading(false);
            }
        };
        fetchPostAndComments();
    }, [id]);

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) {
            alert('댓글 내용을 입력해주세요.');
            return;
        }
        try {
            const response = await api.post(`/api/board/${id}/comments`, { content: newComment });
            setComments([...comments, response.data]);
            setNewComment('');
        } catch (err) {
            console.error("댓글 작성 실패:", err);
            alert(err.response?.data?.message || "댓글 작성에 실패했습니다.");
        }
    };

    const handleDelete = async () => {
        if (window.confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
            try {
                await api.delete(`/api/board/${id}`);
                alert('게시글이 삭제되었습니다.');
                navigate('/board');
            } catch (err) {
                console.error("게시글 삭제 실패:", err);
                alert(err.response?.data?.message || "게시글 삭제에 실패했습니다.");
            }
        }
    };

    /**
     * 댓글 삭제 함수
     * @param {number} commentId - 삭제할 댓글의 ID
     */
    const handleCommentDelete = async (commentId) => {
        if (window.confirm("정말로 이 댓글을 삭제하시겠습니까?")) {
            try {
                // DELETE /api/comments/{commentId} API 호출
                await api.delete(`/api/comments/${commentId}`);
                // 성공 시, UI에서 해당 댓글을 즉시 제거
                setComments(comments.filter(comment => comment.id !== commentId));
                alert("댓글이 삭제되었습니다.");
            } catch (err) {
                console.error("댓글 삭제 실패:", err);
                alert(err.response?.data?.message || "댓글 삭제에 실패했습니다.");
            }
        }
    };

    if (loading) return <div className={styles.container}>로딩 중...</div>;
    if (error) return <div className={styles.container}><p>오류: {error}</p></div>;
    if (!post) return <div className={styles.container}>게시글을 찾을 수 없습니다.</div>;

    const isAuthor = currentUser?.nickname === post.author;

    return (
        <div className={styles.container}>
            <div className={styles.postHeader}>
                <h1 className={styles.postTitle}>{post.title}</h1>
                <div className={styles.postMeta}>
                    <span>작성자: {post.author}</span>
                    <span>작성일: {post.date}</span>
                </div>
            </div>
            <div className={styles.postContent}>{post.content}</div>
            <div className={styles.buttonContainer}>
                {isAuthor && (
                    <>
                        <Link to={`/board/${id}/edit`} className={styles.editButton}>수정</Link>
                        <button onClick={handleDelete} className={styles.deleteButton}>삭제</button>
                    </>
                )}
                <Link to="/board" className={styles.listButton}>목록</Link>
            </div>
            <div className={styles.commentsSection}>
                <h2 className={styles.commentsTitle}>댓글 ({comments.length})</h2>
                <form onSubmit={handleCommentSubmit} className={styles.commentForm}>
                    <textarea
                        className={styles.commentTextarea}
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder={currentUser ? "댓글을 입력하세요..." : "로그인 후 댓글을 작성할 수 있습니다."}
                        rows="3"
                        disabled={!currentUser}
                    />
                    <button type="submit" className={styles.commentSubmitButton} disabled={!currentUser}>등록</button>
                </form>
                <div className={styles.commentList}>
                    {comments.length > 0 ? (
                        comments.map(comment => (
                            <div key={comment.id} className={styles.commentItem}>
                                <div className={styles.commentMeta}>
                                    <span className={styles.commentAuthor}>{comment.author}</span>
                                    <div className={styles.commentMetaRight}>
                                        <span className={styles.commentDate}>{comment.date}</span>
                                        {/* 현재 유저와 댓글 작성자가 같으면 삭제 버튼 표시 */}
                                        {currentUser?.nickname === comment.author && (
                                            <button
                                                onClick={() => handleCommentDelete(comment.id)}
                                                className={styles.commentDeleteButton}
                                            >
                                                삭제
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <p className={styles.commentContent}>{comment.content}</p>
                            </div>
                        ))
                    ) : (
                        <p className={styles.noComments}>아직 댓글이 없습니다.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BoardDetailPage;

