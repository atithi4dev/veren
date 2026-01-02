# Use official Node.js LTS image
FROM node:20-bullseye

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of your backend code
COPY . .

# Expose the port your app listens on
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
