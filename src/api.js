import axios from 'axios';

// 1. API를 호출할 axios 인스턴스를 생성합니다.
const api = axios.create({
    // 환경 변수에서 API 서버의 기본 URL을 가져옵니다.
    baseURL: process.env.REACT_APP_API_URL
});

/**
 * 2. 요청 인터셉터(Request Interceptor) 설정
 * - 모든 API 요청이 서버로 전송되기 전에 이 코드가 먼저 실행됩니다.
 * - 로컬 스토리지에서 JWT 토큰을 가져와 요청 헤더(Authorization)에 자동으로 추가해줍니다.
 * - 덕분에 각 컴포넌트에서 API를 호출할 때마다 토큰을 넣는 코드를 반복해서 작성할 필요가 없습니다.
 */
api.interceptors.request.use(
    config => {
        const token = localStorage.getItem('jwt');
        if (token) {
            // 토큰이 있으면 Authorization 헤더에 'Bearer' 방식의 토큰을 설정합니다.
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    error => {
        // 요청 에러 처리
        return Promise.reject(error);
    }
);

export default api;
