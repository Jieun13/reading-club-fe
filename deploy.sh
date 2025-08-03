#!/bin/bash

# 프론트엔드 배포 스크립트
echo "=== Reading Club Frontend 배포 시작 ==="

# 의존성 설치
echo "의존성 설치 중..."
npm install

if [ $? -ne 0 ]; then
    echo "의존성 설치 실패!"
    exit 1
fi

# 프로덕션 빌드
echo "프로덕션 빌드 중..."
npm run build

if [ $? -ne 0 ]; then
    echo "빌드 실패!"
    exit 1
fi

echo "빌드 완료!"
echo "빌드 파일 위치: $(pwd)/build"
echo ""
echo "=== 배포 방법 ==="
echo "1. Nginx 설정:"
echo "   - build 폴더를 웹 서버 루트로 복사"
echo "   - nginx.conf에서 React Router 설정 추가"
echo ""
echo "2. 정적 호스팅 (예: AWS S3, Netlify):"
echo "   - build 폴더 내용을 호스팅 서비스에 업로드"
echo ""
echo "3. 로컬 테스트:"
echo "   - npx serve -s build -l 3000"
