FROM node:20-bookworm

# Install Python and venv
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 1. Install frontend dependencies and build
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
RUN rm -rf public && mv dist public

# 2. Install backend dependencies
WORKDIR /app/server
RUN npm install

# 3. Setup Python Bot Environment
WORKDIR /app/server/python_bot
RUN python3 -m venv venv
RUN ./venv/bin/pip install -r requirements.txt

# 4. Finalize
WORKDIR /app
EXPOSE 3001
CMD ["/app/start.sh"]