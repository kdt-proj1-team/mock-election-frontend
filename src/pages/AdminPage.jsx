import { useState } from 'react';
import styled from 'styled-components';
import Dashboard from '../components/admin/Dashboard';
import UserManagement from '../components/admin/UserManagement';
import BoardManagement from '../components/admin/BoardManagement';
import ReportManagement from '../components/admin/ReportManagement';

const TabContainer = styled.div`
  display: flex;
  margin-bottom: 30px;
  border-bottom: 1px solid #ddd;
  overflow-x: auto;
`;

const Tab = styled.div`
  padding: 15px 30px;
  cursor: pointer;
  font-weight: ${(props) => (props.active ? '600' : '400')};
  font-size: 16px;
  color: ${(props) => (props.active ? '#1a73e8' : '#333')};
  border-bottom: ${(props) => (props.active ? '3px solid #1a73e8' : 'none')};

  &:hover {
    background-color: #f5f5f5;
  }
`;

const ContentContainer = styled.div`
  margin-top: 30px;
  min-height: 600px;
`;

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'users':
        return <UserManagement />;
      case 'boards':
        return <BoardManagement />;
      case 'reports':
        return <ReportManagement />;
      default:
        return <Dashboard />;
    }
  };

  return (
      <div style={{ padding: '40px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '20px' }}>관리자 페이지</h1>

        <TabContainer>
          <Tab active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')}>
            대시보드
          </Tab>
          <Tab active={activeTab === 'users'} onClick={() => setActiveTab('users')}>
            회원관리
          </Tab>
          <Tab active={activeTab === 'boards'} onClick={() => setActiveTab('boards')}>
            게시판관리
          </Tab>
          <Tab active={activeTab === 'reports'} onClick={() => setActiveTab('reports')}>
            신고내역
          </Tab>
        </TabContainer>

        <ContentContainer>{renderContent()}</ContentContainer>
      </div>
  );
}
