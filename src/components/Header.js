import React, { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import useAuthStore from '../store/authStore';

// Neumorphism 스타일 적용
const HeaderContainer = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background-color: #f0f0f3;  /* 배경색을 밝은 회색으로 설정 */
  box-shadow: 6px 6px 12px rgba(0, 0, 0, 0.1), -6px -6px 12px rgba(255, 255, 255, 0.7);  /* Neumorphism 그림자 효과 */
  position: sticky;
  top: 0;
  z-index: 100;
`;

const Logo = styled.h1`
  font-size: 22px;
  font-weight: 700;
  color: #333333;
  margin: 0;
  cursor: pointer;
  span {
    color: #999999;
  }
`;

const Navigation = styled.nav`
  display: flex;
  align-items: center;

  @media (max-width: 768px) {
    display: ${props => (props.isOpen ? 'flex' : 'none')};
    flex-direction: column;
    position: absolute;
    top: 60px;
    left: 0;
    right: 0;
    background-color: #ffffff;
    box-shadow: 6px 6px 12px rgba(0, 0, 0, 0.1), -6px -6px 12px rgba(255, 255, 255, 0.7);
    border-radius: 15px;
    padding: 20px;
  }
`;

const NavList = styled.ul`
  display: flex;
  list-style: none;
  margin-right: 30px;
  padding: 0;

  @media (max-width: 768px) {
    flex-direction: column;
    width: 100%;
  }
`;

const NavItem = styled.li`
  margin-left: 25px;

  @media (max-width: 768px) {
    margin-left: 0;
    margin-bottom: 15px;
  }
`;

// NavLink를 styled(Link)로 변경
const NavLink = styled(Link)`
  text-decoration: none;
  color: #333333;
  font-weight: 500;
  transition: color 0.3s;

  &:hover {
    color: #666666;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  margin-right: 15px;
`;

const UserName = styled.span`
  font-size: 14px;
  color: #666;
  margin-right: 10px;
`;

const UserAvatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #e0e0e0;
  background-image: ${props => props.src ? `url(${props.src})` : 'none'};
  background-size: cover;
  background-position: center;
  margin-right: 10px;
  box-shadow: inset 2px 2px 5px rgba(0, 0, 0, 0.1), inset -2px -2px 5px rgba(255, 255, 255, 0.8);  /* Neumorphism 효과 */
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
`;

const Button = styled.button`
  padding: 10px 15px;
  border-radius: 6px;
  border: none;
  background-color: ${props => (props.outline ? 'transparent' : '#e0e0e0')};
  color: ${props => (props.outline ? '#333333' : '#333333')};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: ${props =>
      props.outline
          ? '2px 2px 6px rgba(0, 0, 0, 0.1), -2px -2px 6px rgba(255, 255, 255, 0.7)'
          : 'inset 3px 3px 6px rgba(0, 0, 0, 0.3), inset -3px -3px 6px rgba(255, 255, 255, 0.7)'
  };
  transition: all 0.3s ease;

  &:hover {
    background-color: ${props => (props.outline ? '#f5f5f5' : '#cccccc')};
    box-shadow: ${props =>
        props.outline
            ? '2px 2px 6px rgba(0, 0, 0, 0.15), -2px -2px 6px rgba(255, 255, 255, 0.9)'  // 강조 효과
            : 'inset 5px 5px 8px rgba(0, 0, 0, 0.2), inset -5px -5px 8px rgba(255, 255, 255, 0.8)'
    };
  }

  &:active {
    box-shadow: ${props =>
        props.outline
            ? 'inset 1px 1px 3px rgba(0, 0, 0, 0.45), inset -1px -1px 3px rgba(255, 255, 255, 0.6)'  // 눌렸을 때 효과
            : 'inset 2px 2px 5px rgba(0, 0, 0, 0.6), inset -2px -2px 5px rgba(255, 255, 255, 0.7)'
    };
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;

  @media (max-width: 768px) {
    display: block;
  }
`;

const Header = () => {
  const navigate = useNavigate();
  const {
    isAuthenticated,
    userId,
    name,
    nickname,
    profileImgUrl,
    role,
    logout,
    deleteAccount
  } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/login');
  }, [logout, navigate]);

  const handleDeleteAccount = useCallback(async () => {
    if (window.confirm('정말로 회원 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      const result = await deleteAccount();
      if (result.success) {
        navigate('/login');
      }
    }
  }, [deleteAccount, navigate]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleAdminPageClick = () => {
    navigate('/admin');
  };

  const displayName = nickname || name || userId;

  return (
      <HeaderContainer>
        <Logo onClick={() => navigate('/')}>선견<span>지표</span></Logo>

        <MobileMenuButton onClick={toggleMobileMenu}>
          ☰
        </MobileMenuButton>

        <Navigation isOpen={mobileMenuOpen}>
          <NavList>
            <NavItem>
              <NavLink to="/candidate-compare">후보비교</NavLink>
            </NavItem>
            <NavItem>
              <NavLink to="/mock-voting">가상투표</NavLink>
            </NavItem>
            <NavItem>
              <NavLink to="/find-polling-station">투표소찾기</NavLink>
            </NavItem>
            <NavItem>
              <NavLink to="/policy-quiz">정책퀴즈</NavLink>
            </NavItem>
            <NavItem>
              <NavLink to="/community">커뮤니티</NavLink>
            </NavItem>
            <NavItem>
              <NavLink to="/chatbot">챗봇</NavLink>
            </NavItem>
            {role && role.toUpperCase() === 'USER' && (
                <NavItem>
                  <NavLink to="/mypage">마이페이지</NavLink>
                </NavItem>
            )}

            {/* 관리자 전용 메뉴 */}
            {role && role.toUpperCase() === 'ADMIN' && (
                <NavItem>
                  <NavLink to="/admin">
                    관리자페이지
                  </NavLink>
                </NavItem>
            )}
          </NavList>

          {isAuthenticated ? (
              <ButtonGroup>
                <UserInfo>
                  {profileImgUrl && <UserAvatar src={profileImgUrl} />}
                  <UserName>{displayName}</UserName>
                </UserInfo>
                <Button outline onClick={handleLogout}>로그아웃</Button>
                {/*<Button outline onClick={handleDeleteAccount}>회원탈퇴</Button>*/}
              </ButtonGroup>
          ) : (
              <ButtonGroup>
                {/*<Button outline onClick={() => navigate('/login')}>로그인</Button>*/}
                <Button onClick={() => navigate('/login')}>간편로그인</Button>
              </ButtonGroup>
          )}
        </Navigation>
      </HeaderContainer>
  );
};

export default Header;