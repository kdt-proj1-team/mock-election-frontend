import React from "react";
import styled from "styled-components";

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
`;

const NewsListDate = styled.div`
  font-size: 12px;
  color: #999;
`;



const CommunityNewsSection = () => {
    return (
        <Section>
            <Title>커뮤니티 소식</Title>
            <NewsGrid>
                <NewsMain>
                    <NewsContent>
                        <NewsDate>2025.05.01</NewsDate>
                        <NewsTitle>5월 커뮤니티 이벤트 안내</NewsTitle>
                        <PostContent>
                            5월을 맞이하여 커뮤니티 활성화를 위한 다양한 이벤트를 준비했습니다. 출석 체크 이벤트부터 인증샷 콘테스트까지 다양한 혜택이 준비되어 있으니 많은 참여 부탁드립니다. 자세한 내용은 공지사항 게시판을 확인해주세요.
                        </PostContent>
                        <PostButton>자세히 보기</PostButton>
                    </NewsContent>
                </NewsMain>

                <NewsList>
                    {[
                        ["커뮤니티 이용 가이드라인 업데이트 안내", "2025.04.28"],
                        ["새로운 게시판 '취미 공유' 오픈 안내", "2025.04.25"],
                        ["모바일 앱 출시 이벤트 당첨자 발표", "2025.04.20"],
                        ["커뮤니티 화상 미팅 일정 안내", "2025.04.15"],
                        ["사이트 서버 점검 안내 (5/5 02:00-05:00)", "2025.04.10"],
                    ].map(([title, date], idx) => (
                        <NewsListItem key={idx}>
                            <NewsListItemDot />
                            <NewsListContent>
                                <NewsListTitle>{title}</NewsListTitle>
                                <NewsListDate>{date}</NewsListDate>
                            </NewsListContent>
                        </NewsListItem>
                    ))}
                </NewsList>
            </NewsGrid>
        </Section>
    );
};

export default CommunityNewsSection;