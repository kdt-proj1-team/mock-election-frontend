import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { createGlobalStyle } from 'styled-components';
import { setupAxiosInterceptors } from './utils/AxiosInterceptor';

// 전역 스타일 설정
const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  
  body {
    font-family: 'Segoe UI', 'Roboto', sans-serif;
    background-color: #f0f2f5;
    color: #1c1e21;
  }
  
  button, input, textarea {
    font-family: inherit;
  }
`;

setupAxiosInterceptors();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <GlobalStyle />
    <App />
  </React.StrictMode>
);