FROM node:alpine

WORKDIR /usr/src/app
COPY . /usr/src/app
RUN npm install -g @angular/cli
RUN npm install

RUN ng build

FROM nginx:alpine
COPY --from=0 /usr/src/app/dist/ /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
