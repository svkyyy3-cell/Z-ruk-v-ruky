# Recipe Render follows to build and start the marketplace.
# Stage 1 builds the site with Node; stage 2 is a small nginx image that only serves it.
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.27-alpine
# nginx fills ${PORT} into this template when the container starts.
COPY deploy/nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html
# Hosts set PORT themselves; 8080 is used when running the image locally.
ENV PORT=8080
EXPOSE 8080
