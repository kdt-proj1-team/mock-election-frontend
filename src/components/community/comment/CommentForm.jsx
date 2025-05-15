import { useState } from 'react';
import styled, { css } from 'styled-components';
import { postCommentAPI } from '../../../api/PostCommentApi';

// #region styled-components
const Container = styled.div`
  position: relative;
  margin-top: ${({ mode }) =>
    mode === 'reply' ? '15px' :
    mode === 'edit' ? '0' :
    mode === 'comment' ? '0' :
    '0'
  };
  margin-bottom: 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
`;

const CommentAuthor = styled.div`
  font-weight: bold;
  font-size: ${({ mode }) =>
    mode === 'reply' ? '14px' :
    mode === 'edit' ? '14px' :
    mode === 'comment' ? '17px' :
    '17px'
  };
  margin: 10px;
  color: #000;
`;

const Textarea = styled.textarea`
  width: 100%;
  min-height: ${({ mode }) =>
    mode === 'reply' ? '40px' :
    mode === 'edit' ? '40px' :
    mode === 'comment' ? '70px' :
    '70px'
  };
  padding: ${({ mode }) =>
    mode === 'reply' ? '12px' :
    mode === 'edit' ? '12px' :
    mode === 'comment' ? '15px' :
    '15px'
  };
  font-size: ${({ mode }) =>
    mode === 'reply' ? '14px' :
    mode === 'edit' ? '14px' :
    mode === 'comment' ? '15px' :
    '15px'
  };
  border: none;
  resize: none;

  &:focus {
    outline: none;
  }
`;

const CharCounter = styled.div`
  position: absolute;
  top: ${({ mode }) =>
    mode === 'reply' ? '30px' :
    mode === 'edit' ? '30px' :
    mode === 'comment' ? '40px' :
    '40px'
  };
  right: 25px;
  font-size: 12px;
  color: #888;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;

const CancleButton = styled.button`
  width: ${({ mode }) =>
    mode === 'reply' ? '60px' :
    mode === 'edit' ? '60px' :
    mode === 'comment' ? '70px' :
    '70px'
  };
  height: ${({ mode }) =>
    mode === 'reply' ? '35px' :
    mode === 'edit' ? '35px' :
    mode === 'comment' ? '40px' :
    '40px'
  };
  background-color: #ddd;
  color: white;
  border: none;
  padding: ${({ mode }) =>
    mode === 'reply' ? '8px 16px' :
    mode === 'edit' ? '8px 16px' :
    mode === 'comment' ? '10px 20px' :
    '10px 20px'
  };
  border-radius: 5px;
  font-size: ${({ mode }) =>
    mode === 'reply' ? '11px' :
    mode === 'edit' ? '11px' :
    mode === 'comment' ? '13px' :
    '13px'
  };
  font-weight: bold;
  cursor: pointer;

`;

const SubmitButton = styled.button`
  width: ${({ mode }) =>
    mode === 'reply' ? '60px' :
    mode === 'edit' ? '60px' :
    mode === 'comment' ? '70px' :
    '70px'
  };
  height: ${({ mode }) =>
    mode === 'reply' ? '35px' :
    mode === 'edit' ? '35px' :
    mode === 'comment' ? '40px' :
    '40px'
  };
  background-color: #4d82f3;
  color: white;
  border: none;
  padding: ${({ mode }) =>
    mode === 'reply' ? '8px 16px' :
    mode === 'edit' ? '8px 16px' :
    mode === 'comment' ? '10px 20px' :
    '10px 20px'
  };
  border-radius: 5px;
  font-size: ${({ mode }) =>
    mode === 'reply' ? '11px' :
    mode === 'edit' ? '11px' :
    mode === 'comment' ? '13px' :
    '13px'
  };
  font-weight: bold;
  cursor: pointer;

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

const CommentForm = ({ postId, parentId = null, commentId = null, initialContent = '', onSuccess, onCancel, mode = 'comment' }) => {  // mode: 'comment' | 'reply' | 'edit'
  const [input, setInput] = useState(initialContent ?? "");
  const nickname = localStorage.getItem("nickname");
  const maxLength = 1000;

  const handleSubmit = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    try {
      if (mode === 'edit') {  // 댓글 수정 처리
        await postCommentAPI.update(postId, commentId, { content: trimmed });
      } else { // 댓글 등록 처리
        await postCommentAPI.create(postId, {
          content: trimmed,
          parentId: parentId, // null이면 댓글, 값이 있으면 답글
        });
      }
      setInput("");
      onSuccess?.(); // 댓글 목록 새로고침
    } catch (error) {
      console.error("댓글 등록 실패:", error);
      alert(mode === 'edit' ? "댓글 수정에 실패했습니다." : "댓글 등록에 실패했습니다.");
    }
  };

  return (
    <Container mode={mode}>
      <CommentAuthor mode={mode}>{nickname}</CommentAuthor>
      <Textarea
        mode={mode}
        placeholder={{
          comment: '댓글을 입력하세요',
          reply: '답글을 입력하세요',
          edit: '',
        }[mode] ?? ''}
        maxLength={maxLength}
        value={input}
        onChange={e => {
          setInput(e.target.value);
          e.target.style.height = 'auto'; // 리셋
          e.target.style.height = `${e.target.scrollHeight}px`; // 내용에 따라 늘림
        }}
      />
      <CharCounter mode={mode}>
        {input.length} / {maxLength}
      </CharCounter>
      <ButtonGroup>
        {(mode === 'reply' || mode == 'edit') && (
          <CancleButton mode={mode} onClick={onCancel}>취소</CancleButton>
        )}
        <SubmitButton mode={mode} onClick={handleSubmit} disabled={!input.trim()}>
          {mode === 'edit' ? '수정' : '등록'}
        </SubmitButton>
      </ButtonGroup>
      <ClearFix />
    </Container>
  );
};

export default CommentForm;
