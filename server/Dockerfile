FROM node:18-alpine

# Install Alpine Chromium and dependencies for Puppeteer
RUN apk add --no-cache \
      chromium \
      nss \
      freetype \
      harfbuzz \
      ca-certificates \
      ttf-freefont

# Tell Puppeteer to use the Alpine Chromium instead of downloading Chrome
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /app

# Install dependencies (only production dependencies to save space)
COPY package*.json ./
RUN npm ci --only=production

# Copy application files
COPY . .

# Set default Node environment
ENV NODE_ENV=production

EXPOSE 5000

CMD ["node", "server.js"]
