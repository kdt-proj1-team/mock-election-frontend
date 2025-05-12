// src/components/ChatRoom.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useChatStore from '../../store/chatStore'


function ChatRoom() {
    const [nickname, setNickname] = useState('');
    const [room, setRoom] = useState('policy');
    const { setNickname: setStoreNickname, setActiveRoom } = useChatStore();
    const navigate = useNavigate();

    const handleJoinChat = (e) => {
        e.preventDefault();

        if (!nickname.trim()) {
            alert('닉네임을 입력해주세요.');
            return;
        }

        setStoreNickname(nickname);
        setActiveRoom(room);
        navigate('/chat');
    };

    return (
        <div className="join-container">
            <header className="join-header">
                <h1>채팅 참여</h1>
            </header>
            <main className="join-main">
                <form onSubmit={handleJoinChat}>
                    <div className="form-control">
                        <label htmlFor="nickname">닉네임</label>
                        <input
                            type="text"
                            name="nickname"
                            id="nickname"
                            placeholder="닉네임을 입력하세요"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-control">
                        <label htmlFor="room">채팅방</label>
                        <select
                            name="room"
                            id="room"
                            value={room}
                            onChange={(e) => setRoom(e.target.value)}
                        >
                            <option value="policy">정책 토론</option>
                            <option value="free">자유 주제</option>
                        </select>
                    </div>
                    <button type="submit" className="btn">참여하기</button>
                </form>
            </main>
        </div>
    );
}

export default ChatRoom;