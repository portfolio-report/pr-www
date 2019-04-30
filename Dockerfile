FROM node:10

WORKDIR /app

# Only re-run install if package files have changed
COPY package*.json ./
RUN npm install

# Update GeoIP database
RUN cd node_modules/geoip-lite && npm run-script updatedb

# Copy the rest of the app
COPY . .

# Build Nuxt
RUN npm run build

VOLUME /app/db

EXPOSE 3000

ENV NUXT_HOST=0.0.0.0

CMD npm start
