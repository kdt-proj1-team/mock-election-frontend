
import React, { useEffect, useState } from 'react';
import { authAPI } from '../api/AuthApi';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import useAuthStore from '../store/authStore';

// 스타일 컴포넌트 정의
const PageContainer = styled.div`
    background: linear-gradient(to bottom, #f0f5ff, #ffffff);
    min-height: 100vh;
    color: #222222;
    line-height: 1.6;
    padding: 2rem;
`;

const PageTitle = styled.h1`
    font-size: 2.2rem;
    font-weight: 700;
    color: #333;
    margin-bottom: 2rem;
    text-align: center;
    font-family: Georgia;
`;

const ProfileContainer = styled.div`
    max-width: 700px;
    margin: 0 auto;
    background-color: white;
    border-radius: 1rem;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    overflow: hidden;
`;

const ProfileHeader = styled.div`
    background: linear-gradient(to right, #afbacb, #6c7077);
    padding: 1.5rem;
    color: white;
    position: relative;
`;

const ProfileContent = styled.div`
    display: flex;
    flex-direction: column;
    
    @media (min-width: 768px) {
        flex-direction: row;
        align-items: center;
    }
`;

const ProfileImageWrapper = styled.div`
    position: relative;
    margin-bottom: 1rem;
    margin-right: 0;
    align-self: center;
    
    @media (min-width: 768px) {
        margin-bottom: 0;
        margin-right: 2rem;
    }
`;

const ProfileImage = styled.div`
    width: 120px;
    height: 120px;
    border-radius: 50%;
    border: 4px solid white;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    
    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
`;

const ProfileImageOverlay = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.2s ease;
    cursor: pointer;
    
    &:hover {
        opacity: 1;
    }
`;

const OverlayText = styled.span`
    color: white;
    font-size: 0.85rem;
    font-weight: 500;
`;

const FileInput = styled.input`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
`;

const ProfileHeaderInfo = styled.div`
    text-align: center;
    
    @media (min-width: 768px) {
        text-align: left;
    }
`;

const ProfileName = styled.h2`
    font-size: 1.75rem;
    font-weight: 700;
    margin-bottom: 0.25rem;
`;

const ProfileEmail = styled.p`
    color: rgba(255, 255, 255, 0.8);
    font-size: 1rem;
`;

const ProfileSection = styled.div`
    padding: 2rem;
`;

const ProfileGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;
    
    @media (min-width: 768px) {
        grid-template-columns: 1fr 1fr;
    }
`;

const ProfileField = styled.div`
    margin-bottom: 1rem;
`;

const FieldLabel = styled.label`
    display: block;
    font-size: 0.85rem;
    font-weight: 500;
    color: #6b7280;
    margin-bottom: 0.5rem;
`;

const FieldValue = styled.div`
    font-weight: 500;
    color: #1f2937;
`;

const InputField = styled.input`
    width: 100%;
    padding: 0.625rem 0.75rem;
    border: 1px solid ${props => props.error ? '#ef4444' : '#d1d5db'};
    border-radius: 0.375rem;
    font-size: 1rem;
    outline: none;
    transition: all 0.2s ease;
    
    &:focus {
        border-color: ${props => props.error ? '#ef4444' : '#4285f4'};
        box-shadow: 0 0 0 3px ${props => props.error ? 'rgba(239, 68, 68, 0.2)' : 'rgba(66, 133, 244, 0.2)'};
    }
`;

const InputContainer = styled.div`
    position: relative;
`;

const ValidationError = styled.p`
    color: #ef4444;
    font-size: 0.85rem;
    margin-top: 0.5rem;
`;

const CharCounter = styled.p`
    font-size: 0.75rem;
    color: ${props => props.isLimit ? '#ef4444' : '#6b7280'};
    text-align: right;
    margin-top: 0.25rem;
`;

const ButtonsContainer = styled.div`
    padding: 0 2rem 2rem;
`;

const ButtonsGrid = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 1rem;
    border-top: 1px solid #e5e7eb;
    padding-top: 1.5rem;
    
    @media (min-width: 640px) {
        flex-direction: row;
    }
