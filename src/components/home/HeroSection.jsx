import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Section, Container, Button } from '../ui/StyledComponents';

// 기본 배경 (살짝 밝은 회색)
const Hero = styled(Section)`
  background: #e0e5ec;
  color: #333;
  padding: 60px 0;
  text-align: center;
  min-height: 85vh;
`;

const HeroTitle = styled.h1`
  font-size: 48px;
  margin-bottom: 20px;
  color: #333;
`;

const HeroText = styled.p`
  font-size: 20px;
  margin-bottom: 30px;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
  color: #555;
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

const Countdown = styled.div`
  background: #e0e5ec;
  border-radius: 20px;
  padding: 30px;
  margin-top: 40px;
  display: inline-block;
  box-shadow: 9px 9px 16px #a3b1c6, -9px -9px 16px #ffffff;
`;

const CountdownTitle = styled.h2`
  margin-bottom: 20px;
  font-size: 24px;
  color: #333;
`;

const CountdownTimer = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
`;

const CountdownItem = styled.div`
  text-align: center;
`;

const CountdownNumber = styled.div`
  font-size: 40px;
  font-weight: bold;
  background: #e0e5ec;
  padding: 20px 30px;
  border-radius: 15px;
  box-shadow: inset 5px 5px 10px #a3b1c6, inset -5px -5px 10px #ffffff;
  min-width: 80px;
  display: inline-block;
`;

const CountdownLabel = styled.div`
  font-size: 14px;
  margin-top: 10px;
  color: #666;
`;



const HeroSection = () => {
  const [countdown, setCountdown] = useState({ days: 127, hours: 14, minutes: 32, seconds: 9 });

  const electionDate = new Date('2025-06-03T00:00:00');

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const difference = electionDate - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setCountdown({ days, hours, minutes, seconds });
      }
    };

    const timer = setInterval(updateCountdown, 1000);
    updateCountdown();

    return () => clearInterval(timer);
  }, []);

  return (
      <Hero>
        <Container>
          <HeroTitle>당신의 한 표가 만드는 변화</HeroTitle>
          <HeroText>
            올바른 선택을 위한 모든 정보와 도구를 제공합니다. 정책을 비교하고, 가상 투표를 경험하며, 나에게 맞는 후보를 찾아보세요.
          </HeroText>
          <ButtonGroup>
            <Button $accent>정책 성향 테스트</Button>
            <Button $secondary="true">투표소 찾기</Button>
          </ButtonGroup>

          <Countdown>
            <CountdownTitle>제 22대 대통령 선거까지</CountdownTitle>
            <CountdownTimer>
              <CountdownItem>
                <CountdownNumber>{countdown.days}</CountdownNumber>
                <CountdownLabel>일</CountdownLabel>
              </CountdownItem>
              <CountdownItem>
                <CountdownNumber>{countdown.hours}</CountdownNumber>
                <CountdownLabel>시간</CountdownLabel>
              </CountdownItem>
              <CountdownItem>
                <CountdownNumber>{countdown.minutes}</CountdownNumber>
                <CountdownLabel>분</CountdownLabel>
              </CountdownItem>
              <CountdownItem>
                <CountdownNumber>{countdown.seconds}</CountdownNumber>
                <CountdownLabel>초</CountdownLabel>
              </CountdownItem>
            </CountdownTimer>
          </Countdown>
        </Container>
      </Hero>
  );
};

export default HeroSection;