FROM node:18.12.1

WORKDIR /code

COPY ./ /code

RUN npm install &&\
    npm install nodemon -g &&\
    npm install typescript -g &&\
    npm install pm2 -g &&\
    pm2 install pm2-logrotate

ENTRYPOINT ["bash", "/code/docker-entrypoint.sh"]
