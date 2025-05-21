import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import useAuthStore from '../store/authStore';
import useWalletStore from '../store/walletStore';
import MetaMaskUtil from '../utils/MetaMaskUtil';
import PageTranslator from './translation/PageTranslator';
import logo from '../../src/assets/images/mock-voting/logo.png'
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

const DisclaimerBar = styled.div`
  background-color: #f9f9f9;
  color: #555;
  font-size: 14px;
  padding: 8px 16px;
  text-align: center;
  width:305px;
  border-bottom: 1px solid #ddd;
  strong {
    font-weight: bold;
    color: #000000;
  }
`;


const Logo = styled.h1`
  font-size: 22px;
  font-weight: 700;
  color: #333333;
  margin: 0;
  cursor: pointer;

  img {
    width: 150px;
    height: 60px;
    object-fit: contain;
    margin-right: 8px;
  }
`;

const Navigation = styled.nav`
  display: flex;
  align-items: center;

  @media (max-width: 768px) {
    display: ${props => (props.$isOpen ? 'flex' : 'none')};
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
  background-color: ${props => (props.$outline ? 'transparent' : '#e0e0e0')};
  color: ${props => (props.$outline ? '#333333' : '#333333')};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: ${props =>
      props.$outline
          ? '2px 2px 6px rgba(0, 0, 0, 0.1), -2px -2px 6px rgba(255, 255, 255, 0.7)'
          : 'inset 3px 3px 6px rgba(0, 0, 0, 0.3), inset -3px -3px 6px rgba(255, 255, 255, 0.7)'
  };
  transition: all 0.3s ease;

  &:hover {
    background-color: ${props => (props.$outline ? '#f5f5f5' : '#cccccc')};
    box-shadow: ${props =>
        props.$outline
            ? '2px 2px 6px rgba(0, 0, 0, 0.15), -2px -2px 6px rgba(255, 255, 255, 0.9)'  // 강조 효과
            : 'inset 5px 5px 8px rgba(0, 0, 0, 0.2), inset -5px -5px 8px rgba(255, 255, 255, 0.8)'
    };
  }

  &:active {
    box-shadow: ${props =>
        props.$outline
            ? 'inset 1px 1px 3px rgba(0, 0, 0, 0.45), inset -1px -1px 3px rgba(255, 255, 255, 0.6)'  // 눌렸을 때 효과
            : 'inset 2px 2px 5px rgba(0, 0, 0, 0.6), inset -2px -2px 5px rgba(255, 255, 255, 0.7)'
    };
  }
`;

// 지갑 연결 상태를 표시하는 뱃지 스타일
const WalletBadge = styled.div`
  display: flex;
  align-items: center;
  background-color: #eefbf5;
  border-radius: 20px;
  padding: 5px 10px;
  margin-right: 10px;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.05), -2px -2px 5px rgba(255, 255, 255, 0.5);
`;

const WalletIcon = styled.span`
  font-size: 16px;
  margin-right: 5px;
  color: #2ecc71;
`;

const WalletAddress = styled.span`
  font-size: 12px;
  color: #333;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const TokenAmount = styled.span`
  font-size: 12px;
  color: #2ecc71;
  margin-left: 8px;
  font-weight: 600;
`;

// 모달 관련 스타일
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: #f0f0f3;
  border-radius: 15px;
  padding: 30px;
  width: 90%;
  max-width: 500px;
  box-shadow: 10px 10px 20px rgba(0, 0, 0, 0.1), -10px -10px 20px rgba(255, 255, 255, 0.8);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const ModalTitle = styled.h2`
  font-size: 20px;
  color: #333;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
`;

const WalletOption = styled.div`
  padding: 15px;
  margin: 10px 0;
  border-radius: 10px;
  background-color: #f0f0f3;
  display: flex;
  align-items: center;
  cursor: pointer;
  box-shadow: 4px 4px 8px rgba(0, 0, 0, 0.1), -4px -4px 8px rgba(255, 255, 255, 0.9);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 6px 6px 12px rgba(0, 0, 0, 0.1), -6px -6px 12px rgba(255, 255, 255, 1);
    transform: translateY(-2px);
  }
