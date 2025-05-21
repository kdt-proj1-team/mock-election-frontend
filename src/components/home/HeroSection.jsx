import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Section, Container} from '../ui/StyledComponents';
import { Link } from 'react-router-dom';

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

const Button = styled.button`
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  padding: 13px 20px;
  border: none;
  border-radius: 5px;
  color: #fff;
  background-color: #222;
  transition: all 0.2s ease;
  text-decoration: none;

  &:first-of-type {
    background-color: #666;
  }

  &:hover {
    background-color: #000;
  }
`;

// const Countdown = styled.div`
//   background: #e0e5ec;
//   border-radius: 20px;
//   padding: 30px;
//   margin-top: 40px;
//   display: inline-block;
//   box-shadow: 9px 9px 16px #a3b1c6, -9px -9px 16px #ffffff;
// `;

const Countdown = styled.div`
  background: #e0e5ec;
  border-radius: 20px;
  padding: 30px;
  margin-top: 40px;
  display: inline-block;
  box-shadow: 9px 9px 16px #a3b1c6, -9px -9px 16px #ffffff;
  
  @media (max-width: 768px) {
    padding: 20px;
    width: 90%;
    max-width: 400px;
  }
  
  @media (max-width: 480px) {
    padding: 15px;
    width: 95%;
  }
`;

// const CountdownTitle = styled.h2`
//   margin-bottom: 20px;
//   font-size: 24px;
//   color: #333;
// `;

const CountdownTitle = styled.h2`
  margin-bottom: 20px;
  font-size: 24px;
  color: #333;
  
  @media (max-width: 768px) {
    font-size: 20px;
    margin-bottom: 15px;
  }
  
  @media (max-width: 480px) {
    font-size: 18px;
  }
`;

// const CountdownTimer = styled.div`
//   display: flex;
//   justify-content: center;
//   gap: 20px;
// `;

const CountdownTimer = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
  
  @media (max-width: 768px) {
    gap: 15px;
  }
  
  @media (max-width: 480px) {
    gap: 10px;
    flex-wrap: wrap;
  }
`;

// const CountdownItem = styled.div`
//   text-align: center;
// `;

const CountdownItem = styled.div`
  text-align: center;
  
  @media (max-width: 480px) {
    flex: 0 0 45%;
    margin-bottom: 10px;
  }
`;

// const CountdownNumber = styled.div`
//   font-size: 40px;
//   font-weight: bold;
//   background: #e0e5ec;
//   padding: 20px 30px;
//   border-radius: 15px;
//   box-shadow: inset 5px 5px 10px #a3b1c6, inset -5px -5px 10px #ffffff;
//   min-width: 80px;
//   display: inline-block;
// `;

const CountdownNumber = styled.div`
  font-size: 40px;
  font-weight: bold;
  background: #e0e5ec;
  padding: 20px 30px;
  border-radius: 15px;
  box-shadow: inset 5px 5px 10px #a3b1c6, inset -5px -5px 10px #ffffff;
  min-width: 80px;
  display: inline-block;
  
  @media (max-width: 768px) {
    font-size: 32px;
    padding: 15px 20px;
    min-width: 60px;
  }
  
  @media (max-width: 480px) {
    font-size: 28px;
    padding: 10px 15px;
    min-width: 50px;
  }
`;


// const CountdownLabel = styled.div`
//   font-size: 14px;
//   margin-top: 10px;
//   color: #666;
// `;
const CountdownLabel = styled.div`
  font-size: 14px;
  margin-top: 10px;
  color: #666;
  
  @media (max-width: 480px) {
    font-size: 12px;
    margin-top: 5px;
  }
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
            <Button as={Link} to="/candidate-compare" onClick={() => window.scrollTo(0, 0)}>후보 비교</Button>
            <Button as={Link} to="/find-polling-station" onClick={() => window.scrollTo(0, 0)}>투표소 찾기</Button>
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