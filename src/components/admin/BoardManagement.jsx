import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { categoryAPI } from '../../api/CategoryApi';
import { Link } from 'react-router-dom';


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
            if (props.color === '#ff5252') return '#f61212';
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

// 모달 스타일 컴포넌트
const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
`;

const ModalContent = styled.div`
    background-color: white;
    padding: 20px;
    border-radius: 8px;
    width: 400px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const ModalHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 1px solid #eee;
`;

const ModalTitle = styled.h3`
    margin: 0;
    font-size: 18px;
`;

const CloseButton = styled.button`
    background: none;
    border: none;
    font-size: 18px;
    cursor: pointer;
    color: #555;

    &:hover {
        color: #000;
    }
`;

const FormGroup = styled.div`
    margin-bottom: 15px;
`;

const FormLabel = styled.label`
    display: block;
    margin-bottom: 5px;
    font-weight: 500;
`;

const FormInput = styled.input`
    width: 100%;
    padding: 8px 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;

    &:focus {
        border-color: #1a73e8;
        outline: none;
    }
`;

const FormTextarea = styled.textarea`
    width: 100%;
    padding: 8px 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    min-height: 100px;

    &:focus {
        border-color: #1a73e8;
        outline: none;
    }
`;

const FormCheckbox = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 5px;
`;

const ModalButtonGroup = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 20px;
`;

const ModalButton = styled.button`
    padding: 8px 16px;
    background-color: ${props => props.primary ? '#1a73e8' : '#f5f5f5'};
    color: ${props => props.primary ? 'white' : '#333'};
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;

    &:hover {
        background-color: ${props => props.primary ? '#1557b0' : '#e0e0e0'};
    }
