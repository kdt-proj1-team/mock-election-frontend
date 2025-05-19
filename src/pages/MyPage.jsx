import React, { useEffect, useState } from 'react';
import { authAPI } from '../api/AuthApi';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import useAuthStore from '../store/authStore'; // auth 스토어 가져오기

// 스타일 컴포넌트 정의
const PageContainer = styled.div`
    background-color: #f9f9f9;
    min-height: 100vh;
    color: #222222;
    line-height: 1.6;
    padding: 2rem;
`;

const PageTitle = styled.h2`
    font-size: 2.5rem;
    font-weight: 700;
    color: #333;
    margin-bottom: 2rem;
    text-align: center;
`;

const ProfileContainer = styled.div`
    max-width: 700px;
    margin: 0 auto;
    background-color: white;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    padding: 2rem;
`;

const ProfileSection = styled.div`
    margin-bottom: 2rem;
`;

const ProfileImageContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 2rem;

    img {
        width: 150px;
        height: 150px;
        border-radius: 50%;
        object-fit: cover;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        border: 4px solid white;
    }
`;

const FileInput = styled.input`
    margin-top: 1rem;
    width: 100%;
    max-width: 300px;
`;

const InfoRow = styled.div`
    display: flex;
    padding: 0.7rem 0;
    border-bottom: 1px solid #eee;

    &:last-child {
        border-bottom: none;
    }
`;

const Label = styled.label`
    font-weight: 600;
    width: 120px;
    color: #555;
`;

const Value = styled.span`
    flex: 1;
`;

const InputField = styled.input`
    flex: 1;
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;

    &:focus {
        outline: none;
        border-color: #4d90fe;
        box-shadow: 0 0 0 2px rgba(77, 144, 254, 0.2);
    }

    &.error {
        border-color: #ff4d4d;
        box-shadow: 0 0 0 2px rgba(255, 77, 77, 0.2);
    }
`;

const ValidationError = styled.div`
    color: #ff4d4d;
    font-size: 0.85rem;
    margin-top: 0.3rem;
    flex-basis: 100%;
    margin-left: 120px;
`;

const InputContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    flex: 1;
`;

const CharCounter = styled.div`
    font-size: 0.75rem;
    color: ${props => props.isLimit ? '#ff4d4d' : '#777'};
    text-align: right;
    margin-top: 0.2rem;
    flex-basis: 100%;
`;

const ButtonContainer = styled.div`
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-top: 2rem;
`;

const Button = styled.button`
  background-color: ${props => props.primary ? '#4d90fe' : props.danger ? '#ff4d4d' : '#f0f0f0'};
  color: ${props => props.primary || props.danger ? 'white' : '#333'};
  border: none;
  border-radius: 4px;
  padding: 0.7rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  opacity: ${props => props.disabled ? 0.6 : 1};
  pointer-events: ${props => props.disabled ? 'none' : 'auto'};
  
  &:hover {
    background-color: ${props => props.primary ? '#3d80ee' : props.danger ? '#e04343' : '#e0e0e0'};
    transform: translateY(-2px);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50vh;
  font-size: 1.2rem;
`;

const DangerZone = styled.div`
  margin-top: 3rem;
  padding-top: 1.5rem;
  border-top: 1px dashed #ddd;
`;

