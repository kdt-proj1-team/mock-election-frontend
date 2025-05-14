import { useRef } from 'react';
import styled from 'styled-components';
import CommentForm from './CommentForm';
import CommentList from './CommentList';

// #region styled-components
const Section = styled.section`
  margin-top: 40px;
`;

const Header = styled.div`
  font-weight: bold;
  margin-left: 5px;
  margin-bottom: 20px;
  display: flex;
  align-items: end;
  gap: 13px;
`;

const CommentTitle = styled.span`
  font-size: 21px;
`;
const CommentCount = styled.span`
  color: #888;
  font-size: 19px;
`;

// #endregion

const CommentSection = ({ postId, commentCount }) => {
    const commentListRef = useRef();

    const handleRefetch = () => {
        commentListRef.current?.refetch();
    };

    return (
        <Section>
            <Header>
                <CommentTitle>댓글</CommentTitle>
                <CommentCount>{commentCount}개</CommentCount>
            </Header>

            <CommentForm postId={postId} onSuccess={handleRefetch} variant="comment"></CommentForm>

            <CommentList ref={commentListRef} postId={postId}></CommentList>
        </Section>
    );
};

export default CommentSection