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

RUN npx prisma generate
RUN npx prisma migrate deploy
RUN npm run build

# expose the port the app runs on
EXPOSE 8001

# start the app
CMD ["npm", "start", "start:prod"]