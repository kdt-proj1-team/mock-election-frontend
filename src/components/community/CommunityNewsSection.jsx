import styled from "styled-components";
import { Link } from "react-router-dom";
import { formatDateOnly } from "../../utils/DateFormatter";

// #region styled-components
const Section = styled.section`

`;

const Title = styled.h2`
  font-size: 22px;
  font-weight: 700;
  margin: 40px 0 20px;
`;

const NewsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    grid-template-columns: 1fr;
  }
`;

const NewsMain = styled.div`
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const NewsContent = styled.div`
  padding: 20px;
`;

const NewsDate = styled.div`
  font-size: 12px;
  color: #999;
  margin-bottom: 5px;
`;

const NewsTitle = styled.h3`
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 10px;
  text-decoration: none;
  cursor: pointer;
  color: inherit;
  display: block;
  transition: font-size 0.2s ease;

  &:hover {
    font-size: 17px;
  }
`;

const PostContent = styled.p`
  font-size: 14px;
  line-height: 1.6;
  color: #333;
  margin-bottom: 15px;
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

const NewsList = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const NewsListItem = styled.div`
  display: flex;
  margin-bottom: 15px;
`;

const NewsListItemDot = styled.div`
  width: 24px;
  height: 24px;
  background-color: #eef2f8;
  border-radius: 50%;
  margin-right: 10px;
  flex-shrink: 0;
`;

const NewsListContent = styled.div`
  flex-grow: 1;
`;

const NewsListTitle = styled.div`
  font-size: 14px;
  margin-bottom: 5px;
  text-decoration: none;
  cursor: pointer;
  color: inherit;
  display: block;

  &:hover {
    font-weight: bold;
  }
`;

const NewsListDate = styled.div`
  font-size: 12px;
  color: #999;
`;
// #endregion

const CommunityNewsSection = ({ recentNotices }) => {
  const mainNotice = recentNotices[0];
  const listNotices = recentNotices.slice(1);

  return (
    <Section>
      <Title>커뮤니티 소식</Title>
      <NewsGrid>
        <NewsMain>
          <NewsContent>
            <NewsDate>{formatDateOnly(mainNotice.createdAt)}</NewsDate>
            <NewsTitle as={Link} to={`/community/post/${mainNotice.id}`}>{mainNotice.title}</NewsTitle>
            <PostContent>
              {mainNotice.summaryContent}
            </PostContent>
            <PostButton as={Link} to={`/community/post/${mainNotice.id}`}>자세히 보기</PostButton>
          </NewsContent>
        </NewsMain>

        <NewsList>
          {listNotices.map((notice) => (
            <NewsListItem key={notice.id}>
              <NewsListItemDot />
              <NewsListContent>
                <NewsListTitle as={Link} to={`/community/post/${notice.id}`}>{notice.title}</NewsListTitle>
                <NewsListDate>{formatDateOnly(notice.createdAt)}</NewsListDate>
              </NewsListContent>
            </NewsListItem>
          ))}
        </NewsList>
      </NewsGrid>
    </Section>
  );
};

export default CommunityNewsSection;