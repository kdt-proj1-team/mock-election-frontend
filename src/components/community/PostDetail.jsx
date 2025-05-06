// PostDetail.jsx (전체 컴포넌트 구조 + styled-components 스타일 포함)
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import styled from 'styled-components';
import { FaPencilAlt, FaTrash, FaArrowUp, FaArrowDown, FaFlag, FaReply, FaPen, FaHome, FaList, FaEye } from 'react-icons/fa';
import { communityAPI } from '../../api/CommunityApi';


// #region styled-components
const Container = styled.div`
  max-width: 1200px;
  margin: 30px auto;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  padding: 30px;
`;

const CategoryName = styled.div`
  font-size: 22px;
  font-weight: bold;
  color: #4d82f3;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
`;

const Title = styled.h1`
  font-size: 26px;
  font-weight: bold;
  margin-bottom: 15px;
  line-height: 1.4;
`;

const Meta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #888;
  font-size: 14px;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
`;

const Info = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const Actions = styled.div`
  display: flex;
  gap: 10px;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 4px;
  &:hover {
    color: #4d82f3;
  }

  svg {
    font-size: 14px;
    position: relative;
    top: 1px;
  }
`;

const ViewCount = styled.div`
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #666;
  gap: 5px;

  svg {
    font-size: 16px;
    position: relative;
    top: 1px;
  }
`;

const Content = styled.div`
  font-size: 16px;
  line-height: 1.8;
  margin-bottom: 40px;
  min-height: 200px;
`;

const Footer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding-top: 20px;
  border-top: 1px solid #eee;
  margin-bottom: 30px;
  position: relative;
`;

const VoteButtons = styled.div`
  display: flex;
  align-items: center;
`;

const VoteButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
  padding: 5px 10px;
  display: flex;
  align-items: center;
  gap: 5px;
  color: ${props => props.type === 'up' ? '#6b8bfc' : '#ff4d4d'};
  &:hover {
    color: ${props => props.type === 'up' ? '#4d82f3' : '#e63939'};
  }
`;

const VoteCount = styled.span`
  font-size: 16px;
  font-weight: bold;
  padding: 0 12px;
`;

const ReportButton = styled.button`
  color: #ff4d4d;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 5px;
  position: absolute;
  right: 0;
  &:hover {
    text-decoration: underline;
  }
`;

const CommentsSection = styled.div`
  margin-top: 40px;
`;

const CommentsHeader = styled.div`
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

const CommentList = styled.div`
  margin-top: 30px;
`;

const Comment = styled.div`
  padding: 20px;
  border-bottom: 1px solid #eee;
`;

const CommentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 13px;
  color: #888;
`;

const CommentAuthor = styled.span`
  font-weight: bold;
  margin-right: 10px;
  color: #000;
`;

const CommentContent = styled.div`
  margin-bottom: 15px;
  font-size: 15px;
  line-height: 1.6;
`;

const CommentActions = styled.div`
  display: flex;
  gap: 15px;
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

const ReplyList = styled.div`
  margin-left: 30px;
  border-left: 2px solid #eee;
  padding-left: 20px;
`;

const Reply = styled.div`
  padding: 15px 0;
  border-bottom: 1px solid #f5f5f5;
`;

const ReplyForm = styled.div`
  margin-top: 15px;
  margin-bottom: 15px;
  position: relative;
`;

const ReplyTextarea = styled.textarea`
  width: 100%;
  min-height: 80px;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  resize: vertical;
  font-size: 14px;
  margin-bottom: 10px;
  &:focus {
    outline: none;
    border-color: #4d82f3;
  }
`;

const ReplyCharCounter = styled.div`
  position: absolute;
  bottom: 50px;
  right: 15px;
  font-size: 12px;
  color: #888;
`;

const ReplyButton = styled.button`
  background-color: #4d82f3;
  color: white;
  border: none;
  padding: 8px 16px;
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

const PostActionsBar = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #eee;
`;

const LeftActions = styled.div`
  display: flex;
  gap: 10px;
`;

const RightActions = styled.div`
  display: flex;
  gap: 10px;
`;

const ActionBtn = styled.button`
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: all 0.2s;
`;

const WriteBtn = styled(ActionBtn)`
  background-color: #4d82f3;
  color: white;
  border: none;
  &:hover {
    background-color: #3a6ad4;
  }
`;

const GrayBtn = styled(ActionBtn)`
  background-color: #f1f1f1;
  color: #333;
  border: 1px solid #ddd;
  &:hover {
    background-color: #e5e5e5;
  }
`;
// #endregion

