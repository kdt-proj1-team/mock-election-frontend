import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { adminAPI } from '../../api/AdminApi'; // 실제 API 모듈 위치에 따라 경로 조정

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

// 버튼 컨테이너 추가 - 버튼 그룹을 일정한 너비로 유지
const ButtonContainer = styled.div`
    display: flex;
    gap: 5px;
`;

// 버튼 스타일 수정 - 고정된 너비와 텍스트 정렬 추가
const ActionButton = styled.button`
    padding: 5px 10px;
    min-width: 110px; // 모든 버튼에 고정된 최소 너비 적용
    text-align: center;
    background-color: ${props => props.color || '#4CAF50'};
    color: white;
    border: none;
    border-radius: 4px;
    cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
    transition: background-color 0.2s;
    opacity: ${props => props.disabled ? 0.7 : 1};
    white-space: nowrap; // 텍스트가 한 줄에 유지되도록 설정

    &:hover {
        background-color: ${props => {
    if (props.disabled) return props.color || '#4CAF50';
    if (props.color === '#4CAF50') return '#3d8b40';
    if (props.color === '#f44336') return '#d32f2f';
    if (props.color === '#2196F3') return '#0b7dda';
    return '#3d8b40';
}};
    }
`;

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [processingUsers, setProcessingUsers] = useState({}); // 처리 중인 사용자 ID 추적

    useEffect(() => {
        fetchUsers();
    }, []);

    // 사용자 목록을 가져오는 함수 별도 분리
    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getAllUsers();
            setUsers(response);
            setError(null);
        } catch (err) {
            setError('사용자 데이터를 불러오는 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleActive = async (userId, currentStatus) => {
        // 서버가 토글 로직을 처리하는 방식에 따라 조정 필요
        const targetStatus = !currentStatus;

        try {
            // 처리 중인 상태로 설정
            setProcessingUsers(prev => ({ ...prev, [userId]: true }));

            await adminAPI.toggleUserActive(userId, targetStatus);

            // API 호출 성공 후 UI 업데이트
            setUsers(prevUsers =>
                prevUsers.map(user =>
                    user.userId === userId ? { ...user, active: targetStatus } : user
                )
            );

            console.log(`사용자 ${userId} 활성 상태가 ${targetStatus ? '활성' : '비활성'}으로 변경되었습니다.`);
        } catch (err) {
            alert('활성 상태를 변경하는 데 실패했습니다.');
        } finally {
            // 처리 완료 상태로 설정
            setProcessingUsers(prev => ({ ...prev, [userId]: false }));
        }
    };

    const handleChangeRole = async (userId, currentRole) => {
        // 서버가 토글 로직을 처리하는 방식에 따라 조정 필요
        const targetRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';

        try {
            // 처리 중인 상태로 설정
            setProcessingUsers(prev => ({ ...prev, [userId]: true }));

            await adminAPI.updateUserRole(userId, targetRole);

            // API 호출 성공 후 UI 업데이트
            setUsers(prevUsers =>
                prevUsers.map(user =>
                    user.userId === userId ? { ...user, role: targetRole } : user
                )
            );

        } catch (err) {
            alert('역할을 변경하는 데 실패했습니다.');
        } finally {
            // 처리 완료 상태로 설정
            setProcessingUsers(prev => ({ ...prev, [userId]: false }));
        }
    };

    if (loading) return <Message>불러오는 중입니다...</Message>;
    if (error) return <Message>{error}</Message>;

    return (
        <div>
            <CardTitle>회원 관리</CardTitle>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableHeader>사용자</TableHeader>
                            <TableHeader>역할</TableHeader>
                            <TableHeader>가입일</TableHeader>
                            <TableHeader>활성 상태</TableHeader>
                            <TableHeader>관리</TableHeader>
                        </TableRow>
                    </TableHead>
                    <tbody>
                    {users.map((user) => (
                        <TableRow key={user.userId}>
                            <TableCell>{user.name}</TableCell>
                            <TableCell>{user.role}</TableCell>
                            <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell>{user.active ? '활성' : '비활성'}</TableCell>
                            <TableCell>
                                <ButtonContainer>
                                    <ActionButton
                                        color="#2196F3"
                                        onClick={() => handleChangeRole(user.userId, user.role)}
                                        disabled={processingUsers[user.userId]}
                                    >
                                        권한 변경
                                    </ActionButton>
                                    <ActionButton
                                        color={user.active ? "#f44336" : "#4CAF50"}
                                        onClick={() => handleToggleActive(user.userId, user.active)}
                                        disabled={processingUsers[user.userId]}
                                    >
                                        {user.active ? '비활성화' : '활성화'}
                                    </ActionButton>
                                </ButtonContainer>
                            </TableCell>
                        </TableRow>
                    ))}
                    </tbody>
                </Table>
                {users.length === 0 && <Message>사용자가 없습니다.</Message>}
            </TableContainer>
        </div>
    );
};

export default UserManagement;