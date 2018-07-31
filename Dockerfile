FROM node:8

WORKDIR /opt/app
ENV NODE_ENV=production
COPY package*.json /opt/app/
RUN npm install

COPY src /opt/app/src/
COPY static /opt/app/static/
EXPOSE 9000
CMD [ "npm", "start" ]