`;

const WalletLogo = styled.div`
  width: 40px;
  height: 40px;
  margin-right: 15px;
  background-image: ${props => props.src ? `url(${props.src})` : 'none'};
  background-size: cover;
  background-position: center;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  color: #FF6B00;
`;

const WalletInfo = styled.div`
  flex: 1;
`;

const WalletName = styled.h3`
  font-size: 16px;
  color: #333;
  margin: 0 0 5px 0;
`;

const WalletDesc = styled.p`
  font-size: 12px;
  color: #666;
  margin: 0;
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

// 지갑 생성 결과 모달 스타일
const NewWalletInfo = styled.div`
  margin-top: 20px;
  padding: 15px;
  background-color: #f8f8f8;
  border-radius: 8px;
  box-shadow: inset 2px 2px 5px rgba(0, 0, 0, 0.05), inset -2px -2px 5px rgba(255, 255, 255, 0.5);
`;

const InfoItem = styled.div`
  margin-bottom: 10px;
`;

const InfoLabel = styled.div`
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
`;

const InfoValue = styled.div`
  font-family: monospace;
  font-size: 14px;
  color: #333;
  word-break: break-all;
  background-color: #fff;
  padding: 8px;
  border-radius: 4px;
  box-shadow: inset 1px 1px 3px rgba(0, 0, 0, 0.1), inset -1px -1px 3px rgba(255, 255, 255, 0.7);
`;

const WarningText = styled.p`
  color: #e74c3c;
  font-size: 12px;
  margin-top: 15px;
`;