`;

const LoadingSpinner = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 200px;

    &:after {
        content: " ";
        display: block;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: 6px solid #1a73e8;
        border-color: #1a73e8 transparent #1a73e8 transparent;
        animation: spinner 1.2s linear infinite;
    }

    @keyframes spinner {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

const BoardManagement = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newCategory, setNewCategory] = useState({
        code: '',
        name: '',
        description: '',
        is_anonymous: false,
        sort_order: 0,
        is_active: true
    });

    // 카테고리 데이터 불러오기 함수
    const fetchCategories = async () => {
        try {
            setLoading(true);
            const data = await categoryAPI.getCategories();
            // DTO 필드명에 맞게 데이터 매핑
            const mappedData = data.map(category => ({
                id: category.id,
                code: category.code,
                name: category.name,
                description: category.description,
                // camelCase로 오는 isAnonymous를 is_anonymous로 변환
                is_anonymous: category.isAnonymous,
                // camelCase로 오는 sortOrder 사용
                sort_order: category.sortOrder,
                is_active: category.isActive
            }));

            const withCounts = await Promise.all(
                mappedData.map(async category => {
                    const count = await categoryAPI.getPostCountByCategory(category.code);
                    return { ...category, post_count: count };
                }));
            console.log('Fetched categories:', withCounts); // 데이터 확인용 로그
            setCategories(withCounts);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch categories:', err);
            setError('카테고리 정보를 불러오는데 실패했습니다.');
            setLoading(false);
        }
    };

    // 컴포넌트 마운트 시 데이터 로드
    useEffect(() => {
        fetchCategories();
    }, []);

    // 카테고리 상태 변경 핸들러
    const handleStatusChange = async (categoryId, isActive) => {
        const message = isActive
            ? '해당 카테고리를 비활성화하시겠습니까?'
            : '해당 카테고리를 활성화하시겠습니까?';
        if (!window.confirm(message)) {
            return; // 사용자가 취소하면 함수 종료
        }
        try {
            await categoryAPI.updateCategoryStatus(categoryId, !isActive);

            // 상태 업데이트 후 목록 갱신
            setCategories(categories.map(category =>
                category.id === categoryId
                    ? { ...category, is_active: !isActive }
                    : category
            ));
        } catch (err) {
            console.error('Failed to update category status:', err);
            alert('카테고리 상태 변경에 실패했습니다.');
        }
    };

    // 새 카테고리 추가 모달 토글
    const toggleAddModal = () => {
        setShowAddModal(!showAddModal);
    };

    // 새 카테고리 입력값 변경 핸들러
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setNewCategory({
            ...newCategory,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    // 새 카테고리 추가 핸들러
    const handleAddCategory = async () => {
        try {
            // 유효성 검사
            if (!newCategory.code || !newCategory.name || !newCategory.description) {
                alert('모든 필수 항목을 입력해주세요.');
                return;
            }

            await categoryAPI.addCategory({
                code: newCategory.code,
                name: newCategory.name,
                description: newCategory.description,
                isAnonymous: newCategory.is_anonymous, // camelCase로 변환
                sortOrder: parseInt(newCategory.sort_order), // camelCase로 변환
                isActive: newCategory.is_active // camelCase로 변환
            });

            // 모달 닫기 및 폼 초기화
            setShowAddModal(false);
            setNewCategory({
                code: '',
                name: '',
                description: '',
                is_anonymous: false,
                sort_order: 0,
                is_active: true
            });

            // 카테고리 추가 후 전체 목록 다시 불러오기
            await fetchCategories();
        } catch (err) {
            console.error('Failed to add category:', err);
            alert('카테고리 추가에 실패했습니다.');
        }
    };

    const handleDeleteCategory = async (id) => {
        const confirmDelete = window.confirm('정말 삭제하시겠습니까?');
        if (!confirmDelete) return;

        try {
            await categoryAPI.deleteCategory(id);

            // 삭제 후 전체 목록 다시 불러오기
            await fetchCategories();
        } catch (err) {
            console.error('삭제 실패:', err);
            alert('게시판 삭제에 실패했습니다.');
        }
    };


    // 로딩 중 표시
    if (loading) {
        return <LoadingSpinner />;
    }

    // 에러 발생 시 표시
    if (error) {
        return <Message>{error}</Message>;
    }

    return (
        <div>
            <CardTitle>게시판 관리</CardTitle>
            <AddButton onClick={toggleAddModal}>
                <span>+ 새 게시판 추가</span>
            </AddButton>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableHeader>순서</TableHeader>
                            <TableHeader>코드</TableHeader>
                            <TableHeader>게시판명</TableHeader>
                            <TableHeader>설명</TableHeader>
                            <TableHeader>익명 여부</TableHeader>
                            <TableHeader>게시글수</TableHeader>
                            <TableHeader>상태</TableHeader>
                            <TableHeader>관리</TableHeader>
                        </TableRow>
                    </TableHead>
                    <tbody>
                    {categories.map((category) => (
                        <TableRow key={category.id}>
                            <TableCell>{category.sort_order}</TableCell>
                            <TableCell>{category.code}</TableCell>
                            <TableCell>
                                <Link to={`/community?category=${category.code}`} style={{ textDecoration: 'none', color: '#1a73e8', fontWeight: '500' }}>
                                    {category.name}
                                </Link>
                            </TableCell>

                            <TableCell>{category.description}</TableCell>
                            <TableCell>{category.is_anonymous ? '익명' : '실명'}</TableCell>
                            <TableCell>{category.post_count}</TableCell>
                            <TableCell>
                                <span style={{
                                    color: category.is_active ? '#4CAF50' : '#f44336',
                                    fontWeight: '500'
                                }}>
                                    {category.is_active ? '활성' : '비활성'}
                                </span>
                            </TableCell>
                            <TableCell>
                                <ActionButton
                                    color={category.is_active ? '#f44336' : '#4CAF50'}
                                    marginRight
                                    onClick={() => handleStatusChange(category.id, category.is_active)}
                                >
                                    {category.is_active ? '비활성화' : '활성화'}
                                </ActionButton>
                                <ActionButton
                                    color={"#ff5252"}
                                    onClick={() => handleDeleteCategory(category.id)}
                                >
                                    삭제
                                </ActionButton>
                            </TableCell>
                        </TableRow>
                    ))}
                    </tbody>
                </Table>
                {categories.length === 0 && (
                    <Message>등록된 게시판이 없습니다.</Message>
                )}
            </TableContainer>

            {/* 새 카테고리 추가 모달 */}
            {showAddModal && (
                <ModalOverlay>
                    <ModalContent>
                        <ModalHeader>
                            <ModalTitle>새 게시판 추가</ModalTitle>
                            <CloseButton onClick={toggleAddModal}>&times;</CloseButton>
                        </ModalHeader>
                        <FormGroup>
                            <FormLabel>코드</FormLabel>
                            <FormInput
                                type="text"
                                name="code"
                                value={newCategory.code}
                                onChange={handleInputChange}
                                placeholder="영문, 숫자로 구성된 고유 코드"
                            />
                        </FormGroup>
                        <FormGroup>
                            <FormLabel>게시판명</FormLabel>
                            <FormInput
                                type="text"
                                name="name"
                                value={newCategory.name}
                                onChange={handleInputChange}
                                placeholder="게시판 이름"
                            />
                        </FormGroup>
                        <FormGroup>
                            <FormLabel>설명</FormLabel>
                            <FormTextarea
                                name="description"
                                value={newCategory.description}
                                onChange={handleInputChange}
                                placeholder="게시판에 대한 간략한 설명"
                            />
                        </FormGroup>
                        <FormGroup>
                            <FormLabel>순서</FormLabel>
                            <FormInput
                                type="number"
                                name="sort_order"
                                value={newCategory.sort_order}
                                onChange={handleInputChange}
                                min="0"
                            />
                        </FormGroup>
                        <FormGroup>
                            <FormCheckbox>
                                <input
                                    type="checkbox"
                                    id="is_anonymous"
                                    name="is_anonymous"
                                    checked={newCategory.is_anonymous}
                                    onChange={handleInputChange}
                                />
                                <FormLabel htmlFor="is_anonymous" style={{ margin: 0 }}>익명 게시판</FormLabel>
                            </FormCheckbox>
                        </FormGroup>
                        <FormGroup>
                            <FormCheckbox>
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    name="is_active"
                                    checked={newCategory.is_active}
                                    onChange={handleInputChange}
                                />
                                <FormLabel htmlFor="is_active" style={{ margin: 0 }}>활성화</FormLabel>
                            </FormCheckbox>
                        </FormGroup>
                        <ModalButtonGroup>
                            <ModalButton onClick={toggleAddModal}>취소</ModalButton>
                            <ModalButton primary onClick={handleAddCategory}>추가</ModalButton>
                        </ModalButtonGroup>
                    </ModalContent>
                </ModalOverlay>
            )}
        </div>
    );
};

export default BoardManagement;