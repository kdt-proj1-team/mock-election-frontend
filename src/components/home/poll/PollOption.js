import React from 'react';
import styled from 'styled-components';

const StyledPollOption = styled.label`
  display: flex;
  align-items: center;
  padding: 15px;
  background-color: #f5f5f5;
  border-radius: 10px;
  cursor: ${props => props.disabled ? 'default' : 'pointer'};
  transition: background-color 0.3s;
  opacity: ${props => props.disabled ? 0.7 : 1};
  
  &:hover {
    background-color: ${props => props.disabled ? '#f5f5f5' : '#e0e0e0'};
  }
  
  input {
    margin-right: 15px;
  }
`;

const PollOption = ({ id, label, checked, onChange, disabled }) => {
  return (
    <StyledPollOption disabled={disabled}>
      <input 
        type="radio" 
        name="poll" 
        value={id} 
        checked={checked} 
        onChange={() => onChange(id)} 
        disabled={disabled}
      /> 
      {label}
    </StyledPollOption>
  );
};

export default PollOption;