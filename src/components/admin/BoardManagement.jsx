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

const AddButton = styled.button`
  padding: 10px 20px;
  margin-bottom: 20px;
  background-color: #1a73e8;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  
  &:hover {
    background-color: #1557b0;
  }
`;

const BoardManagement = () => {
    // 샘플 게시판 데이터
    const boards = [
        { id: 1, name: '공지사항', postCount: 25, lastUpdated: '2023-10-15T12:00:00', active: true },
        { id: 2, name: '자유게시판', postCount: 156, lastUpdated: '2023-10-18T14:30:00', active: true },
        { id: 3, name: '질문과답변', postCount: 87, lastUpdated: '2023-10-17T09:45:00', active: true },
        { id: 4, name: '이벤트', postCount: 12, lastUpdated: '2023-10-10T11:20:00', active: false },
        { id: 5, name: '갤러리', postCount: 34, lastUpdated: '2023-10-16T16:10:00', active: true }
    ];

    const handleSettings = (boardId) => {
        console.log(`Open settings for board: ${boardId}`);
        // 실제 구현 시 게시판 설정 모달 또는 페이지로 이동
    };

    const handleViewPosts = (boardId) => {
        console.log(`View posts for board: ${boardId}`);
        // 실제 구현 시 해당 게시판의 게시글 목록 페이지로 이동
    };

    const handleAddBoard = () => {
        console.log('Add new board');
        // 실제 구현 시 새 게시판 추가 모달 또는 페이지로 이동
    };

    return (
        <div>
            <CardTitle>게시판 관리</CardTitle>
            <AddButton onClick={handleAddBoard}>
                <span>+ 새 게시판 추가</span>
            </AddButton>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableHeader>ID</TableHeader>
                            <TableHeader>게시판명</TableHeader>
                            <TableHeader>게시글 수</TableHeader>
                            <TableHeader>마지막 업데이트</TableHeader>
                            <TableHeader>상태</TableHeader>
                            <TableHeader>관리</TableHeader>
                        </TableRow>
                    </TableHead>
                    <tbody>
                    {boards.map((board) => (
                        <TableRow key={board.id}>
                            <TableCell>{board.id}</TableCell>
                            <TableCell>{board.name}</TableCell>
                            <TableCell>{board.postCount}</TableCell>
                            <TableCell>
                                {new Date(board.lastUpdated).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                  <span style={{
                      color: board.active ? '#4CAF50' : '#f44336',
                      fontWeight: '500'
                  }}>
                    {board.active ? '활성' : '비활성'}
                  </span>
                            </TableCell>
                            <TableCell>
                                <ActionButton
                                    color="#4CAF50"
                                    marginRight
                                    onClick={() => handleSettings(board.id)}
                                >
                                    설정
                                </ActionButton>
                                <ActionButton
                                    color="#2196F3"
                                    onClick={() => handleViewPosts(board.id)}
                                >
                                    게시글 보기
                                </ActionButton>
                            </TableCell>
                        </TableRow>
                    ))}
                    </tbody>
                </Table>
                <Message>
                    샘플 데이터입니다. 실제 구현 시 API를 통해 게시판 정보를 가져와야 합니다.
                </Message>
            </TableContainer>
        </div>
    );
};

export default BoardManagement;