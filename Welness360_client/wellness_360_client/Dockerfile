# Step 1: Install dependencies and build the app
FROM node:slim AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install
COPY . .

ARG NEXT_PUBLIC_API_URL=https://wellness-360-server.onrender.com
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

RUN npm run build

# Step 2: Use a lighter image to serve the built app
FROM node:slim AS runner

# ✅ Create user: match with `USER` below
RUN groupadd -g 1001 nodejs && useradd -u 1001 -g nodejs -m nextjs

WORKDIR /app

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# 🔧 Ensure image cache directory is writable
RUN mkdir -p .next/cache/images && chown -R nextjs:nodejs .next

ENV NODE_ENV=production
ENV NEXT_PUBLIC_API_URL=https://wellness-360-server.onrender.com
ENV PORT=3000

USER nextjs
EXPOSE 3000

CMD ["npm", "start"]
