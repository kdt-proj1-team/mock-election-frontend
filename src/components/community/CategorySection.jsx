import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import useCategoryStore from "../../store/categoryStore";


// #region styled-components
const Section = styled.section`
  position: relative;
  padding: 0;
`;

const Title = styled.h2`
  font-size: 22px;
  font-weight: 700;
  margin: 40px 0 20px;
`;

const CardSliderWrapper = styled.div`
  position: relative;
  
`;

const CardSliderContainer = styled.div`
  position: relative;
  overflow: hidden;
  margin-bottom: 40px;
`;

const CardSlider = styled.div`
  display: flex;
  transition: transform 0.3s ease;
  gap: 20px;
  padding: 2px;
`;

const Card = styled.div`
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s;
  flex: 0 0 250px;
  width: 250px;

  &:hover {
    transform: translateY(-5px);
  }
`;

const CardContent = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const CardTitle = styled.h3`
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 10px;
`;

const CardDescription = styled.p`
  font-size: 14px;
  color: #666;
  margin-bottom: 15px;
  line-height: 1.5;
`;

const CardButton = styled.button`
  width: 75px;
  height: 33px;
  background-color: transparent;
  color: #333;
  border: 1px solid #e1e1e1;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: auto;
  text-decoration: none;

  &:hover {
    background-color: #f5f6f7;
    text-decoration: none;
  }
`;

const SliderButton = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: white;
  border: 1px solid #e1e1e1;
  cursor: pointer;
  z-index: 100;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
  opacity: 1;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: #f5f6f7;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PrevButton = styled(SliderButton)`
  left: 0;
`;

const NextButton = styled(SliderButton)`
  right: 0;
`;

const ArrowIcon = styled.span`
  display: block;
  font-size: 16px;
  color: #333;
`;
// #endregion

const CategorySection = () => {
  const { categories } = useCategoryStore();

  const [scrollPosition, setScrollPosition] = useState(0);
  const [showButtons, setShowButtons] = useState(false);
  const [visibleCards, setVisibleCards] = useState(4);
  const sliderRef = useRef(null);
  const containerRef = useRef(null);

  const cardCount = categories.length;

  // 화면 크기에 따라 보여질 카드 수와 버튼 표시 여부 계산
  const calculateLayout = () => {
    if (!containerRef.current) return;

    const containerWidth = containerRef.current.clientWidth;
    const cardWidth = 250; // 카드 너비
    const gap = 20; // 카드 간격
    const buttonSpace = 60; // 왼쪽, 오른쪽 버튼 공간

    // 컨테이너에 표시 가능한 카드 수 계산 (버튼 공간 고려)
    const availableSpace = containerWidth - buttonSpace;
    const possibleCards = Math.floor(availableSpace / (cardWidth + gap));

    // 최소 1개, 최대 전체 카드 수로 제한
    const visible = Math.max(1, Math.min(possibleCards, cardCount));
    setVisibleCards(visible);

    // 카드 수가 표시 가능한 카드 수보다 많을 때만 버튼 표시
    setShowButtons(cardCount > visible);

    // 스크롤 위치 조정 (현재 위치가 범위를 벗어날 경우)
    setScrollPosition(prev => Math.min(prev, Math.max(0, cardCount - visible)));
  };

  useEffect(() => {
    calculateLayout();
    window.addEventListener('resize', calculateLayout);

    return () => {
      window.removeEventListener('resize', calculateLayout);
    };
  }, [cardCount]);

  const handlePrev = () => {
    setScrollPosition(prev => Math.max(prev - 2, 0));
  };

  const handleNext = () => {
    setScrollPosition(prev => Math.min(prev + 2, cardCount - visibleCards));
  };

  const isAtStart = scrollPosition === 0;
  const isAtEnd = scrollPosition >= cardCount - visibleCards;

  // 현재 카드가 전체 화면에 표시 가능한 경우 (예: 4개 카드를 가진 경우)
  const allCardsVisible = cardCount <= visibleCards;

  return (
    <Section>
      <Title>게시판</Title>

      <CardSliderWrapper ref={containerRef}>
        <CardSliderContainer>
          <CardSlider ref={sliderRef} style={{ transform: allCardsVisible ? 'none' : `translateX(-${scrollPosition * 270}px)` }}>
            <Card>
              <CardContent>
                <CardTitle>전체</CardTitle>
                <CardDescription>회원들이 작성한 모든 게시글을 한눈에 확인할 수 있는 공간입니다.</CardDescription>
                <CardButton as={Link} to={`/community?category=all`}>바로가기</CardButton>
              </CardContent>
            </Card>
            {categories.map((category) => (
              <Card key={category.id}>
                <CardContent>
                  <CardTitle>{category.name}</CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                  <CardButton as={Link} to={`/community?category=${category.code}`}>바로가기</CardButton>
                </CardContent>
              </Card>
            ))}
          </CardSlider>
        </CardSliderContainer>

        {showButtons && !isAtStart && (
          <PrevButton onClick={handlePrev}>
            <ArrowIcon>◀</ArrowIcon>
          </PrevButton>
        )}

        {showButtons && !isAtEnd && (
          <NextButton onClick={handleNext}>
            <ArrowIcon>▶</ArrowIcon>
          </NextButton>
        )}
      </CardSliderWrapper>
    </Section>
  );
};

export default CategorySection;