const InfoText = styled.p`
  color: #3498db;
  font-size: 14px;
  margin-top: 15px;
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
    refreshUserInfo
  } = useAuthStore();

  // 지갑 관련 상태 관리
  const {
    isWalletConnected,
    walletAddress,
    tokenBalance,
    connectMetaMask,
    createNewWallet,
    disconnectWallet,
    checkWalletStatus,
  } = useWalletStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [newWalletInfo, setNewWalletInfo] = useState(null);
  const [isLoadingWallet, setIsLoadingWallet] = useState(false);
  const [walletError, setWalletError] = useState(null);
  const [walletMessage, setWalletMessage] = useState("");

  // 컴포넌트 마운트 시, 로그인 상태라면 사용자 정보 새로고침
  useEffect(() => {
    if (isAuthenticated) {
      refreshUserInfo();
    }
  }, [isAuthenticated, refreshUserInfo]);

  // 컴포넌트 마운트 시, 지갑 상태 확인
  useEffect(() => {
    if (isAuthenticated) {
      const checkWallet = async () => {
        await checkWalletStatus();
      };

      checkWallet();
    }
  }, [isAuthenticated, checkWalletStatus]);

  const handleLogout = useCallback(() => {
    disconnectWallet(); // 지갑도 함께 연결 해제
    logout();
    navigate('/login');
  }, [logout, navigate, disconnectWallet]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // 지갑 모달 열기
  const openWalletModal = () => {
    setShowWalletModal(true);
    setNewWalletInfo(null); // 이전 지갑 정보 초기화
    setWalletError(null); // 에러 초기화
    setWalletMessage(""); // 메시지 초기화
  };

  // 지갑 모달 닫기
  const closeWalletModal = () => {
    setShowWalletModal(false);
    setNewWalletInfo(null);
    setWalletError(null);
  };

  // 메타마스크 연결 처리
  const handleConnectMetaMask = async () => {
    try {
      setIsLoadingWallet(true);
      setWalletError(null);

      // 메타마스크 연결 시작
      const { address } = await connectMetaMask();
      console.log("메타마스크 연결 성공:", address);

      // 토큰 발급 상태에 따라 메시지 설정
      setWalletMessage("지갑이 성공적으로 연결되었습니다.");
      closeWalletModal();
    } catch (error) {
      console.error('메타마스크 연결 오류:', error);
      // 오류 응답 상세 로깅
      if (error.response) {
        console.log('상태 코드:', error.response.status);
        console.log('응답 데이터:', error.response.data);
      }
      setWalletError(error.response?.data?.message || error.message || "메타마스크 연결에 실패했습니다. 메타마스크가 설치되어 있는지 확인해주세요.");
    } finally {
      setIsLoadingWallet(false);
    }
  };

  // 새 지갑 생성 처리
  const handleCreateWallet = async () => {
    try {
      setIsLoadingWallet(true);
      setWalletError(null);

      // 지갑 생성 결과에는 address, mnemonic 정보가 들어있음
      const result = await createNewWallet();
      console.log("새 지갑 생성 성공:", result);

      // 생성된 지갑 정보 표시
      setNewWalletInfo({
        address: result.address,
        mnemonic: result.mnemonic,
        tokenBalance: tokenBalance,
        alreadyReceived: tokenBalance === 0 // 토큰이 0이면 이미 받은 것으로 간주
      });
    } catch (error) {
      console.error('지갑 생성 오류:', error);
      // 오류 응답 상세 로깅
      if (error.response) {
        console.log('상태 코드:', error.response.status);
        console.log('응답 데이터:', error.response.data);
      }
      setWalletError(error.response?.data?.message || error.message || "지갑 생성에 실패했습니다.");
    } finally {
      setIsLoadingWallet(false);
    }
  };

  // 지갑 연결 해제 처리
  const handleDisconnectWallet = () => {
    disconnectWallet();
  };

  // 이름 표시 우선순위: 닉네임 > 이름 > 아이디
  const displayName = nickname || name || userId || '';

  return (
      <HeaderContainer>

        <Logo onClick={() => navigate('/')}><img src={logo} alt="logo"/> </Logo>
        <DisclaimerBar>
          본 사이트는 <strong>교육 목적</strong>으로 제작된 모의 플랫폼이며, 특정 정당이나 후보를 지지하지 않습니다.
        </DisclaimerBar>
        <MobileMenuButton onClick={toggleMobileMenu}>
          ☰
        </MobileMenuButton>

        <Navigation $isOpen={mobileMenuOpen}>
          <NavList>
            <NavItem>
              <NavLink to="/candidate-compare">후보비교</NavLink>
            </NavItem>
            <NavItem>
              <NavLink to="/mock-voting">모의투표</NavLink>
            </NavItem>
            <NavItem>
              <NavLink to="/find-polling-station">투표소찾기</NavLink>
            </NavItem>
            <NavItem>
              <NavLink to="/electionQuiz">정책퀴즈</NavLink>
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

          {/* 번역기 컴포넌트 - 헤더 내부임을 명시 */}
          <PageTranslator inHeader={true} />

          {isAuthenticated ? (
              <ButtonGroup>
                {/*{isWalletConnected ? (*/}
                {/*    <>*/}
                {/*      <WalletBadge>*/}
                {/*        <WalletIcon>💰</WalletIcon>*/}
                {/*        <WalletAddress>{MetaMaskUtil.shortenAddress(walletAddress)}</WalletAddress>*/}
                {/*        <TokenAmount>{tokenBalance} VT</TokenAmount>*/}
                {/*      </WalletBadge>*/}
                {/*      <Button $outline onClick={handleDisconnectWallet}>지갑해제</Button>*/}
                {/*    </>*/}
                {/*) : (*/}
                {/*    <Button onClick={openWalletModal}>지갑연결</Button>*/}
                {/*)}*/}
                {isWalletConnected ? (
                    <>
                      <WalletBadge>
                        <WalletIcon>💰</WalletIcon>
                        <WalletAddress>{MetaMaskUtil.shortenAddress(walletAddress)}</WalletAddress>
                        <TokenAmount>{tokenBalance} VT</TokenAmount>
                      </WalletBadge>
                      {/* 지갑 해제 버튼 제거 */}
                    </>
                ) : (
                    <Button onClick={openWalletModal}>지갑연결</Button>
                )}
                <UserInfo>
                  {profileImgUrl && <UserAvatar src={profileImgUrl} />}
                  <UserName>{displayName}</UserName>
                </UserInfo>
                <Button $outline onClick={handleLogout}>로그아웃</Button>
              </ButtonGroup>
          ) : (
              <ButtonGroup>
                <Button onClick={() => navigate('/login')}>간편로그인</Button>
              </ButtonGroup>
          )}
        </Navigation>

        {/* 지갑 연결 모달 */}
        {showWalletModal && (
            <ModalOverlay>
              <ModalContent>
                <ModalHeader>
                  <ModalTitle>지갑 연결하기</ModalTitle>
                  <CloseButton onClick={closeWalletModal}>&times;</CloseButton>
                </ModalHeader>

                {/* 에러 메시지 */}
                {walletError && (
                    <div style={{ color: 'red', marginBottom: '15px', fontSize: '14px' }}>
                      {walletError}
                    </div>
                )}

                {/* 성공 메시지 */}
                {walletMessage && (
                    <div style={{ color: 'green', marginBottom: '15px', fontSize: '14px' }}>
                      {walletMessage}
                    </div>
                )}

                {/* 새 지갑 정보 */}
                {newWalletInfo ? (
                    <>
                      <NewWalletInfo>
                        <InfoItem>
                          <InfoLabel>지갑 주소</InfoLabel>
                          <InfoValue>{newWalletInfo.address}</InfoValue>
                        </InfoItem>
                        <InfoItem>
                          <InfoLabel>복구 구문 (니모닉)</InfoLabel>
                          <InfoValue>{newWalletInfo.mnemonic}</InfoValue>
                        </InfoItem>
                        <WarningText>
                          중요: 복구 구문을 안전한 곳에 보관하세요. 이 정보는 지갑 복구에 필요하며, 이 창을 닫으면 다시 볼 수 없습니다!
                        </WarningText>
                        {newWalletInfo.alreadyReceived && (
                            <InfoText>
                              참고: 토큰은 계정당 최초 1회만 발급됩니다. 이미 토큰을 발급받은 계정은 추가 토큰이 발급되지 않습니다.
                            </InfoText>
                        )}
                      </NewWalletInfo>
                      <Button
                          onClick={closeWalletModal}
                          style={{ width: '100%', marginTop: '20px' }}
                      >
                        확인하고 닫기
                      </Button>
                    </>
                ) : (
                    <>
                      <WalletOption
                          onClick={handleConnectMetaMask}
                          disabled={isLoadingWallet}
                      >
                        <WalletLogo>
                          <span role="img" aria-label="MetaMask">🦊</span>
                        </WalletLogo>
                        <WalletInfo>
                          <WalletName>MetaMask</WalletName>
                          <WalletDesc>기존 메타마스크 지갑을 연결합니다</WalletDesc>
                        </WalletInfo>
                      </WalletOption>

                      <WalletOption
                          onClick={handleCreateWallet}
                          disabled={isLoadingWallet}
                      >
                        <WalletLogo>
                          <span role="img" aria-label="New Wallet">🔐</span>
                        </WalletLogo>
                        <WalletInfo>
                          <WalletName>새 지갑 생성</WalletName>
                          <WalletDesc>모의투표용 새 지갑을 생성합니다</WalletDesc>
                        </WalletInfo>
                      </WalletOption>

                      {isLoadingWallet && (
                          <div style={{ textAlign: 'center', marginTop: '20px' }}>
                            <p>처리 중입니다...</p>
                          </div>
                      )}
                    </>
                )}
              </ModalContent>
            </ModalOverlay>
        )}
      </HeaderContainer>
  );
};

export default Header;