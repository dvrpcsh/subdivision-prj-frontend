import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import './ChatRoom.css';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import axios from 'axios';

//팟 상세 페이지로부터 potId를 props로 받습니다.
const ChatRoom = ({ potId }) => {
    const { currentUser } = useContext(AuthContext);

    //채팅 기능 추가
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const clientRef = useRef(null);
    const hasEnteredRef = useRef(false); // 이미 ENTER 메시지를 보냈는지 추적

    // useEffect가 처음 한 번만 실행되었는지 확인하기 위한 '스위치'를 만듭니다.
    const effectRan = useRef(false);

    // 시간을 '오후 5:55'와 같은 형식으로 변환해주는 헬퍼 함수
    const formatTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    /**
     * 대화 기록을 불러오는 useEffect
     * 이 useEffect는 컴포넌트가 처음 마운트될 때 '단 한 번만' 실행되어
     * 이전 대화 기록을 안정적으로 불러오는 역할에만 집중합니다.
     */
    useEffect(() => {
        // 개발 환경이고, 스위치가 아직 켜지지 않았을 때만 아래 로직을 실행합니다.
        // process.env.NODE_ENV !== 'production'은 개발 환경일 때를 의미합니다.
        if (process.env.NODE_ENV !== 'production' && effectRan.current === true) {
            return;
        }

        const fetchChatHistory = async () => {
            try {
                const token = localStorage.getItem('jwt');
                const response = await axios.get(`http://localhost:8080/api/pots/${potId}/chat/history`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const history = response.data.map(msg => ({
                    type: msg.type || 'TALK',
                    sender: msg.sender,
                    message: msg.message,
                    sentAt: msg.sentAt
                }));
                setMessages(history);
            } catch (error) {
                console.error("대화 기록을 불러오는 데 실패했습니다.", error);
            }
        };

        const connectWebSocket = () => {
            if (!currentUser?.nickname) return;

            const socket = new SockJS('http://localhost:8080/ws-chat');
            const stompClient = new Client({
                webSocketFactory: () => socket,
                reconnectDelay: 5000,
            });

            stompClient.onConnect = () => {
                stompClient.subscribe(`/topic/pots/${potId}`, (message) => {
                    const receivedMessage = JSON.parse(message.body);

                    // ENTER 타입이고 message가 있는 경우 (최초 참여 환영 메시지)
                    if (receivedMessage.type === 'ENTER' && receivedMessage.message && receivedMessage.message.trim() !== '') {
                        setMessages((prevMessages) => [...prevMessages, {
                            ...receivedMessage,
                            sentAt: receivedMessage.sentAt || new Date().toISOString()
                        }]);
                    }
                    // TALK 메시지는 다른 사용자의 메시지만 화면에 추가
                    // 내가 보낸 메시지는 이미 낙관적 업데이트로 추가되었으므로 제외
                    else if (receivedMessage.type === 'TALK' && receivedMessage.sender !== currentUser?.nickname) {
                        setMessages((prevMessages) => [...prevMessages, {
                            ...receivedMessage,
                            sentAt: receivedMessage.sentAt || new Date().toISOString()
                        }]);
                    }
                });

                // 최초 연결 시에만 ENTER 메시지 전송
                if (!hasEnteredRef.current) {
                    stompClient.publish({
                        destination: '/app/chat/message',
                        body: JSON.stringify({
                            type: 'ENTER',
                            potId: potId,
                            sender: currentUser?.nickname,
                            message: ''
                        }),
                    });
                    hasEnteredRef.current = true;
                }
            };

            stompClient.activate();
            clientRef.current = stompClient;
        };

        fetchChatHistory();
        connectWebSocket();

        // useEffect의 모든 로직이 끝난 후, 스위치를 'ON'으로 바꿔
        // 다음에 다시 실행되지 않도록 합니다.
        return () => {
            if (clientRef.current && clientRef.current.connected) {
                clientRef.current.deactivate();
            }
            effectRan.current = true;
        };
    }, [potId, currentUser?.nickname]);

    //메시지 전송 핸들러
    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !clientRef.current || !clientRef.current.connected) return;

        // 1. 서버로 보낼 메시지 객체를 만듭니다.
        const messageToSend = {
            type: 'TALK',
            potId: potId,
            sender: currentUser?.nickname,
            message: newMessage,
        };

        // 2. 서버로 메시지를 전송합니다.
        clientRef.current.publish({
            destination: '/app/chat/message',
            body: JSON.stringify(messageToSend),
        });

        // 3. (낙관적 업데이트) 내 화면의 메시지 목록에 방금 보낸 메시지를 즉시 추가합니다.
        //    sentAt(보낸 시간)을 함께 추가하여 화면에 바로 표시될 수 있도록 합니다.
        setMessages((prevMessages) => [...prevMessages, {
            ...messageToSend,
            sentAt: new Date().toISOString()
        }]);

        // 4. 입력창을 비웁니다.
        setNewMessage('');
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
            <div className="chat-header"><h3>팟 채팅방</h3></div>
            <div className="chat-body">
                <ul className="message-list">
                    {messages.map((msg, index) => {
                        //메시지 타입에 따라 다른 JSX를 렌더링합니다.
                        if (msg.type === 'ENTER') {
                            //메시지 내용이 있을 때만 시스템 메시지를 표시합니다.
                            if (!msg.message || msg.message.trim() === '') return null;
                            return (
                                <li key={index} className="system-message">
                                    <span>{msg.message}</span>
                                </li>
                            );
                        }
                        return (
                            <li key={index} className={`message-item ${msg.sender === currentUser?.nickname ? 'my-message' : 'other-message'}`}>
                                <span className="sender">{msg.sender}</span>
                                <div className="message-content">
                                    <div className="message-bubble"><p>{msg.message}</p></div>
                                    {/* 메시지 옆에 시간을 표시합니다. */}
                                    <span className="timestamp">{formatTime(msg.sentAt)}</span>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </div>
            <form className="chat-form" onSubmit={handleSendMessage}>
                <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="메시지를 입력하세요..." className="message-input" />
                <button type="submit" className="send-button">전송</button>
            </form>
        </div>
    );
};

export default ChatRoom;