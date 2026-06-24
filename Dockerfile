FROM node:22-alpine

# OpenSSL é necessário para o engine nativo usado pelo Prisma.
RUN apk add --no-cache openssl

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev", "--", "--hostname", "0.0.0.0"]
