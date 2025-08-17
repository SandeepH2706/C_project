# Use Node.js base image with build tools for C compilation
FROM node:18-alpine

# Install build tools for C compilation
RUN apk add --no-cache gcc musl-dev make

# Set working directory
WORKDIR /app

# Copy package files and install Node.js dependencies
COPY package*.json ./
RUN npm install

# Copy all application files
COPY . .

# Create c-bin directory if it doesn't exist
RUN mkdir -p c-bin

# Compile C programs
RUN gcc -o c-bin/auth-check c_files/check_credentials.c
RUN gcc -o c-bin/auth-signup c_files/signup.c
RUN gcc -o c-bin/add-prescription c_files/add-prescription.c
RUN gcc -o c-bin/delete-prescription c_files/delete-prescription.c

# Create data files if they don't exist, but preserve existing ones
RUN if [ ! -f users.txt ]; then echo "admin admin123\nuser user123\ndemo_user user123" > users.txt; fi
RUN if [ ! -f prescriptions.txt ]; then touch prescriptions.txt; fi

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
