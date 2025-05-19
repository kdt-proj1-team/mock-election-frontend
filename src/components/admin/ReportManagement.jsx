import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { reportAPI } from '../../api/ReportApi';
import {Link} from "react-router-dom";

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

// Modal 스타일
const ModalBackdrop = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
`;

const ModalContent = styled.div`
    background: white;
    padding: 20px;
    border-radius: 8px;
    width: 400px;
    max-width: 90%;
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
    const [filter, setFilter] = useState('all');
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selected, setSelected] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => { fetchList(); }, []);

    const fetchList = async () => {
        try {
            setLoading(true);
            const data = await reportAPI.getReports();
            setReports(data);
        } catch {
            setError('신고 내역을 불러오는 중 오류 발생');
        } finally { setLoading(false); }
    };

    const openDetail = async (id) => {
        try {
            const detail = await reportAPI.getReportById(id);
            setSelected(detail);
            setModalOpen(true);
        } catch {
            alert('상세 정보를 불러오는 데 실패했습니다.');
        }
    };

    const handleConfirm = async (id) => {
        try {
            await reportAPI.confirmReport(id);
            fetchList();
            setModalOpen(false);
        } catch {
            alert('처리 요청 실패');
        }
    };

    const filtered = filter === 'all'
        ? reports
        : reports.filter(r => filter === 'pending' ? !r.isConfirmed : r.isConfirmed);

    if (loading) return <Message>로딩 중...</Message>;
    if (error) return <Message>{error}</Message>;

    return (
        <div>
            <CardTitle>신고 내역</CardTitle>

            {/* 필터 UI */}
            <FilterContainer>
                <FilterButton active={filter === 'all'} onClick={() => setFilter('all')}>전체</FilterButton>
                <FilterButton active={filter === 'pending'} onClick={() => setFilter('pending')}>대기중</FilterButton>
                <FilterButton active={filter === 'resolved'} onClick={() => setFilter('resolved')}>처리됨</FilterButton>
            </FilterContainer>

            {/* 테이블 UI */}
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableHeader>ID</TableHeader>
                            <TableHeader>신고 유형</TableHeader>
                            <TableHeader>신고자</TableHeader>
                            <TableHeader>신고 대상자</TableHeader>
                            <TableHeader>대상 유형</TableHeader>
                            <TableHeader>신고 글 번호</TableHeader>
                            <TableHeader>상태</TableHeader>
                            <TableHeader>신고일</TableHeader>
                            <TableHeader>관리</TableHeader>
                        </TableRow>
                    </TableHead>
                    <tbody>
                    {filtered.map((report) => (
                        <TableRow key={report.id} onClick={() => openDetail(report.id)}>
                            <TableCell>{report.id}</TableCell>
                            <TableCell><Link to={`/community/post/${report.targetId}`}>{report.reportTypeName}</Link></TableCell>
                            <TableCell>{report.reporterId}</TableCell>
                            <TableCell>{report.reportedUserId}</TableCell>
                            <TableCell>
                                {report.targetType === 'POST'
                                    ? '게시글'
                                    : report.targetType === 'POST_COMMENT'
                                        ? '댓글'
                                        : report.targetType
                                }
                            </TableCell>

                            <TableCell>{report.targetId}</TableCell>
                            <TableCell>
                                  <span style={{ color: report.isConfirmed ? '#4CAF50' : '#FF9800' }}>
                                    {report.isConfirmed ? '처리됨' : '대기중'}
                                  </span>
                            </TableCell>
                            <TableCell>{new Date(report.reportedAt).toLocaleString()}</TableCell>
                            <TableCell>
                                <ActionButton color="#2196F3" marginRight onClick={(e) => { e.stopPropagation(); openDetail(report.id); }}>검토</ActionButton>
                                {!report.isConfirmed && (
                                    <ActionButton color="#4CAF50" onClick={(e) => { e.stopPropagation(); handleConfirm(report.id); }}>처리</ActionButton>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                    </tbody>
                </Table>
                {filtered.length === 0 && <Message>해당 조건의 신고 내역이 없습니다.</Message>}
            </TableContainer>

            {/* 상세 모달 */}
            {modalOpen && selected && (
                <ModalBackdrop onClick={() => setModalOpen(false)}>
                    <ModalContent onClick={(e) => e.stopPropagation()}>
                        <h4>신고 상세</h4>
                        <p>ID: {selected.id}</p>
                        <p>유형: {selected.reportTypeName}</p>
                        <p>신고자: {selected.reporterId}</p>
                        <p>피신고자: {selected.reportedUserId}</p>
                        <p>신고 위치: {selected.targetType === 'POST' ? '게시글' : selected.targetType === 'POST_COMMENT' ? '댓글' : selected.targetType} ({selected.targetId})</p>
                        <p>사유: {selected.reason}</p>
                        <p>신고일: {selected.reportedAt}</p>
                        <ActionButton color="#4CAF50" marginRight onClick={() => handleConfirm(selected.id)}>처리 완료</ActionButton>
                        <ActionButton color="#f44336" onClick={() => setModalOpen(false)}>닫기</ActionButton>
                    </ModalContent>
                </ModalBackdrop>
            )}
        </div>
    );
};

export default ReportManagement;
