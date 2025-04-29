import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import useAuthStore from '../store/authStore';
import { Container, Title, Card } from '../components/common';

const AdminCard = styled(Card)`
  margin-top: 30px;
  padding: 20px;
`;

const AdminTitle = styled(Title)`
  margin-bottom: 30px;
`;

const TableContainer = styled.div`
  overflow-x: auto;
  margin-top: 20px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
`;

const TableHead = styled.thead`
  background-color: #f0f2f5;
`;

const TableRow = styled.tr`
  &:nth-child(even) {
    background-color: #f9fafb;
  }
  
  &:hover {
    background-color: #f0f2f5;
  }
`;

const TableHeader = styled.th`
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #ddd;
`;

const TableCell = styled.td`
  padding: 12px 15px;
  border-bottom: 1px solid #ddd;
`;

const Button = styled.button`
  padding: 10px 20px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
`;

const BackButton = styled(Button)`
  margin-top: 20px;
  background-color: #6c757d;
  color: white;
  
  &:hover {
    background-color: #5a6268;
  }
`;

const Message = styled.p`
  font-size: 16px;
  color: #555;
  margin: 20px 0;
`;

const AdminPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuthStore();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // 샘플 사용자 데이터 - 실제로는 API에서 가져와야 함
  const sampleUsers = [
    { userId: 'user123', role: 'USER', createdAt: '2023-09-15T12:00:00', active: true },
    { userId: 'admin456', role: 'ADMIN', createdAt: '2023-09-10T10:30:00', active: true },
    { userId: 'user789', role: 'USER', createdAt: '2023-09-20T15:45:00', active: false }
  ];

  useEffect(() => {
    // 로그인되지 않았거나 ADMIN 권한이 없는 경우 홈페이지로 리다이렉트
    if (!isAuthenticated || role !== 'ADMIN') {
      navigate('/');
      return;
    }

    // 실제 구현에서는 API 호출로 사용자 목록을 가져옴
    setLoading(true);
    setTimeout(() => {
      setUsers(sampleUsers);
      setLoading(false);
    }, 500); // 로딩 시뮬레이션

  }, [isAuthenticated, role, navigate, sampleUsers]);

  const handleBackClick = () => {
    navigate('/');
  };

  if (!isAuthenticated || role !== 'ADMIN') {
    return null; // 리다이렉트 중에는 아무 것도 표시하지 않음
  }

  return (
    <>
      <Container>
        <AdminCard>
          <AdminTitle>관리자 페이지</AdminTitle>

          {loading ? (
            <Message>로딩 중...</Message>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeader>사용자 ID</TableHeader>
                    <TableHeader>역할</TableHeader>
                    <TableHeader>가입일</TableHeader>
                    <TableHeader>활성 상태</TableHeader>
                  </TableRow>
                </TableHead>
                <tbody>
                  {users.map((user) => (
                    <TableRow key={user.userId}>
                      <TableCell>{user.userId}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {user.active ? '활성' : '비활성'}
                      </TableCell>
                    </TableRow>
                  ))}
                </tbody>
              </Table>
              <Message>
                샘플 데이터입니다. 실제 구현 시 API를 통해 사용자 목록을 가져와야 합니다.
              </Message>
            </TableContainer>
          )}

          <BackButton onClick={handleBackClick}>홈으로 돌아가기</BackButton>
        </AdminCard>
      </Container>
    </>
  );
};

export default AdminPage;