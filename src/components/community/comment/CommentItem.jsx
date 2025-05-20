import styled from 'styled-components';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowUp, FaArrowDown, FaReply, FaFlag, FaPencilAlt, FaTrash } from 'react-icons/fa';
import { formatDateTime } from '../../../utils/DateFormatter';
import { postCommentAPI } from '../../../api/PostCommentApi';
import { communityVoteAPI } from '../../../api/CommunityVoteApi';
import CommentForm from './CommentForm';
import ReportModal from '../../report/ReportModal';
import { reportAPI } from '../../../api/ReportApi';

// #region styled-components
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
  gap: 4px;
`;

const CommentVoteButton = styled.button`
  width: 18px;
  height: 18px;
  background: ${({ active }) => active ? '#ddd' : 'transparent'};
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.type === 'up' ? '#555' : '#aaa'};
  &:hover {
    color: ${props => props.type === 'up' ? '#111' : '#777'};
    background: #ddd;
  }
`;

const CommentVoteCount = styled.span`
  font-size: 13px;
  font-weight: bold;
  display: flex;
  justify-content: center;
  width: 13px;
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

const DeletedComment = styled.div`
  color: #777;
  padding: 25px 10px;
  font-size: 17px;
  border-top: 1px solid #f5f5f5;
  border-bottom: 1px solid #f5f5f5;
`

const ReplyList = styled.div`
  margin-top: 5px;
  margin-left: 30px;
  border-left: 2px solid #eee;
  padding-left: 20px;
`;

const Reply = styled.div`
  padding: 15px 0;
  border-bottom: 1px solid #f5f5f5;
`;
// #endregion 

