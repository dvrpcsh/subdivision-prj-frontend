import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from './SignupPage.module.css';

const SignupPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [nickname, setNickname] = useState('');
    const [error, setError] = useState('');

    //이메일 인증 절차를 위한 state 추가
    const [verificationCode, setVerificationCode] = useState('');
    const [isCodeSent, setIsCodeSent] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [verificationMessage, setVerificationMessage] = useState('');
    const [isSending, setIsSending] = useState(false);

    //비밀번호 유효성 검사 메시지와 상태를 위한 state 추가
    const [passwordMessage, setPasswordMessage] = useState('');
    const [isPasswordValid, setIsPasswordValid] = useState(false);

    const navigate = useNavigate();

    //password state가 변경될 때 마다 실행되는 useEffect
    useEffect(() => {
        if(password) {
            const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
            if(password.length < 6 || password.length > 30) {
                setPasswordMessage('비밀번호는 6자 이상 30자 이하로 입력해주세요.');
                setIsPasswordValid(false);
            } else if(!specialCharRegex.test(password)) {
                setPasswordMessage('비밀번호에 특수문자를 하나 이상 포함해야 합니다.');
                setIsPasswordValid(false);
            } else {
                setPasswordMessage('사용 가능한 비밀번호입니다.');
                setIsPasswordValid(true);
            }
        } else {
            setPasswordMessage('');
        }
    }, [password]); //password 값이 바뀔 때 마다 이 함수가 재실행됩니다.

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        //1.비밀번호 확인
        if (!isPasswordValid) {
            setError('비밀번호가 유효하지 않습니다.');
            return;
        }
        if(password !== passwordConfirm) {
            setError('비밀번호가 일치하지 않습니다.');

            return;
        }

        try{
            //2.닉네임 중복 확인 API 호출
            const nicknameRes = await axios.get(`http://localhost:8080/api/auth/check-nickname?nickname=${nickname}`);
            if(nicknameRes.data.isDuplicate) {
                setError('이미 사용 중인 닉네임입니다.');
                alert('이미 사용 중인 닉네임입니다.');

                return;
            }

            //3.이메일 중복 확인 API 호출
            const emailRes = await axios.get(`http://localhost:8080/api/auth/check-email?email=${email}`);
            if(emailRes.data.isDuplicate) {
                setError('이미 가입된 이메일입니다.');
                alert('이미 가입된 이메일입니다.');

                return;
            }


            //4.백엔드에 회원가입 API 호출
            await axios.post('http://localhost:8080/api/auth/signup', {
                email,
                password,
                nickname
            });

            //5.성공 시 로그인 페이지로 이동
            alert('회원가입에 성공했습니다! 로그인 페이지로 이동합니다.');
            navigate('/login');
        } catch(err) {
            //4.실패 시 에러 처리
            if(err.response && err.response.data && typeof err.response.data === 'string') {
                //백엔드 응답이 문자열이라면 그 값을 사용(백엔드가 예외 메시지를 직접 반환하는 경우)
                const errorMessage = err.response.data;
                setError(errorMessage);
                alert(errorMessage);
            } else if(err.response && err.response.data && err.response.data.message) {
                const errorMessage = err.response.data.message;
                setError(errorMessage);
                alert(errorMessage);
            } else {
                setError('회원가입 처리 중 오류가 발생했습니다.');
                alert('회원가입 처리 중 오류가 발생했습니다.')
            }
            console.error('Signup failed:', err);
        }
    };

    //인증번호 전송 버튼 클릭 시 실행될 함수
    const handleSendCode = async () => {
        if(!email) {
            setError('이메일을 먼저 입력해주세요.');

            return;
        }
        setIsSending(true);
        setError('');

        try {
            await axios.post('http://localhost:8080/api/auth/send-verification-code', {email});
            setIsCodeSent(true); //로딩 시작
            setVerificationMessage('인증번호가 발송되었습니다. 메일을 확인해주세요.');
        } catch(err) {
            setError('인증번호 발송에 실패했습니다. 이메일을 확인해주세요.');
        } finally {
            setIsSending(false); //로딩 종료
        }
    };

    //인증번호 확인 버튼 클릭 시 실행될 함수
    const handleVerifyCode = async () => {
        try {
            await axios.post('http://localhost:8080/api/auth/verify-code', { email, code:verificationCode });
            setIsVerified(true);
            setVerificationMessage('인증이 완료되었습니다.');
            setError('');
        } catch(err) {
            setError('인증번호가 올바르지 않습니다.');
        }
    };

    return (
        <div className={styles.pageContainer}>
            <h2>회원가입</h2>
            <form onSubmit={handleSubmit} className={styles.signupForm}>
                {/* 이메일 인증 UI Group */}
                <div className={styles.formGroup}>
                    <label>이메일</label>
                    <div className={styles.inputWithButton}>
                        <input
                            type="email"
                            placeholder="이메일"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className={styles.formInput}
                            disabled={isVerified || isCodeSent} // 인증 시작 후 수정 불가
                        />
                        <button type="button" onClick={handleSendCode} disabled={isSending || isCodeSent} className={styles.actionButton}>
                            {isSending ? '전송 중...' : '인증번호 전송'}
                        </button>
                    </div>
                </div>

                {/* 인증번호 전송 후 입력창 및 메시지 표시 */}
                {isCodeSent && !isVerified && (
                    <div className={styles.formGroup}>
                        <label>인증번호</label>
                        <div className={styles.inputWithButton}>
                            <input
                                type="text"
                                placeholder="인증번호 6자리 입력"
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value)}
                                className={styles.formInput}
                            />
                            <button type="button" onClick={handleVerifyCode} className={styles.actionButton}>
                                인증번호 확인
                            </button>
                        </div>
                    </div>
                )}
                {verificationMessage && (
                    <p className={isVerified ? styles.verifiedMessage : styles.verificationRequestedMessage}>
                        {verificationMessage}
                    </p>
                )}
                <div className={styles.formGroup}>
                    <label>비밀번호</label>
                        <input
                            type="password"
                            placeholder="비밀번호"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className={styles.formInput}
                        />
                        {/*유효성 검사 메시지를 동적으로 표시*/}
                        {passwordMessage && (
                            <p className={isPasswordValid ? styles.validMessage : styles.invalidMessage}>
                                {passwordMessage}
                            </p>
                        )}
                </div>
                <div className={styles.formGroup}>
                    <label>비밀번호 확인</label>
                    <input
                        type="password"
                        placeholder="비밀번호 확인"
                        value={passwordConfirm}
                        onChange={(e) => setPasswordConfirm(e.target.value)}
                        required
                        className={styles.formInput}
                    />
                </div>
                <div className={styles.formGroup}>
                    <label>닉네임</label>
                    <input
                        type="text"
                        placeholder="닉네임"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        required
                        className={styles.formInput}
                    />
                </div>

                {error && <p className={styles.errorMessage}>{error}</p>}
                <button type="submit" disabled={!isVerified} className={styles.submitButton}>가입하기</button>
            </form>
        </div>
    );
};

export default SignupPage;