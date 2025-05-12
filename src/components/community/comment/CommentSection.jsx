import { useState } from 'react';
import styled from 'styled-components';
import { postCommentAPI } from '../../../api/PostCommentApi';
import CommentList from './CommentList';

// #region styled-components
const Section = styled.section`
  margin-top: 40px;
`;

const Header = styled.div`
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const CommentForm = styled.div`
  margin-bottom: 30px;
  position: relative;
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 100px;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  resize: vertical;
  font-size: 15px;
  margin-bottom: 10px;
  &:focus {
    outline: none;
    border-color: #4d82f3;
  }
`;

const CharCounter = styled.div`
  position: absolute;
  bottom: 65px;
  right: 10px;
  font-size: 12px;
  color: #888;
`;

const SubmitButton = styled.button`
  background-color: #4d82f3;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  float: right;
  &:hover {
    background-color: #3a6ad4;
  }
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const ClearFix = styled.div`
    clear: both;
`
// #endregion

const CommentSection = ({postId}) => {
    const [commentInput, setCommentInput] = useState("");

    const handleSubmit = async () => {
        const trimmed = commentInput.trim();
        if (!trimmed) return;

        try {
            await postCommentAPI.create(postId, {
                authorId: localStorage.getItem("userId"),
                content: trimmed,
                parentId: null // 일반 댓글
            });
            setCommentInput("");
            // 댓글 새로고침 호출 필요 시 여기서 처리
        } catch (error) {
            console.error("댓글 등록 실패:", error);
            alert("댓글 등록에 실패했습니다.");
        }
    };

    return (
        <Section>
            <Header>
                <span>댓글</span>
                <span style={{ color: '#888', fontSize: '16px' }}>8개</span>
            </Header>

            <CommentForm>
                <TextArea
                    placeholder="댓글을 입력하세요."
                    maxLength={1000}
                    value={commentInput}
                    onChange={e => setCommentInput(e.target.value)}
                />
                <CharCounter style={{ color: commentInput.length >= 1000 ? '#ff4d4d' : '#888' }}>{commentInput.length} / 1000</CharCounter>
                <SubmitButton onClick={handleSubmit} disabled={!commentInput.trim()}>등록</SubmitButton>
                <ClearFix></ClearFix>
            </CommentForm>

            <CommentList></CommentList>
        </Section>
    );
};

export default CommentSection