const MyPage = () => {
    const [userInfo, setUserInfo] = useState(null);
    const [editing, setEditing] = useState(false);
    const [nickname, setNickname] = useState('');
    const [nicknameError, setNicknameError] = useState('');
    const [previewImage, setPreviewImage] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const navigate = useNavigate();

    const { updateUserProfile, deleteAccount, isAuthenticated } = useAuthStore();

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        const fetchUserInfo = async () => {
            try {
                const res = await authAPI.getUserInfo();
                const data = res.data.data;
                setUserInfo(data);
                setNickname(data.nickname);
            } catch (err) {
                console.error('사용자 정보 조회 실패:', err);
                navigate('/login');
            }
        };
        fetchUserInfo();
    }, [navigate, isAuthenticated]);

    const validateNickname = (value) => {
        // 한글과 영문만 허용하는 정규식
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
        // 유효성 검사 실행
        const error = validateNickname(nickname);
        if (error) {
            setNicknameError(error);
            return;
        }

        try {
            const form = new FormData();
            form.append('nickname', nickname);
            if (selectedFile) form.append('profileImage', selectedFile);

            const response = await authAPI.updateUserInfo(form);

            // 서버로부터 받은 업데이트된 정보
            const updatedData = response.data.data;

            // 글로벌 상태 업데이트 (헤더에 바로 반영하기 위해)
            updateUserProfile({
                nickname: updatedData.nickname,
                profileImgUrl: updatedData.profileImgUrl
            });

            alert('닉네임과 프로필이 수정되었습니다.');
            setEditing(false);

            // 업데이트된 정보 재조회
            const res = await authAPI.getUserInfo();
            setUserInfo(res.data.data);
            setPreviewImage(null);
            setSelectedFile(null);
            setNicknameError('');
        } catch (err) {
            console.error('정보 수정 실패:', err);
            alert('정보 수정 중 오류가 발생했습니다.');
        }
    };

    const handleDeleteAccount = async () => {
        if (window.confirm('정말로 회원 탈퇴하시겠습니까?')) {
            try {
                // 스토어의 deleteAccount 함수 사용 (전역 상태 관리 및 로그아웃 처리 포함)
                const result = await deleteAccount();
                if (result.success) {
                    navigate('/signup');
                } else {
                    alert('회원 탈퇴 중 오류 발생: ' + (result.error || '알 수 없는 오류'));
                }
            } catch (err) {
                console.error('회원 탈퇴 실패:', err);
                alert('회원 탈퇴 중 오류 발생');
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

    if (!userInfo) return (
        <LoadingContainer>
            <p>로딩 중...</p>
        </LoadingContainer>
    );

    return (
        <PageContainer>
            <PageTitle>마이페이지</PageTitle>

            <ProfileContainer>
                <ProfileImageContainer>
                    {editing ? (
                        <>
                            {previewImage ? (
                                <img src={previewImage} alt="미리보기" />
                            ) : (
                                userInfo.profileImgUrl && (
                                    <img src={userInfo.profileImgUrl} alt="프로필" />
                                )
                            )}
                            <FileInput type="file" accept="image/*" onChange={handleFileChange} />
                        </>
                    ) : (
                        userInfo.profileImgUrl && (
                            <img src={userInfo.profileImgUrl} alt="프로필" />
                        )
                    )}
                </ProfileImageContainer>

                <ProfileSection>
                    <InfoRow>
                        <Label>ID:</Label>
                        <Value>{userInfo.userId}</Value>
                    </InfoRow>

                    <InfoRow>
                        <Label>이메일:</Label>
                        <Value>{userInfo.email}</Value>
                    </InfoRow>

                    <InfoRow>
                        <Label>이름:</Label>
                        <Value>{userInfo.name}</Value>
                    </InfoRow>

                    <InfoRow>
                        <Label>닉네임:</Label>
                        {editing ? (
                            <InputContainer>
                                <InputField
                                    type="text"
                                    value={nickname}
                                    onChange={handleNicknameChange}
                                    className={nicknameError ? 'error' : ''}
                                    maxLength={10}
                                />
                                {nicknameError && <ValidationError>{nicknameError}</ValidationError>}
                                <CharCounter isLimit={nickname.length >= 10}>
                                    {nickname.length}/10
                                </CharCounter>
                            </InputContainer>
                        ) : (
                            <Value>{userInfo.nickname}</Value>
                        )}
                    </InfoRow>
                </ProfileSection>

                <ButtonContainer>
                    {editing ? (
                        <>
                            <Button
                                primary
                                onClick={handleUpdate}
                                disabled={!!nicknameError}
                            >
                                저장
                            </Button>
                            <Button onClick={handleCancel}>취소</Button>
                        </>
                    ) : (
                        <Button primary onClick={() => setEditing(true)}>정보 수정</Button>
                    )}
                </ButtonContainer>

                <DangerZone>
                    <ButtonContainer>
                        <Button danger onClick={handleDeleteAccount}>회원 탈퇴</Button>
                    </ButtonContainer>
                </DangerZone>
            </ProfileContainer>
        </PageContainer>
    );
};

export default MyPage;