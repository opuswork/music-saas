FROM node:20-alpine

# libc6-compat 설치 (Next.js를 alpine에서 실행할 때 필요할 수 있음)
RUN apk add --no-cache libc6-compat

WORKDIR /app

# 모노레포 전체 의존성 설치를 위해 설정 파일들 복사
COPY package*.json ./
COPY turbo.json ./
COPY apps/web/package*.json ./apps/web/
COPY packages ./packages

# 의존성 설치
RUN npm install

# 나머지 소스 복사
COPY . .

# 포트 개방
EXPOSE 3000

# 실행 명령어 (Docker Compose의 command가 우선 적용되지만 명시)
CMD ["npx", "turbo", "run", "dev", "--filter=web"]