import styled from 'styled-components';
import { useState } from 'react';
import { FaArrowUp, FaArrowDown, FaReply, FaFlag, FaPencilAlt, FaTrash } from 'react-icons/fa';
import { formatDateTime } from '../../../utils/DateFormatter';
import { postCommentAPI } from '../../../api/PostCommentApi';
import CommentForm from './CommentForm';

// # region styled-components
const Comment = styled.div`
  padding: 20px;
  border-bottom: 1px solid #eee;
`;

const CommentHeader = styled.div`
  display: flex;
  margin-bottom: 10px;
  color: #888;
  gap: 5px;
  align-items: center;
`;

const CommentAuthor = styled.span`
  font-weight: bold;
  font-size: 15px;
  margin-right: 10px;
  color: #000;
`;

const CommentDateInfo = styled.span`
  font-size: 13px;
`

const CommentContent = styled.div`
  margin-bottom: 10px;
  margin-left: 10px;
  font-size: 15px;
  line-height: 1.6;
`;

const CommentActions = styled.div`
  display: flex;
  gap: 13px;
  font-size: 13px;
  color: #888;
  align-items: center;
`;

const CommentVoteButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CommentVoteButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  color: ${props => props.type === 'up' ? '#6b8bfc' : '#ff4d4d'};
  &:hover {
    color: ${props => props.type === 'up' ? '#4d82f3' : '#e63939'};
  }
`;

const CommentVoteCount = styled.span`
  font-size: 13px;
  font-weight: bold;
`;

const ActionButton = styled.button`
  background-color: transparent;
  border: none;
  color: #888;
  cursor: pointer;
  font-size: 12px;
  display:flex;
  align-items:center;
  gap: 3px;

  svg {
    position: relative;
    top: 1px;
  }
`

const ReplyList = styled.div`
  margin-left: 30px;
  border-left: 2px solid #eee;
  padding-left: 20px;
`;

const Reply = styled.div`
  padding: 15px 0;
  border-bottom: 1px solid #f5f5f5;
`;
// #endregion 

const CommentItem = ({ comment, onDeleted }) => {
    const userId = localStorage.getItem("userId");
    const isAuthor = comment && comment.authorId === userId;
    const [showReplyForm, setShowReplyForm] = useState(false);

    const CommentItemWrapper = comment.depth === 0 ? Comment : Reply;
    const handleDelete = async () => {
        if (window.confirm("댓글을 삭제하시겠습니까?")) {
            try {
                await postCommentAPI.delete(comment.postId, comment.id);
                onDeleted?.(); // 부모에서 전달된 콜백으로 댓글 목록 갱신
            } catch (error) {
                console.error("댓글 삭제 실패", error);
                alert("댓글 삭제에 실패했습니다.");
            }
        }
    };

    return (
        <CommentItemWrapper>
            <CommentHeader>
                <CommentAuthor>{comment.authorNickname}</CommentAuthor>
                <CommentDateInfo>{comment.updatedAt ? `${formatDateTime(comment.updatedAt)} 수정됨` : formatDateTime(comment.createdAt)}</CommentDateInfo>
            </CommentHeader>
            <CommentContent>
                {comment.content.split('\n').map((line, idx) => (
                    <span key={idx}>
                        {line}
                        <br />
                    </span>
                ))}
            </CommentContent>
            <CommentActions>
                <CommentVoteButtons>
                    <CommentVoteButton type="up"><FaArrowUp /></CommentVoteButton>
                    <CommentVoteCount>{comment.voteCount}</CommentVoteCount>
                    <CommentVoteButton type="down"><FaArrowDown /></CommentVoteButton>
                </CommentVoteButtons>
                <ActionButton onClick={() => setShowReplyForm(prev => !prev)}><FaReply /> 답글</ActionButton>
                {!isAuthor && (
                    <ActionButton><FaFlag /> 신고</ActionButton>
                )}
                {isAuthor && (
                    <>
                        <ActionButton><FaPencilAlt /> 수정</ActionButton>
                        <ActionButton onClick={handleDelete}><FaTrash /> 삭제</ActionButton>
                    </>
                )}
            </CommentActions>

            {showReplyForm && (
                <CommentForm
                    postId={comment.postId}
                    parentId={comment.id}
                    variant="reply"
                    onSuccess={() => {
                        setShowReplyForm(false);
                        onDeleted?.();
                    }}
                    onCancel={() => setShowReplyForm(false)}
                />
            )}

            {/* {replies.length > 0 && (
                <ReplyList>
                    {replies.map(reply => (
                        <CommentItem key={reply.id} comment={reply}/>
                    ))}
                </ReplyList>
            )} */}
        </CommentItemWrapper>
    );
};

export default CommentItem;