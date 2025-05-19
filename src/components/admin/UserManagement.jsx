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
    width: 100%;
`;

const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 20px;
    table-layout: fixed; /* 테이블 레이아웃을 고정하여 열 너비를 균등하게 조정 */
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
    text-align: center; /* 헤더 텍스트 중앙 정렬 */
    border-bottom: 1px solid #ddd;
    white-space: nowrap;
`;

const TableCell = styled.td`
    padding: 12px 15px;
    border-bottom: 1px solid #ddd;
    text-align: center; /* 셀 내용 중앙 정렬 */
    overflow: hidden;
    text-overflow: ellipsis; /* 내용이 너무 길면 ... 처리 */
`;

const Message = styled.p`
    font-size: 16px;
    color: #555;
    margin: 20px 0;
    text-align: center; /* 메시지 중앙 정렬 */
`;

// 버튼 컨테이너 정렬 조정
const ButtonContainer = styled.div`
    display: flex;
    gap: 5px;
    justify-content: center; /* 버튼 중앙 정렬 */
`;

// 버튼 스타일 수정
const ActionButton = styled.button`
    padding: 5px 10px;
    min-width: 110px;
    text-align: center;
    background-color: ${props => props.color || '#4CAF50'};
    color: white;
    border: none;
    border-radius: 4px;
    cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
    transition: background-color 0.2s;
    opacity: ${props => props.disabled ? 0.7 : 1};
    white-space: nowrap;

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

    const handleToggleActive = async (userId, currentStatus, userName) => {
        // 확인 창 표시
        const targetStatus = !currentStatus;
        const actionText = targetStatus ? '활성화' : '비활성화';
        const confirmMessage = `${userName} 사용자를 ${actionText}하시겠습니까?`;

        if (!window.confirm(confirmMessage)) {
            return; // 사용자가 취소를 클릭했을 경우
        }

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

        } catch (err) {
            alert('활성 상태를 변경하는 데 실패했습니다.');
        } finally {
            // 처리 완료 상태로 설정
            setProcessingUsers(prev => ({ ...prev, [userId]: false }));
        }
    };

    const handleChangeRole = async (userId, currentRole, userName) => {
        // 서버가 토글 로직을 처리하는 방식에 따라 조정 필요
        const targetRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';

        // 확인 창 표시
        const confirmMessage = `${userName}의 권한을 ${currentRole === 'ADMIN' ? 'USER' : 'ADMIN'}로 변경하시겠습니까?`;

        if (!window.confirm(confirmMessage)) {
            return; // 사용자가 취소를 클릭했을 경우
        }

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
                            <TableHeader style={{ width: '20%' }}>사용자</TableHeader>
                            <TableHeader style={{ width: '15%' }}>역할</TableHeader>
                            <TableHeader style={{ width: '20%' }}>가입일</TableHeader>
                            <TableHeader style={{ width: '15%' }}>활성 상태</TableHeader>
                            <TableHeader style={{ width: '30%' }}>관리</TableHeader>
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
                                        onClick={() => handleChangeRole(user.userId, user.role, user.name)}
                                        disabled={processingUsers[user.userId]}
                                    >
                                        권한 변경
                                    </ActionButton>
                                    <ActionButton
                                        color={user.active ? "#f44336" : "#4CAF50"}
                                        onClick={() => handleToggleActive(user.userId, user.active, user.name)}
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