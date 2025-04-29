import React from 'react';
import styled from 'styled-components';
import { Section } from '../ui/StyledComponents';

const StyledCTASection = styled(Section)`
  padding: 80px 0;
  background: linear-gradient(135deg, #222222 0%, #333333 100%);
  color: white;
  text-align: center;
`;

const CTAContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
`;

const CTATitle = styled.h2`
  font-size: 36px;
  margin-bottom: 20px;
`;

const CTAText = styled.p`
  font-size: 18px;
  margin-bottom: 30px;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
`;

const Button = styled.button`
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.2s;
  
  background-color: ${props => {
    if (props.accent) return '#999999';
    if (props.secondary) return '#666666';
    if (props.admin) return '#4267b2';
    return '#333333';
  }};
  
  color: ${props => {
    if (props.accent) return '#222222';
    return 'white';
  }};
  
  &:hover {
    background-color: ${props => {
      if (props.accent) return '#888888';
      if (props.secondary) return '#555555';
      if (props.admin) return '#365899';
      return '#222222';
    }};
  }
`;

const AdminButton = styled(Button)`
  margin-top: 20px;
  background-color: #4267b2;
  
  &:hover {
    background-color: #365899;
  }
`;

const CTASection = ({ isAdmin, onAdminClick }) => {
  const handleTestClick = () => {
    console.log('정책 성향 테스트 클릭');
    // 여기에 정책 성향 테스트로 이동하는 로직을 추가할 수 있습니다
  };

  const handleAlertClick = () => {
    console.log('알림 설정 클릭');
    // 여기에 알림 설정 화면으로 이동하는 로직을 추가할 수 있습니다
  };

  return (
    <StyledCTASection>
      <CTAContainer>
        <CTATitle>정책 맞춤 추천 받기</CTATitle>
        <CTAText>
          나의 관심사와 우선순위에 맞는 정책을 찾아보세요. 
          간단한 질문에 답하면 당신에게 가장 적합한 정책을 추천해드립니다.
        </CTAText>
        <ButtonGroup>
          <Button accent onClick={handleTestClick}>정책 성향 테스트</Button>
          <Button secondary onClick={handleAlertClick}>알림 설정하기</Button>
        </ButtonGroup>
        
        {/* 관리자 역할일 경우 관리자 페이지 버튼 표시 */}
        {isAdmin && (
          <AdminButton onClick={onAdminClick}>
            관리자 페이지
          </AdminButton>
        )}
      </CTAContainer>
    </StyledCTASection>
  );
};

export default CTASection;