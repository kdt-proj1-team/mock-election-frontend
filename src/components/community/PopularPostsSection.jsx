import React from "react";
import styled from "styled-components";


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

const PostButton = styled.button`
  background-color: transparent;
  color: #333;
  border: 1px solid #e1e1e1;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
`;

const PopularPostsSection = () => {
    return (
        <Section>
            <Title>인기 게시글</Title>
            <PostList>
                <PostItem>
                    <PostHeader>자유게시판 • 작성자: 행복한하루 • 1시간 전</PostHeader>
                    <PostTitle>주말에 다녀온 여행 후기와 추천 장소</PostTitle>
                    <PostContent>
                        지난 주말에 가족들과 함께 강원도로 여행을 다녀왔습니다. 생각보다 날씨도 좋고 경치도 아름다워서 정말 좋은 시간을 보냈어요. 특히 추천하고 싶은 곳은 양양의 해변과 속초의 맛집인데요...
                    </PostContent>
                    <PostFooter>
                        <PostStats>
                            <span>👍 32</span>
                            <span>💬 14</span>
                            <span>👁️ 287</span>
                        </PostStats>
                        <PostButton>자세히 보기</PostButton>
                    </PostFooter>
                </PostItem>

                <PostItem>
                    <PostHeader>정보게시판 • 작성자: 기술자료공유 • 3시간 전</PostHeader>
                    <PostTitle>[꿀팁] 효율적인 업무 관리를 위한 5가지 방법</PostTitle>
                    <PostContent>
                        업무 효율을 높이기 위한 여러 방법을 소개합니다. 첫째, 하루를 시작하기 전에 반드시 to-do 리스트를 작성하세요. 둘째, 중요하고 긴급한 일을 우선적으로 처리하는 우선순위 설정이 필요합니다...
                    </PostContent>
                    <PostFooter>
                        <PostStats>
                            <span>👍 56</span>
                            <span>💬 23</span>
                            <span>👁️ 412</span>
                        </PostStats>
                        <PostButton>자세히 보기</PostButton>
                    </PostFooter>
                </PostItem>

                <PostItem>
                    <PostHeader>질문게시판 • 작성자: 초보개발자 • 5시간 전</PostHeader>
                    <PostTitle>프로그래밍 입문자가 시작하기 좋은 언어는 무엇인가요?</PostTitle>
                    <PostContent>
                        프로그래밍을 처음 시작하려고 합니다. 입문자가 배우기 쉽고 활용도가 높은 언어를 추천해주세요. Python이 좋다는 이야기도 있고, JavaScript가 좋다는 의견도 있어서 고민이 됩니다...
                    </PostContent>
                    <PostFooter>
                        <PostStats>
                            <span>👍 41</span>
                            <span>💬 37</span>
                            <span>👁️ 329</span>
                        </PostStats>
                        <PostButton>자세히 보기</PostButton>
                    </PostFooter>
                </PostItem>
            </PostList>
        </Section>
    );
};

export default PopularPostsSection;