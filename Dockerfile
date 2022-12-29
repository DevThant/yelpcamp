FROM node:18

# Working Directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Create app directory
COPY ./ .

# Expose API port
EXPOSE 8080

# Start the app
CMD ["npm", "start"]