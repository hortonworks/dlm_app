FROM node:7.7.1-slim

# Create app directory
RUN mkdir -p /usr/dp-web
WORKDIR /usr/dp-web

# Install app dependencies
COPY package.json /usr/dp-web
RUN npm install

# Bundle app source
COPY . /usr/dp-web

EXPOSE 4200

CMD [ "npm", "run", "prod" ]

# Source
# https://nodejs.org/en/docs/guides/nodejs-docker-webapp/
