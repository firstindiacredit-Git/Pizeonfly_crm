# Use official Node.js image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy rest of the code
COPY . .

# Expose port (change if your backend uses a different port)
EXPOSE 5000

# Start the backend
CMD ["node", "index.js"] 