# build stage
FROM node:20 AS builder

# working directory
WORKDIR /app

# copy package files and install dependencies
COPY package*.json ./

# install dependencies
RUN npm install

# copy source code and build the app
COPY . .

# build the app
RUN npm run build

# production stage

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

# expose port 80
EXPOSE 80

# start nginxCMD 
CMD ["nginx", "-g", "daemon off;"]