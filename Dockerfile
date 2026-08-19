FROM node:20-alpine
WORKDIR /app

# No dependencies to install — the app uses only Node's built-in modules.
COPY . .

ENV NODE_ENV=production
# Coolify/Docker injects PORT at runtime; the app falls back to 5514.
EXPOSE 5514

CMD ["node", "server.js"]
