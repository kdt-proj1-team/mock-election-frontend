import React, { useState } from 'react';
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

const FilterContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
`;

const FilterButton = styled.button`
  padding: 8px 16px;
  background-color: ${props => props.active ? '#1a73e8' : '#f5f5f5'};
  color: ${props => props.active ? 'white' : '#333'};
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: ${props => props.active ? '600' : '400'};
  
  &:hover {
    background-color: ${props => props.active ? '#1557b0' : '#e0e0e0'};
  }
`;

const ReportManagement = () => {
    // 필터 상태
    const [filter, setFilter] = useState('all');

    // 샘플 신고 데이터
    const allReports = [
        { id: 'R001', type: '게시글', contentId: 'P123', reporter: 'user789', reason: '스팸', status: '대기중', reportedAt: '2023-10-17T14:30:00' },
        { id: 'R002', type: '댓글', contentId: 'C456', reporter: 'user222', reason: '욕설', status: '처리됨', reportedAt: '2023-10-16T09:15:00' },
        { id: 'R003', type: '사용자', contentId: 'U789', reporter: 'user555', reason: '사칭', status: '대기중', reportedAt: '2023-10-18T11:45:00' },
        { id: 'R004', type: '게시글', contentId: 'P234', reporter: 'user333', reason: '부적절한 콘텐츠', status: '대기중', reportedAt: '2023-10-17T16:20:00' },
        { id: 'R005', type: '댓글', contentId: 'C789', reporter: 'user111', reason: '개인정보 노출', status: '처리됨', reportedAt: '2023-10-15T08:40:00' },
        { id: 'R006', type: '게시글', contentId: 'P345', reporter: 'user444', reason: '저작권 침해', status: '대기중', reportedAt: '2023-10-18T09:10:00' }
    ];

    // 필터링된 신고 목록
    const filteredReports = filter === 'all'
        ? allReports
        : allReports.filter(report =>
            filter === 'pending' ? report.status === '대기중' : report.status === '처리됨'
        );

    const handleReview = (reportId) => {
        console.log(`Review report: ${reportId}`);
        // 실제 구현 시 신고 상세 내용 모달 또는 페이지로 이동
    };

    const handleResolve = (reportId) => {
        console.log(`Resolve report: ${reportId}`);
        // 실제 구현 시 신고 처리 API 호출
    };

    return (
        <div>
            <CardTitle>신고 내역</CardTitle>

            <FilterContainer>
                <FilterButton
                    active={filter === 'all'}
                    onClick={() => setFilter('all')}
                >
                    전체
                </FilterButton>
                <FilterButton
                    active={filter === 'pending'}
                    onClick={() => setFilter('pending')}
                >
                    대기중
                </FilterButton>
                <FilterButton
                    active={filter === 'resolved'}
                    onClick={() => setFilter('resolved')}
                >
                    처리됨
                </FilterButton>
            </FilterContainer>

            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableHeader>신고 ID</TableHeader>
                            <TableHeader>유형</TableHeader>
                            <TableHeader>콘텐츠 ID</TableHeader>
                            <TableHeader>신고자</TableHeader>
                            <TableHeader>사유</TableHeader>
                            <TableHeader>상태</TableHeader>
                            <TableHeader>신고일</TableHeader>
                            <TableHeader>관리</TableHeader>
                        </TableRow>
                    </TableHead>
                    <tbody>
                    {filteredReports.map((report) => (
                        <TableRow key={report.id}>
                            <TableCell>{report.id}</TableCell>
                            <TableCell>{report.type}</TableCell>
                            <TableCell>{report.contentId}</TableCell>
                            <TableCell>{report.reporter}</TableCell>
                            <TableCell>{report.reason}</TableCell>
                            <TableCell>
                  <span style={{
                      color: report.status === '대기중' ? '#ff9800' : '#4CAF50',
                      fontWeight: '500'
                  }}>
                    {report.status}
                  </span>
                            </TableCell>
                            <TableCell>
                                {new Date(report.reportedAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                                <ActionButton
                                    color="#2196F3"
                                    marginRight
                                    onClick={() => handleReview(report.id)}
                                >
                                    검토
                                </ActionButton>
                                {report.status === '대기중' && (
                                    <ActionButton
                                        color="#4CAF50"
                                        onClick={() => handleResolve(report.id)}
                                    >
                                        해결
                                    </ActionButton>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                    </tbody>
                </Table>
                {filteredReports.length === 0 && (
                    <Message>해당 조건의 신고 내역이 없습니다.</Message>
                )}
                <Message>
                    샘플 데이터입니다. 실제 구현 시 API를 통해 신고 내역을 가져와야 합니다.
                </Message>
            </TableContainer>
        </div>
    );
};

export default ReportManagement;