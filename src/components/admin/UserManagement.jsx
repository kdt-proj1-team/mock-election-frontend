import React from 'react';
import styled from 'styled-components';

const CardTitle = styled.h3`
  margin-bottom: 20px;
  font-size: 20px;
  color: #333;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
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

const Message = styled.p`
  font-size: 16px;
  color: #555;
  margin: 20px 0;
`;

const ActionButton = styled.button`
  padding: 5px 10px;
  margin-right: ${props => props.marginRight ? '5px' : '0'};
  background-color: ${props => props.color || '#4CAF50'};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: ${props => {
    if (props.color === '#4CAF50') return '#3d8b40';
    if (props.color === '#f44336') return '#d32f2f';
    if (props.color === '#2196F3') return '#0b7dda';
    return '#3d8b40';
}};
  }
`;

const UserManagement = () => {
    // 샘플 사용자 데이터
    const users = [
        { userId: 'user123', role: 'USER', createdAt: '2023-09-15T12:00:00', active: true },
        { userId: 'admin456', role: 'ADMIN', createdAt: '2023-09-10T10:30:00', active: true },
        { userId: 'user789', role: 'USER', createdAt: '2023-09-20T15:45:00', active: false },
        { userId: 'mod333', role: 'MODERATOR', createdAt: '2023-10-05T09:15:00', active: true },
        { userId: 'user444', role: 'USER', createdAt: '2023-10-12T14:22:00', active: true }
    ];

    const handleEdit = (userId) => {
        console.log(`Edit user: ${userId}`);
        // 실제 구현 시 사용자 편집 모달 또는 페이지로 이동
    };

    const handleToggleActive = (userId, currentStatus) => {
        console.log(`Toggle active status for user: ${userId}. Current status: ${currentStatus}`);
        // 실제 구현 시 사용자 상태 변경 API 호출
    };

    return (
        <div>
            <CardTitle>회원 관리</CardTitle>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableHeader>사용자 ID</TableHeader>
                            <TableHeader>역할</TableHeader>
                            <TableHeader>가입일</TableHeader>
                            <TableHeader>활성 상태</TableHeader>
                            <TableHeader>관리</TableHeader>
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
                            <TableCell>
                                <ActionButton
                                    color="#4CAF50"
                                    marginRight
                                    onClick={() => handleEdit(user.userId)}
                                >
                                    수정
                                </ActionButton>
                                <ActionButton
                                    color="#f44336"
                                    onClick={() => handleToggleActive(user.userId, user.active)}
                                >
                                    {user.active ? '비활성화' : '활성화'}
                                </ActionButton>
                            </TableCell>
                        </TableRow>
                    ))}
                    </tbody>
                </Table>
                <Message>
                    샘플 데이터입니다. 실제 구현 시 API를 통해 사용자 목록을 가져와야 합니다.
                </Message>
            </TableContainer>
        </div>
    );
};

export default UserManagement;