# Build stage
FROM node:20-slim AS builder

WORKDIR /app

# Install build dependencies
COPY package*.json ./
RUN npm install

# Copy source and build
COPY . .
RUN npm run build

# Production stage
FROM node:20-slim

WORKDIR /app

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy built assets and server
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.ts ./
COPY --from=builder /app/src/types.ts ./src/types.ts
# Note: tsx is needed to run server.ts directly
RUN npm install -g tsx

EXPOSE 3000

ENV NODE_ENV=production

CMD ["tsx", "server.ts"]
