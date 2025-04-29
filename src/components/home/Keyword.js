import React from 'react';
import styled from 'styled-components';

const KeywordItem = styled.div`
  padding: 10px 20px;
  background-color: ${props => {
    if (props.selected) return '#666666';
    if (props.size === 'large') return '#333333';
    if (props.size === 'medium') return '#999999';
    return 'white';
  }};
  color: ${props => {
    if (props.selected || props.size === 'large' || props.size === 'medium') return 'white';
    return '#333333';
  }};
  border-radius: 30px;
  font-weight: 500;
  box-shadow: 0 3px 8px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: all 0.3s;
  font-size: ${props => {
    if (props.size === 'large') return '18px';
    if (props.size === 'medium') return '16px';
    if (props.size === 'small') return '14px';
    return '16px';
  }};
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
  }
`;

const Keyword = ({ id, text, size, selected, onClick }) => {
  return (
    <KeywordItem 
      size={size} 
      selected={selected}
      onClick={onClick}
    >
      {text}
    </KeywordItem>
  );
};

export default Keyword;