`;

const ActionButtons = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    width: 100%;
    
    @media (min-width: 640px) {
        flex-direction: row;
        width: auto;
    }
`;

const Button = styled.button`
    padding: 0.625rem 1.25rem;
    border-radius: 0.375rem;
    font-weight: 600;
    font-size: 0.9375rem;
    transition: all 0.2s ease;
    cursor: pointer;
    width: 100%;
    
    @media (min-width: 640px) {
        width: auto;
    }
    
    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    }
    
    &:active {
        transform: translateY(0);
    }
`;

const PrimaryButton = styled(Button)`
    background-color: ${props => props.disabled ? '#9ca3af' : '#545454'};
    color: white;
    border: none;
    opacity: ${props => props.disabled ? 0.7 : 1};
    pointer-events: ${props => props.disabled ? 'none' : 'auto'};
    
    &:hover {
        background-color: ${props => props.disabled ? '#9ca3af' : '#a3abbd'};
    }
`;

const SecondaryButton = styled(Button)`
    background-color: #f3f4f6;
    color: #4b5563;
    border: none;
    
    &:hover {
        background-color: #e5e7eb;
    }
`;

const DangerButton = styled(Button)`
    background-color: white;
    color: #ef4444;
    border: 1px solid #ef4444;
    
    &:hover {
        background-color: #fef2f2;
    }
`;

const LoadingContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 50vh;
`;

const Spinner = styled.div`
    border: 3px solid rgba(0, 0, 0, 0.1);
    border-top: 3px solid #4285f4;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

const LoadingText = styled.p`
    color: #6b7280;
    font-size: 1rem;
`;

