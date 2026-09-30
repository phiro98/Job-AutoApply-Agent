FROM node:20-alpine

WORKDIR /app

# Install dependencies first (for better cache layer)
COPY package.json ./
RUN npm install

# Copy application code
COPY . .

# Expose Next.js port
EXPOSE 3000

# Build and start Next.js
# Using dev mode for local iteration, or switch to build/start for prod
CMD ["npm", "run", "dev"]
