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

    //컴포넌트가 처음 렌더링될 때 웹소켓 연결 및 대화 기록을 불러옵니다.
    useEffect(() => {
        //대화 기록을 불러오는 함수
        const fetchChatHistory = async () => {
            try {
                const token = localStorage.getItem('jwt');
                const response = await axios.get('http://localhost:8080/api/pots/${potId}/chat/history', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                //서버에서 받아온 메시지 형식을 프런트엔드 형식에 맞게 변환합니다.
                //백엔드 응답 DTO에 type 필드가 없다면 기본값 'TALK' 타입으로 간주
                const history = response.data.map(msg => ({
                    type: 'TALK', // 이전 메시지는 모두 'TALK' 타입으로 간주
                    sender: msg.sender,
                    message: msg.message,
                    sentAt: msg.sentAt
                }));
                setMessages(history);
            } catch(error) {
                console.error("대화 기록을 불러오는 데 실패했습니다.", error);
            }
        };

        //1.대화 기록을 먼저 불러옵니다.
        fetchChatHistory();

        //2.웹소켓 클라이언트 객체를 저장하기 위한 ref를 생성합니다.
        if(!clientRef.current) {
            //SockJS를 사용하여 웹소켓 연결을 생성합니다.
            const socket = new SockJS('http://localhost:8080/ws-chat');
            //STOMP 클라이언트를 생성합니다.
            const stompClient = new Client({
                webSocketFactory: () => socket,
                debug: (str) => {
                    console.log(str);
                },
                reconnectDelay: 5000, //5초마다 재연결시도
            });

            //3.서버에 연결되었을 때 실행될 콜백 함수 설정
            stompClient.onConnect = () => {
                console.log("WebSocket에 연결되었습니다!");

                //4.특정 팟(채팅방)의 메시지를 구독합니다.
                //서버는 "/topic/pots/{potId}" 경로로 메시지를 보내줍니다.
                stompClient.subscribe(`/topic/pots/${potId}`, (message) => {
                    //새로운 메시지를 받으면, JSON형식으로 변환하여 message 상태에 추가합니다.
                    const receivedMessage = JSON.parse(message.body);
                    setMessages((prevMessages) => [...prevMessages, {
                        ...receivedMessage,
                        sentAt: new Date().toISOString() // 현재 시간을 ISO 형식으로 추가
                    }]);
                });


                //5.채팅방에 처음 입장했다는 메시지를 서버로 보냅니다.
                stompClient.publish({
                    destination: '/app/chat/message',
                    body: JSON.stringify({
                        type: 'ENTER',
                        potId: potId,
                        sender: currentUser?.nickname,
                    }),
                });
            };

            // STOMP 클라이언트를 활성화(연결 시작)합니다.
            stompClient.activate();
            // 생성된 클라이언트 객체를 ref에 저장합니다.
            clientRef.current = stompClient;
        }

        //컴포넌트가 언마운트 될 때 웹소켓 연결을 해제합니다.
        return () => {
            if(clientRef.current && clientRef.current.connected) {
                clientRef.current.deactivate();
                console.log('WebSocket 연결이 해제되었습니다.');
            }
        };
    }, [potId, currentUser?.nickname]); //potId나 닉네임이 바뀔 경우에만 재연결

    //메시지 전송 핸들러(지금은 임시 목록에 추가만 합니다)
    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !clientRef.current || !clientRef.current.connected) return;

        // 서버로 메시지를 전송합니다.
        clientRef.current.publish({
            destination: '/app/chat/message',
            body: JSON.stringify({
                type: 'TALK',
                potId: potId,
                sender: currentUser?.nickname,
                message: newMessage,
            }),
        });

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
                        // [핵심 1] 메시지 타입에 따라 다른 JSX를 렌더링합니다.
                        if (msg.type === 'ENTER') {
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
                                    {/* [핵심 2] 메시지 옆에 시간을 표시합니다. */}
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