import { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import styled from 'styled-components';
import { postCommentAPI } from '../../../api/PostCommentApi';
import CommentItem from './CommentItem';

const CommentListWrapper = styled.div`
  margin-top: 30px;
`;

const LoadMoreButton = styled.button`
  display: block;
  margin: 20px auto;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: bold;
  color: #4d82f3;
  background-color: #f4f6fc;
  border: 1px solid #4d82f3;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #e0e8fb;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const CommentList = forwardRef(({ postId }, ref) => {
    const [comments, setComments] = useState([]);
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const [loading, setLoading] = useState(false);
    const limit = 20;

    const fetchComments = async (reset = false) => {
        if (loading) return;
        setLoading(true);

        const currentOffset = reset ? 0 : offset;

        try {
            const data = await postCommentAPI.getTopLevelComments(postId, currentOffset, limit);
            setComments(prev => reset ? data : [...prev, ...data]);
            setOffset(currentOffset + data.length);
            setHasMore(data.length === limit);
        } catch (error) {
            console.error('댓글 목록 조회 실패:', error);
        } finally {
            setLoading(false);
        }
    };

    // 외부에서 fetchComments를 호출 가능하게 만듦
    useImperativeHandle(ref, () => ({
        refetch: fetchComments,
    }));


    useEffect(() => {
        fetchComments(true);
    }, [postId]);

    return (
        <CommentListWrapper>
            {comments.map(comment => (
                <CommentItem key={comment.id} comment={comment} onDeleted={fetchComments} />
            ))}

            {hasMore && (
                <LoadMoreButton onClick={() => fetchComments()}>댓글 더보기</LoadMoreButton>
            )}

        </CommentListWrapper>
    );
});

export default CommentList;