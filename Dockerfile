FROM node:20-alpine

WORKDIR /app

# Copy package manifests
COPY backend/package*.json ./

# Install dependencies
RUN npm install --production

# Copy backend source code and load balancer script
COPY backend/ ./
COPY load_balancer.js ./

EXPOSE 5000 8000

CMD ["npm", "start"]
