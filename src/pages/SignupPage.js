import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from './SignupPage.module.css';

const SignupPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [nickname, setNickname] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        //1.비밀번호 확인
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

    return (
        <div className={styles.pageContainer}>
            <h2>회원가입</h2>
            <form onSubmit={handleSubmit} className={styles.signupForm}>
                <input
                    type="email"
                    placeholder="이메일"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className={styles.formInput}
                />
                <input
                    type="password"
                    placeholder="비밀번호"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className={styles.formInput}
                />
                <input
                    type="password"
                    placeholder="비밀번호 확인"
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    required
                    className={styles.formInput}
                />
                <input
                    type="text"
                    placeholder="닉네임"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    required
                    className={styles.formInput}
                />
                {error && <p className={styles.errorMessage}>{error}</p>}
                <button type="submit" className={styles.submitButton}>가입하기</button>
            </form>
        </div>
    );
};

export default SignupPage;