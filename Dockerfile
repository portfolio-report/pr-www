FROM node:14

WORKDIR /app

# Only re-run install if package files have changed
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy the rest of the app
COPY . .

# Build Nuxt
RUN yarn build

RUN mkdir /app/db

EXPOSE 3000

ENV NUXT_HOST=0.0.0.0

CMD yarn start
