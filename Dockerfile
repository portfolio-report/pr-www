FROM node:12

WORKDIR /app

# Only re-run install if package files have changed
COPY package*.json ./
RUN npm ci

# Copy the rest of the app
COPY . .

# Build Nuxt
ARG API_URL
RUN npm run build

VOLUME /app/db

EXPOSE 3000

ENV NUXT_HOST=0.0.0.0

# Set ENV value from ARG
ENV API_URL=${API_URL}

CMD npm run migrations && npm start
