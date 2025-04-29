import React from 'react';
import styled from 'styled-components';
import { Button } from '../ui/StyledComponents';

const Card = styled.div`
  background-color: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  transition: transform 0.3s;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const CardImage = styled.div`
  height: 160px;
  background-color: #e0e0e0;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 48px;
  color: #333333;
`;

const CardContent = styled.div`
  padding: 20px;
`;

const CardTitle = styled.h3`
  margin-bottom: 10px;
  font-size: 22px;
`;

const CardText = styled.p`
  color: #666;
  margin-bottom: 15px;
`;

const FeatureCard = ({ icon, title, description, buttonText, onClick }) => {
  return (
    <Card>
      <CardImage>{icon}</CardImage>
      <CardContent>
        <CardTitle>{title}</CardTitle>
        <CardText>{description}</CardText>
        <Button primary onClick={onClick}>{buttonText}</Button>
      </CardContent>
    </Card>
  );
};

export default FeatureCard;