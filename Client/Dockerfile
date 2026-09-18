FROM node:24-alpine AS build
WORKDIR /app

COPY Client/package.json Client/package-lock.json ./
RUN npm ci

COPY Client/ ./
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

FROM nginx:1.28-alpine AS final
COPY Client/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
# Seeded products use /images/products/... URLs. Serve those files from the
# same origin as the SPA instead of exposing another API/static-file origin.
COPY API/RestoreAPI.Presentation/wwwroot/images /usr/share/nginx/html/images

EXPOSE 80
