FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

ARG VITE_API_URL=http://localhost:5000/api
ARG VITE_COGNITO_DOMAIN=https://cloudmart.auth.us-east-1.amazoncognito.com
ARG VITE_COGNITO_CLIENT_ID=xxxxxxxxxxxx
ARG VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxx

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_COGNITO_DOMAIN=$VITE_COGNITO_DOMAIN
ENV VITE_COGNITO_CLIENT_ID=$VITE_COGNITO_CLIENT_ID
ENV VITE_STRIPE_PUBLISHABLE_KEY=$VITE_STRIPE_PUBLISHABLE_KEY

COPY . .
RUN npm run build

FROM node:18-alpine

WORKDIR /app

RUN npm install -g serve

COPY --from=build /app/dist ./dist

EXPOSE 5173

CMD ["serve", "-s", "dist", "-l", "5173"]
