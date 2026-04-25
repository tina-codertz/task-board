# use node
FROM node:alpine 

# create working directory
WORKDIR /app

# copy package.json and package-lock.json
COPY package*.json ./

# install dependencies
RUN npm install

# copy source code
COPY . .

# build the app
RUN npm run build

# expose the port the app runs on
EXPOSE 5000

# start the app
CMD ["npm", "start", "start:prod"]