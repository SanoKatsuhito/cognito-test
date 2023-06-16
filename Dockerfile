FROM node:16-alpine

WORKDIR /app

COPY package.json ./package.json
COPY ["package.json", "./"]

COPY package-lock.json ./package-lock.json
COPY ["package-lock.json", "./"]

RUN npm install

COPY . .

EXPOSE 3000

RUN npm run build

CMD ["npm", "start"]