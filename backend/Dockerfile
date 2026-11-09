# Use nodejs 22
FROM node:22-alpine

# Set the work directory inside the container
WORKDIR /app

# Copy dependency files first
COPY package*.json ./

# Install production dependencies
RUN npm install --omit=dev

# Copy the backend source code
COPY src ./src

# Backend listens on port 5000
EXPOSE 5000

# Start the app
CMD ["npm","start"]