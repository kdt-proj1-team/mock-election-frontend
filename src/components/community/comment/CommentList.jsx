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
  color: #777;
  background-color: #eee;
  border: 1px solid #d7d7d7;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #ddd;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const CommentList = forwardRef(({ postId, anonymous }, ref) => {
    const [comments, setComments] = useState([]);
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const [loading, setLoading] = useState(false);
    const limit = 10;

    // activeCommentId: 어느 댓글에 폼이 열려 있는지
    // isEditMode: 수정폼인지, 답글폼인지 구분
    const [activeCommentId, setActiveCommentId] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);


    // 외부에서 fetchComments를 호출 가능하게 만듦
    useImperativeHandle(ref, () => ({
        refetch: fetchComments,
    }));

    const fetchComments = async (reset = false) => {
        if (loading) return;
        setLoading(true);

        const currentOffset = reset ? 0 : offset;
        try {
            // 1) 최상위 댓글 페이징 + depth4 자식까지 수집하는 API 호출
            //    이 API는 서버에서 offset/limit으로 depth=0를 잘라내고,
            //    그 최상위 댓글들에 대해 depth 1~4 자식을 포함해 flat 배열로 내려준다고 가정.
            const flat = await postCommentAPI.getCommentsWithReplies(postId, currentOffset, limit);

            // 2) flat → 트리 구조로 변환
            const map = {};
            flat.forEach(c => map[c.id] = { ...c, children: [] });
            const roots = [];
            flat.forEach(c => {
                if (c.parentId) {
                    const parent = map[c.parentId];
                    if (parent) parent.children.push(map[c.id]);
                } else {
                    roots.push(map[c.id]);
                }
            });

            // 3) state 업데이트
            setComments(prev => reset ? roots : [...prev, ...roots]);
            setOffset(currentOffset + roots.length);
            setHasMore(roots.length === limit);
        } catch (error) {
            console.error('댓글 전체 조회 실패', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComments(true);
    }, [postId]);

    return (
        <CommentListWrapper>
            {comments.map(root => (
                <CommentItem
                    key={root.id}
                    comment={root}
                    onDeleted={() => fetchComments(true)}
                    anonymous={anonymous}

                    activeCommentId={activeCommentId}
                    setActiveCommentId={setActiveCommentId}
                    isEditMode={isEditMode}
                    setIsEditMode={setIsEditMode}
                />
            ))}

            {hasMore && (
                <LoadMoreButton onClick={() => fetchComments()}>댓글 더보기</LoadMoreButton>
            )}

        </CommentListWrapper>
    );
});

export default CommentList;