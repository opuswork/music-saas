# /services/api/Dockerfile
# 1. Upgrade to Node 22 to satisfy @prisma/streams-local
FROM node:22-alpine
RUN apk add --no-cache libc6-compat
WORKDIR /app

# 2. Copy root package files
COPY package*.json ./
COPY turbo.json ./

# 3. Copy package structures for workspace resolution
COPY apps/web/package*.json ./apps/web/
COPY services/api/package*.json ./services/api/
COPY packages ./packages

# 4. Copy Prisma schema BEFORE npm install
COPY services/api/prisma ./services/api/prisma

# 5. Install (Now compatible with Node 22)
RUN npm install

# 6. Copy the rest of the source code
COPY . .

# 7. Generate Prisma Client directly 
# We target the schema file explicitly to avoid path confusion
RUN npx prisma generate --schema=./services/api/prisma/schema.prisma

EXPOSE 4000

# Use start:dev as your entry point
CMD ["npx", "turbo", "run", "start:dev", "--filter=api"]