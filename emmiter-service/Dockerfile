FROM node:16

WORKDIR /media/snehith/New Volume/Syook/emmiter-service

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000
CMD [ "node", "index.js" ]
