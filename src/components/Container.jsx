import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: ${(props) => (props.fullHeight ? '100vh' : 'auto')};
`;

export default Container;
