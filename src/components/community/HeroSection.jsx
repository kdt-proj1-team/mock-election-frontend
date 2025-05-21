import { useNavigate } from "react-router-dom";
import styled from "styled-components";

// #region styled-components
const Section = styled.section`
    text-align: center;
    padding: 40px;
    background-color: #f0f0f3;
    border-radius: 20px;
    box-shadow: 8px 8px 16px rgba(0, 0, 0, 0.1), -8px -8px 16px rgba(255, 255, 255, 0.7);
`;

const Title = styled.h1`
    font-size: 28px;
    font-weight: 700;
    margin-bottom: 15px;
    color: #333;
`;

const Subtitle = styled.p`
    font-size: 16px;
    color: #666;
    margin-bottom: 25px;
    line-height: 1.5;
`;

const ButtonGroup = styled.div`
    display: flex;
    justify-content: center;
    gap: 10px;
    margin-bottom: 30px;
`;

const NewPostButton = styled.button`
    background-color: ${({ theme }) => theme.colors.dark};
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
`;

const StatContainer = styled.div`
    background-color: white;
    border-radius: 8px;
    padding: 20px;
    display: flex;
    justify-content: space-between;
    max-width: 450px;
    margin: 0 auto;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

    @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
        flex-direction: column;
    }
`;

const StatItem = styled.div`
    text-align: center;
    flex: 1;

    &:not(:last-child) {
        border-right: 1px solid #e1e1e1;
    }

    @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
        padding: 10px 0;

        &:not(:last-child) {
            border-right: none;
            border-bottom: 1px solid #e1e1e1;
        }
    }
`;

const StatNumber = styled.div`
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 5px;
`;

const StatLable = styled.div`
    font-size: 12px;
    color: #999;
`;
// #endregion

const HeroSection = ({ communityStats }) => {
    const navigate = useNavigate();
    const userId = localStorage.getItem("userId");

    return (
        <Section>
            <Title>당신의 생각을 공유하는 공간</Title>
            <Subtitle>함께하는 이야기가 더욱 큰 가치를 만들어갑니다. 커뮤니티 멤버들과 함께 지식과 경험을 공유해보세요.</Subtitle>

            <ButtonGroup>
                <NewPostButton onClick={() => {
                    if (!userId) {
                        if (window.confirm("로그인 후 이용 가능한 기능입니다.\n로그인하시겠습니까?")) {
                            navigate("/login");
                        }
                        return;
                    } else {
                        navigate("/community/board/write")
                    }
                }}>게시글 작성하기</NewPostButton>
            </ButtonGroup>

            <StatContainer>
                <StatItem>
                    <StatNumber>{communityStats.userCount}</StatNumber>
                    <StatLable>회원수</StatLable>
                </StatItem>
                <StatItem>
                    <StatNumber>{communityStats.postCount}</StatNumber>
                    <StatLable>게시글</StatLable>
                </StatItem>
                <StatItem>
                    <StatNumber>{communityStats.commentCount}</StatNumber>
                    <StatLable>댓글</StatLable>
                </StatItem>
            </StatContainer>
        </Section>
    );
};

export default HeroSection;