const MyPage = () => {
    const [userInfo, setUserInfo] = useState(null);
    const [editing, setEditing] = useState(false);
    const [nickname, setNickname] = useState('');
    const [nicknameError, setNicknameError] = useState('');
    const [previewImage, setPreviewImage] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    const { updateUserProfile, deleteAccount, isAuthenticated } = useAuthStore();

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        const fetchUserInfo = async () => {
            try {
                setIsLoading(true);
                const res = await authAPI.getUserInfo();
                const data = res.data.data;
                setUserInfo(data);
                setNickname(data.nickname);
            } catch (err) {
                navigate('/login');
            } finally {
                setIsLoading(false);
            }
        };
        fetchUserInfo();
    }, [navigate, isAuthenticated]);

    const validateNickname = (value) => {
        const regex = /^[가-힣a-zA-Z]+$/;

        if (value.length === 0) {
            return '닉네임을 입력해주세요.';
        } else if (value.length > 10) {
            return '닉네임은 10자 이하로 입력해주세요.';
        } else if (!regex.test(value)) {
            return '닉네임은 한글과 영문만 사용 가능합니다.';
        }

        return '';
    };

    const handleNicknameChange = (e) => {
        const value = e.target.value;
        setNickname(value);
        setNicknameError(validateNickname(value));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleUpdate = async () => {
        const error = validateNickname(nickname);
        if (error) {
            setNicknameError(error);
            return;
        }

        try {
            setIsLoading(true);
            const form = new FormData();
            form.append('nickname', nickname);
            if (selectedFile) form.append('profileImage', selectedFile);

            const response = await authAPI.updateUserInfo(form);
            const updatedData = response.data.data;

            updateUserProfile({
                nickname: updatedData.nickname,
                profileImgUrl: updatedData.profileImgUrl
            });

            alert('프로필이 성공적으로 업데이트되었습니다.');
            setEditing(false);

            const res = await authAPI.getUserInfo();
            setUserInfo(res.data.data);
            setPreviewImage(null);
            setSelectedFile(null);
            setNicknameError('');
        } catch (err) {
            alert('정보 수정 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (window.confirm('계정을 삭제하면 모든 데이터가 영구적으로 삭제됩니다. 정말로 탈퇴하시겠습니까?')) {
            try {
                setIsLoading(true);
                const result = await deleteAccount();
                if (result.success) {
                    navigate('/signup');
                } else {
                    alert('회원 탈퇴 중 오류 발생: ' + (result.error || '알 수 없는 오류'));
                }
            } catch (err) {
                alert('회원 탈퇴 중 오류 발생');
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleCancel = () => {
        setEditing(false);
        setNickname(userInfo.nickname);
        setPreviewImage(null);
        setSelectedFile(null);
        setNicknameError('');
    };

    if (isLoading) {
        return (
            <LoadingContainer>
                <Spinner />
                <LoadingText>데이터를 불러오는 중...</LoadingText>
            </LoadingContainer>
        );
    }

    return (
        <PageContainer>
            <PageTitle>My Profile</PageTitle>

            <ProfileContainer>
                {/* 프로필 헤더 섹션 */}
                <ProfileHeader>
                    <ProfileContent>
                        <ProfileImageWrapper>
                            <ProfileImage>
                                <img
                                    src={editing ? (previewImage || userInfo.profileImgUrl) : userInfo.profileImgUrl}
                                    alt="프로필"
                                />
                                {editing && (
                                    <>
                                        <ProfileImageOverlay>
                                            <OverlayText>사진 변경</OverlayText>
                                            <FileInput type="file" accept="image/*" onChange={handleFileChange} />
                                        </ProfileImageOverlay>
                                    </>
                                )}
                            </ProfileImage>
                        </ProfileImageWrapper>

                        <ProfileHeaderInfo>
                            <ProfileName>{userInfo.name}</ProfileName>
                            <ProfileEmail>{userInfo.email}</ProfileEmail>
                        </ProfileHeaderInfo>
                    </ProfileContent>
                </ProfileHeader>

                {/* 프로필 정보 섹션 */}
                <ProfileSection>
                    <ProfileGrid>
                        <ProfileField>
                            <FieldLabel>사용자 ID</FieldLabel>
                            <FieldValue>{userInfo.userId}</FieldValue>
                        </ProfileField>

                        <ProfileField>
                            <FieldLabel>이메일</FieldLabel>
                            <FieldValue>{userInfo.email}</FieldValue>
                        </ProfileField>

                        <ProfileField>
                            <FieldLabel>이름</FieldLabel>
                            <FieldValue>{userInfo.name}</FieldValue>
                        </ProfileField>

                        <ProfileField>
                            <FieldLabel>닉네임</FieldLabel>
                            {editing ? (
                                <InputContainer>
                                    <InputField
                                        type="text"
                                        value={nickname}
                                        onChange={handleNicknameChange}
                                        maxLength={10}
                                        error={!!nicknameError}
                                        placeholder="닉네임을 입력하세요"
                                    />
                                    {nicknameError && <ValidationError>{nicknameError}</ValidationError>}
                                    <CharCounter isLimit={nickname.length >= 10}>
                                        {nickname.length}/10
                                    </CharCounter>
                                </InputContainer>
                            ) : (
                                <FieldValue>{userInfo.nickname}</FieldValue>
                            )}
                        </ProfileField>
                    </ProfileGrid>
                </ProfileSection>

                {/* 액션 버튼 섹션 */}
                <ButtonsContainer>
                    <ButtonsGrid>
                        <ActionButtons>
                            {editing ? (
                                <>
                                    <PrimaryButton
                                        onClick={handleUpdate}
                                        disabled={!!nicknameError}
                                    >
                                        저장하기
                                    </PrimaryButton>
                                    <SecondaryButton onClick={handleCancel}>
                                        취소
                                    </SecondaryButton>
                                </>
                            ) : (
                                <PrimaryButton onClick={() => setEditing(true)}>
                                    프로필 수정
                                </PrimaryButton>
                            )}
                        </ActionButtons>

                        <DangerButton onClick={handleDeleteAccount}>
                            회원 탈퇴
                        </DangerButton>
                    </ButtonsGrid>
                </ButtonsContainer>
            </ProfileContainer>
        </PageContainer>
    );
};

export default MyPage;