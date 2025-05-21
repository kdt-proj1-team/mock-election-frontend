import styled from 'styled-components';
import logo from '../../src/assets/images/mock-voting/logo_white.png'
import NotionLogo from '../../src/assets/images/notion-logo.png'
import GithubLogo from '../../src/assets/images/github-logo.png'
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

const FooterWrapper = styled.footer`
  background-color: #000;
  padding: 70px 0 50px 0;
  border-top: 1px solid #333;
  color: #ccc;
`;

const FooterContainer = styled.div`
  margin: 0 auto;
  padding: 0 100px;
`;

const FooterContent = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 140px;
  margin-bottom: 40px;

  @media (max-width: 768px) {
    gap: 50px;
  }
`;

const FooterLinksGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 80px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 30px;
  }
`;

const FooterCol = styled.div`
  min-width: 200px;
  margin-bottom: 20px;
  padding: 0 15px;

  @media (max-width: 768px) {
    min-width: 100%;
  }
`;

const FooterLogo = styled.img`
  width: 180px;
  margin-bottom: 20px;
  cursor: pointer;
`;

const FooterText = styled.p`
  color: #bbb;
  font-size: 16px;
  margin-bottom: 20px;
`;

const FooterTitle = styled.h4`
  font-size: 18px;
  color: #fff;
  margin-bottom: 20px;
  font-weight: 600;
`;

const FooterList = styled.ul`
  list-style: none;
`;

const FooterItem = styled.li`
  margin-bottom: 10px;
`;

const FooterLink = styled(Link)`
  font-size: 15px;
  color: #bbb;
  text-decoration: none;
  transition: all 0.3s ease;

  &:hover {
    color: #aaa;
    padding-left: 4px;
  }
`;

const SocialLinks = styled.div`
  color: #fff;
  display: flex;
`;

const SocialLink = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 25px;
  height: 25px;
  margin-right: 10px;
  text-decoration: none;
  transition: all 0.3s ease;
`;

const Icon = styled.img`
  width: 23px;
  height: 23px;
  object-fit: contain;
  vertical-align: middle;
`;

const SocialSpan = styled.span`
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 32px;
  height: 32px;
`;

const FooterBottom = styled.div`
  padding-top: 20px;
  border-top: 1px solid #222;
  text-align: center;
`;

const FooterNote = styled.p`
  font-size: 14px;
  color: #999;
  margin-bottom: 5px;

  &:first-child {
    margin-bottom: 15px;
    font-weight: 500;
    color: #888;
  }
`;

const Footer = () => {
    const navigate = useNavigate();
    return (
        <FooterWrapper>
            <FooterContainer>
                <FooterContent>
                    <FooterCol>
                        <FooterLogo onClick={() => {navigate('/'); window.scrollTo(0, 0);}} src={logo} alt="로고" />
                        <FooterText>
                            올바른 선택을 위한 정보 전달과 참여하는 정치문화 조성에 앞장서겠습니다.
                        </FooterText>
                        <SocialLinks>
                            <SocialLink href="https://github.com/kdt-proj1-team" target="_blank" rel="noopener noreferrer">
                                <SocialSpan><Icon src={GithubLogo} alt="깃허브로고" /></SocialSpan>
                            </SocialLink>
                            <SocialLink href="https://www.notion.so/3-Untitled-by-TechX-V1-0-1de87e9757de80a2be00cea780280021" target="_blank" rel="noopener noreferrer">
                                <SocialSpan><Icon src={NotionLogo} alt="노션로고" /></SocialSpan>
                            </SocialLink>
                        </SocialLinks>
                    </FooterCol>
                    <FooterLinksGroup>
                        <FooterCol>
                            <FooterTitle>주요기능</FooterTitle>
                            <FooterList>
                                <FooterItem><FooterLink to="/" onClick={() => window.scrollTo(0, 0)}>홈</FooterLink></FooterItem>
                                <FooterItem><FooterLink to="/candidate-compare" onClick={() => window.scrollTo(0, 0)}>후보비교</FooterLink></FooterItem>
                                <FooterItem><FooterLink to="/mock-voting" onClick={() => window.scrollTo(0, 0)}>모의투표</FooterLink></FooterItem>
                                <FooterItem><FooterLink to="/find-polling-station" onClick={() => window.scrollTo(0, 0)}>투표소 찾기</FooterLink></FooterItem>
                                <FooterItem><FooterLink to="/electionQuiz" onClick={() => window.scrollTo(0, 0)}>선거퀴즈</FooterLink></FooterItem>
                                <FooterItem><FooterLink to="/chatbot" onClick={() => window.scrollTo(0, 0)}>챗봇</FooterLink></FooterItem>
                            </FooterList>
                        </FooterCol>

                        <FooterCol>
                            <FooterTitle>참여하기</FooterTitle>
                            <FooterList>
                                <FooterItem><FooterLink to="/community" onClick={() => window.scrollTo(0, 0)}>커뮤니티</FooterLink></FooterItem>
                            </FooterList>
                        </FooterCol>
                    </FooterLinksGroup>
                </FooterContent>

                <FooterBottom>
                    <FooterNote>본 사이트는 교육 목적으로 제작된 모의 플랫폼이며, 특정 정당이나 후보를 지지하지 않습니다.</FooterNote>
                    <FooterNote>(08708) 서울 관악구 봉천로 227 보라매샤르망</FooterNote>
                    <FooterNote>Copyright © 2025 TechX. All Rights Reserved.</FooterNote>
                </FooterBottom>
            </FooterContainer>
        </FooterWrapper>
    );
};

export default Footer;
