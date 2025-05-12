import { useState, useRef } from 'react';
import styled from 'styled-components';
import { postCommentAPI } from '../../../api/PostCommentApi';
import CommentForm from './CommentForm';
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

// #endregion

const CommentSection = ({ postId }) => {
    const [commentInput, setCommentInput] = useState("");
    const commentListRef = useRef();

    const handleRefetch = () => {
        commentListRef.current?.refetch();
    };

    return (
        <Section>
            <Header>
                <span>댓글</span>
                <span style={{ color: '#888', fontSize: '16px' }}>8개</span>
            </Header>

            <CommentForm postId={postId} onSuccess={handleRefetch} variant="comment"></CommentForm>

            <CommentList ref={commentListRef} postId={postId}></CommentList>
        </Section>
    );
};

export default CommentSection