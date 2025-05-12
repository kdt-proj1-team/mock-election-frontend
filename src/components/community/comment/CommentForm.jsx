import { useState } from 'react';
import styled, { css } from 'styled-components';
import { postCommentAPI } from '../../../api/PostCommentApi';

// #region styled-components
const Container = styled.div`
  position: relative;
  margin-top: ${({ variant }) => (variant === 'reply' ? '15px' : '0')};
  margin-bottom: 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
`;

const CommentAuthor = styled.div`
  font-weight: bold;
  font-size: 17px;
  margin: 10px;
  color: #000;
`;

const Textarea = styled.textarea`
  width: 100%;
  min-height: ${({ variant }) => (variant === 'reply' ? '60px' : '80px')};
  padding: ${({ variant }) => (variant === 'reply' ? '12px' : '15px')};
  font-size: ${({ variant }) => (variant === 'reply' ? '14px' : '15px')};
  border: none;
  resize: none;

  &:focus {
    outline: none;
    
  }
`;

const CharCounter = styled.div`
  position: absolute;
  top: ${({ variant }) => (variant === 'reply' ? '30px' : '40px')};
  right: 25px;
  font-size: 12px;
  color: #888;
`;

const SubmitButton = styled.button`
  width: 70px;
  height: 40px;
  background-color: #4d82f3;
  color: white;
  border: none;
  padding: ${({ variant }) => (variant === 'reply' ? '8px 16px' : '10px 20px')};
  border-radius: 5px;
  font-size: 13px;
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
`;
// #endregion

const CommentForm = ({ postId, parentId = null, onSuccess, variant = 'comment' }) => {
    const [input, setInput] = useState("");
    const nickname = localStorage.getItem("nickname");
    const maxLength = 1000;

    const handleSubmit = async () => {
        const trimmed = input.trim();
        if (!trimmed) return;

        try {
            await postCommentAPI.create(postId, {
                authorId: localStorage.getItem("userId"),
                content: trimmed,
                parentId: parentId, // null이면 댓글, 값이 있으면 답글
            });
            setInput("");
            onSuccess?.(); // 댓글 목록 새로고침
        } catch (error) {
            console.error("댓글 등록 실패:", error);
            alert("댓글 등록에 실패했습니다.");
        }
    };

    return (
        <Container variant={variant}>
            <CommentAuthor>{nickname}</CommentAuthor>
            <Textarea
                variant={variant}
                placeholder={variant === 'reply' ? "답글을 입력하세요..." : "댓글을 입력하세요."}
                maxLength={maxLength}
                value={input}
                onChange={e => {
                    setInput(e.target.value);
                    e.target.style.height = 'auto'; // 리셋
                    e.target.style.height = `${e.target.scrollHeight}px`; // 내용에 따라 늘림
                }}
            />
            <CharCounter variant={variant}>
                {input.length} / {maxLength}
            </CharCounter>
            <SubmitButton variant={variant} onClick={handleSubmit} disabled={!input.trim()}>
                등록
            </SubmitButton>
            <ClearFix />
        </Container>
    );
};

export default CommentForm;
