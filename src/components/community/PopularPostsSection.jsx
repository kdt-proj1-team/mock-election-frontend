import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { formatPostTimeSmart } from "../../utils/DateFormatter";
import styled from "styled-components";
import { FaThumbsUp, FaCommentDots, FaEye } from 'react-icons/fa';
import { postAPI } from "../../api/PostApi";

// #region styled-components
const Section = styled.section`

`;

const Title = styled.h2`
  font-size: 22px;
  font-weight: 700;
  margin: 40px 0 20px;
`;

const PostList = styled.div`
  margin-bottom: 40px;
`;

const PostItem = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-5px);
  }
`;

const PostHeader = styled.div`
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 10px;
  margin-bottom: 15px;
  font-size: 12px;
  color: #999;
`;

const PostTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 10px;
`;

const PostContent = styled.p`
  font-size: 14px;
  line-height: 1.6;
  color: #333;
  margin-bottom: 15px;
`;

const PostFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const PostStats = styled.div`
  display: flex;
  gap: 15px;
  font-size: 13px;
  color: #666;
`;

const PostStat = styled.span`
  display: flex;
  align-items: center;
  gap: 5px;

  svg {
    position: relative;
    top: 1px;
  }
`;

const PostButton = styled.button`
  background-color: transparent;
  color: #333;
  border: 1px solid #e1e1e1;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  text-decoration: none;
`;
// #endregion

const PopularPostsSection = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPopularPosts = async () => {
      try {
        const data = await postAPI.getPopularPosts();
        setPosts(data);
      } catch (error) {
        console.error("인기 게시글 조회 실패", error);
      }
    };
    fetchPopularPosts();
  }, []);

  return (
    <Section>
      <Title>인기 게시글</Title>
      <PostList>
        {posts.map((post) => (
          <PostItem key={post.id}>
            <PostHeader>{post.categoryName} • 작성자: {post.authorNickname} • {formatPostTimeSmart(post.createdAt)}</PostHeader>
            <PostTitle>{post.title}</PostTitle>
            <PostContent>{post.summaryContent}</PostContent>
            <PostFooter>
              <PostStats>
                <PostStat><FaThumbsUp /> {post.voteCount}</PostStat>
                <PostStat><FaCommentDots /> {post.commentCount}</PostStat>
                <PostStat><FaEye /> {post.views}</PostStat>
              </PostStats>
              <PostButton as={Link} to={`/community/post/${post.id}`}>자세히 보기</PostButton>
            </PostFooter>
          </PostItem>
        ))}
      </PostList>
    </Section>
  );
};

export default PopularPostsSection;