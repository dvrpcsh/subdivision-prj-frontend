import React, { useState, useEffect } from 'react';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import './ChatRoom.css';

//팟 상세 페이지로부터 potId를 props로 받습니다.
const ChatRoom = ({ potId }) => {
    const { currentUser } = useContext(AuthContext);

    //채팅 메시지 목록을 저장할 state(지금은 임시 데이터)
    const [messages, setMessages] = useState([
        { id: 1, text: '안녕하세요! 팟에 참여해주셔서 감사합니다.', sender: '알림' },
        { id: 2, text: '혹시 언제쯤 만나는 게 좋을까요?.', sender: '테스트유저1' },
        { id: 3, text: '저는 저녁 7시 이후면 다 괜찮아요!', sender: '20대가바라본세상' },
    ]);

    //내가 입력하고 있는 메시지를 저장할 state
    const [newMessage, setNewMessage] = useState('');

    //메시지 전송 핸들러(지금은 임시 목록에 추가만 합니다)
    const handleSendMessage = (e) => {
        e.preventDefault();
        if(!newMessage.trim()) return;

        const messageToSend = {
            id: messages.length + 1,
            text: newMessage,
            sender: currentUser?.nickname || '나', //현재 로그인 한 사용자 닉네임
        };

        setMessages([...messages, messageToSend]);
        setNewMessage(''); //입력창 비우기
    };

    //채팅창이 항상 맨 아래를 보도록 스크롤을 자동으로 내려주는 기능
    useEffect(() => {
        const chatBody = document.querySelector('.chat-body');
        if(chatBody) {
            chatBody.scrollTop = chatBody.scrollHeight;
        }
    }, [messages]);

    return (
        <div className="chat-room-container">
            <div className="chat-header">
                <h3>팟 채팅방</h3>
            </div>
            <div className="chat-body">
                <ul className="message-list">
                    {messages.map((msg) => (
                        <li
                            key={msg.id}
                            //내가 보낸 메시지인지 아닌지에 따라 다른 스타일 적용
                            className={`message-item ${msg.sender === currentUser?.nickname ? 'my-message' : 'other-message'}`}
                        >
                            <span className="sender">{msg.sender}</span>
                            <div className="message-bubble">
                                <p>{msg.text}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
            <form className="chat-form" onSubmit={handleSendMessage}>
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="메시지를 입력하세요..."
                    className="message-input"
                />
                <button type="submit" className="send-button">전송</button>
            </form>
        </div>
    );
};

export default ChatRoom;