// Dockerfile

# Use Node.js base image
FROM node:16

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . ./

# Expose application port
EXPOSE 3000

# Start the application
CMD ["node", "index.js"]
