FROM node:8

WORKDIR /opt/app
ENV NODE_ENV=production
COPY package*.json
RUN npm install

COPY src /opt/app/src
EXPOSE 9000
CMD [ "npm", "start" ]