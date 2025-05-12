// src/store/chatStore.js
import { create } from 'zustand';

const useChatStore = create((set) => ({
    messages: [],
    activeRoom: 1,
    nickname: '',
    connected: false,

    setMessages: (messages) => set({ messages }),
    addMessage: (message) => set((state) => ({
        messages: [...state.messages, message]
    })),
    setActiveRoom: (room) => set({ activeRoom: room }),
    setNickname: (nickname) => set({ nickname }),
    setConnected: (connected) => set({ connected })
}));

export default useChatStore;