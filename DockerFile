FROM node:23
WORKDIR /app
COPY package*.json ./
RUN npm install
EXPOSE 3001
COPY . .
CMD ["node","index.js"]
 