const CommentItem = ({ comment, onDeleted, maxDepth = 4, anonymous, activeCommentId, setActiveCommentId, isEditMode, setIsEditMode }) => {
  const userId = localStorage.getItem("userId");
  const navigate = useNavigate();
  const isAuthor = comment && comment.authorId === userId;

  const [showReportModal, setShowReportModal] = useState(false);
  const [localComment, setLocalComment] = useState({ ...comment });

  const CommentItemWrapper = comment.depth === 0 ? Comment : Reply;

  // 답글 버튼 핸들러
  const onReplyClick = () => {
    if (!userId) {
      const confirmed = window.confirm("로그인 후 이용 가능한 기능입니다.\n로그인하시겠습니까?");
      if (confirmed) navigate("/login");
      return;
    }

    setActiveCommentId(comment.id);
    setIsEditMode(false);
  };

  // 수정 버튼 핸들러
  const onEditClick = () => {
    setActiveCommentId(comment.id);
    setIsEditMode(true);
  };

  // 댓글 삭제 핸들러
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

  // 댓글 투표 핸들러
  const handleVote = async (voteValue) => {
    if (!userId) {
      if (window.confirm("로그인 후 이용 가능한 기능입니다.\n로그인하시겠습니까?")) {
        navigate("/login");
      }
      return;
    }

    try {
      await communityVoteAPI.vote({
        targetType: "POST_COMMENT",
        targetId: comment.id,
        vote: voteValue,
      });

      const prevVote = localComment.userVote || 0;
      let newVote = 0;
      let newCount = localComment.voteCount;

      if (voteValue === prevVote) {
        newVote = 0;
        newCount -= voteValue;
      } else {
        newVote = voteValue;
        newCount += voteValue - prevVote;
      }

      setLocalComment({
        ...localComment,
        userVote: newVote,
        voteCount: newCount,
      });

    } catch (err) {
      alert("투표에 실패했습니다.");
      console.error("vote error", err);
    }
  };

  // 신고 버튼 클릭 핸들러
  const handleReportClick = async () => {
    if (!userId) {
      const confirmed = window.confirm("로그인 후 이용 가능한 기능입니다.\n로그인하시겠습니까?");
      if (confirmed) navigate("/login");
      return;
    }

    const alreadyReported = await reportAPI.checkExists({
      targetType: "POST_COMMENT",
      targetId: comment.id
    });

    if (alreadyReported) {
      alert("이미 신고한 대상입니다.");
      return;
    }

    setShowReportModal(true);
  };

  if (comment.isDeleted) {
    return (
      <CommentItemWrapper>
        {/* 삭제된 댓글 UI */}
        <DeletedComment>[삭제된 댓글입니다.]</DeletedComment>

        {/* 자식이 있으면 그대로 재귀 렌더링 */}
        {comment.children?.length > 0 && (
          <ReplyList>
            {comment.children.map(child => (
              <CommentItem
                key={child.id}
                comment={child}
                onDeleted={onDeleted}
                maxDepth={maxDepth}
                anonymous={anonymous}

                activeCommentId={activeCommentId}
                setActiveCommentId={setActiveCommentId}
                isEditMode={isEditMode}
                setIsEditMode={setIsEditMode}
              />
            ))}
          </ReplyList>
        )}
      </CommentItemWrapper>
    );
  }

  return (
    <CommentItemWrapper>
      {activeCommentId === comment.id && isEditMode ? (
        // 수정 모드일 때 수정 폼만 보여줌
        <CommentForm
          postId={comment.postId}
          commentId={comment.id}
          mode="edit"
          initialContent={comment.content}
          onSuccess={() => {
            setActiveCommentId(null);
            onDeleted?.();
          }}
          onCancel={() => setActiveCommentId(null)}
          anonymous={anonymous}
        />
      ) : (
        <>
          <CommentHeader>
            <CommentAuthor>{comment.anonymousNickname || comment.authorNickname}</CommentAuthor>
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
              <CommentVoteButton type="up" active={localComment.userVote === 1} onClick={() => handleVote(1)}><FaArrowUp /></CommentVoteButton>
              <CommentVoteCount>{localComment.voteCount}</CommentVoteCount>
              <CommentVoteButton type="down" active={localComment.userVote === -1} onClick={() => handleVote(-1)}><FaArrowDown /></CommentVoteButton>
            </CommentVoteButtons>
            {comment.depth < maxDepth && (
              <ActionButton onClick={onReplyClick}><FaReply /> 답글</ActionButton>
            )}
            {!isAuthor && (
              <ActionButton onClick={() => handleReportClick()}><FaFlag /> 신고</ActionButton>
            )}
            {showReportModal && (
              <ReportModal
                onClose={() => setShowReportModal(false)}
                authorNickname={comment.anonymousNickname || comment.authorNickname}
                contentText={comment.content}
                targetType="POST_COMMENT"
                targetId={comment.id}
              />
            )}
            {isAuthor && (
              <>
                <ActionButton onClick={onEditClick}><FaPencilAlt /> 수정</ActionButton>
                <ActionButton onClick={handleDelete}><FaTrash /> 삭제</ActionButton>
              </>
            )}
          </CommentActions>
        </>)}
      {activeCommentId === comment.id && !isEditMode && (
        <CommentForm
          postId={comment.postId}
          parentId={comment.id}
          mode="reply"
          onSuccess={() => {
            setActiveCommentId(null);
            onDeleted?.();
          }}
          onCancel={() => setActiveCommentId(null)}
          anonymous={anonymous}
        />
      )}

      {/* children 이 있으면 depth 4까지 재귀 렌더링 */}
      {comment.children?.length > 0 && (
        <ReplyList>
          {comment.children.map(child => (
            <CommentItem
              key={child.id}
              comment={child}
              onDeleted={onDeleted}
              maxDepth={maxDepth}
              anonymous={anonymous}

              activeCommentId={activeCommentId}
              setActiveCommentId={setActiveCommentId}
              isEditMode={isEditMode}
              setIsEditMode={setIsEditMode}
            />
          ))}
        </ReplyList>
      )}
    </CommentItemWrapper>
  );
};

export default CommentItem;