const PostDetail = () => {
    const navigate = useNavigate();
    const [comment, setComment] = useState("");

    const { id } = useParams();
    const [post, setPost] = useState(null);

    useEffect(() => {
        const fetchPostDetail = async () => {
            try {
                const data = await communityAPI.getPostDetail(id);
                setPost(data);
            } catch (error) {
                console.error("게시글 조회 실패:", error);
            }
        };

        fetchPostDetail();
    }, [id]);

    if (!post) return null;
    return (
        <Container>
            <CategoryName>{post.categoryName}</CategoryName>
            <Title>{post.title}</Title>
            <Meta>
                <Info>
                    <span>{post.authorNickname}</span>
                    <span>{post.createdAt}</span>
                    {post.updatedAt && (
                        <span style={{ fontStyle: 'italic' }}>
                            수정됨: {post.updatedAt}
                        </span>
                    )}
                </Info>
                <Actions>
                    <ActionButton><FaPencilAlt /> 수정</ActionButton>
                    <ActionButton><FaTrash /> 삭제</ActionButton>
                    <ViewCount><FaEye />{post.views}</ViewCount>
                </Actions>
            </Meta>

            <Content>
                {post.content}
            </Content>

            <Footer>
                <VoteButtons>
                    <VoteButton type="up"><FaArrowUp /></VoteButton>
                    <VoteCount>{post.voteCount}</VoteCount>
                    <VoteButton type="down"><FaArrowDown /></VoteButton>
                </VoteButtons>
                <ReportButton><FaFlag /> 신고</ReportButton>
            </Footer>

            {/*정적으로 만들어놓은 댓글 영역 */}
            <CommentsSection>
                <CommentsHeader>
                    <span>댓글</span>
                    <span style={{ color: '#888', fontSize: '16px' }}>8개</span>
                </CommentsHeader>

                <CommentForm>
                    <TextArea
                        placeholder="댓글을 입력하세요..."
                        maxLength={3000}
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                    />
                    <CharCounter style={{ color: comment.length >= 3000 ? '#ff4d4d' : '#888' }}>{comment.length} / 3000</CharCounter>
                    <SubmitButton disabled={!comment.trim()}>등록</SubmitButton>
                    <div style={{ clear: 'both' }}></div>
                </CommentForm>

                <CommentList>
                    <Comment>
                        <CommentHeader>
                            <div>
                                <CommentAuthor>박지민</CommentAuthor>
                                <span>2025.05.06 10:12</span>
                                <span style={{ marginLeft: 5 }}>수정됨</span>
                            </div>
                        </CommentHeader>
                        <CommentContent>설악산 케이블카 가격이 어떻게 되나요? 주차는 편했나요?</CommentContent>
                        <CommentActions>
                            <CommentVoteButtons>
                                <CommentVoteButton type="up"><FaArrowUp /></CommentVoteButton>
                                <CommentVoteCount>5</CommentVoteCount>
                                <CommentVoteButton type="down"><FaArrowDown /></CommentVoteButton>
                            </CommentVoteButtons>
                            <span><FaReply /> 답글</span>
                            <span><FaFlag /> 신고</span>
                        </CommentActions>

                        <ReplyList>
                            <Reply>
                                <CommentHeader>
                                    <div>
                                        <CommentAuthor>김선경</CommentAuthor>
                                        <span>2025.05.06 10:45</span>
                                    </div>
                                </CommentHeader>
                                <CommentContent>
                                    케이블카는 성인 왕복 25,000원이었어요! 주차는 주말이라 좀 붐볐지만, 오전 일찍 도착해서 큰 문제는 없었습니다. 주차비는 무료였어요.
                                </CommentContent>
                                <CommentActions>
                                    <CommentVoteButtons>
                                        <CommentVoteButton type="up"><FaArrowUp /></CommentVoteButton>
                                        <CommentVoteCount>3</CommentVoteCount>
                                        <CommentVoteButton type="down"><FaArrowDown /></CommentVoteButton>
                                    </CommentVoteButtons>
                                    <span><FaReply /> 답글</span>
                                    <span><FaFlag /> 신고</span>
                                </CommentActions>
                                <ReplyForm>
                                    <ReplyTextarea placeholder="답글을 입력하세요..." maxLength={3000} />
                                    <ReplyCharCounter>0 / 3000</ReplyCharCounter>
                                    <ReplyButton>등록</ReplyButton>
                                    <div style={{ clear: 'both' }}></div>
                                </ReplyForm>
                            </Reply>
                        </ReplyList>
                    </Comment>

                    <Comment>
                        <CommentHeader>
                            <div>
                                <CommentAuthor>이수진</CommentAuthor>
                                <span>2025.05.06 12:33</span>
                            </div>
                        </CommentHeader>
                        <CommentContent>바다뷰 펜션 가격대가 어떻게 되나요? 4인 가족 기준으로 알려주시면 감사하겠습니다.</CommentContent>
                        <CommentActions>
                            <CommentVoteButtons>
                                <CommentVoteButton type="up"><FaArrowUp /></CommentVoteButton>
                                <CommentVoteCount>2</CommentVoteCount>
                                <CommentVoteButton type="down"><FaArrowDown /></CommentVoteButton>
                            </CommentVoteButtons>
                            <span><FaReply /> 답글</span>
                            <span><FaFlag /> 신고</span>
                        </CommentActions>
                    </Comment>
                </CommentList>
            </CommentsSection>


            <PostActionsBar>
                <LeftActions>
                    <WriteBtn onClick={() => navigate("/community/board/write")}><FaPen /> 글쓰기</WriteBtn>
                </LeftActions>
                <RightActions>
                    <GrayBtn onClick={() => navigate("/community")}><FaHome /> 커뮤니티 메인</GrayBtn>
                    <GrayBtn><FaList /> 목록</GrayBtn>
                    <GrayBtn><FaArrowUp /> TOP</GrayBtn>
                </RightActions>
            </PostActionsBar>
        </Container>
    );
};

export default PostDetail;
