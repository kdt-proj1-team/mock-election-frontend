import { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import styled from 'styled-components';
import { postCommentAPI } from '../../../api/PostCommentApi';
import CommentItem from './CommentItem';

const CommentListWrapper = styled.div`
  margin-top: 30px;
`;

const CommentList = forwardRef(({ postId }, ref) => {
    const [comments, setComments] = useState([]);

    const fetchComments = async () => {
        try {
            const data = await postCommentAPI.getTopLevelComments(postId);
            setComments(data);
        } catch (error) {
            console.error('댓글 목록 조회 실패:', error);
        }
    };

    // 외부에서 fetchComments를 호출 가능하게 만듦
    useImperativeHandle(ref, () => ({
        refetch: fetchComments,
    }));


    useEffect(() => {
        fetchComments();
    }, [postId]);

    return (
        <CommentListWrapper>
            {comments.map(comment => (
                <CommentItem key={comment.id} comment={comment} onDeleted={fetchComments} />
            ))}
        </CommentListWrapper>
    );
});

export default CommentList;