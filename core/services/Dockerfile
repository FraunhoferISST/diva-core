# ######################################################################################################################
# This Dockerfile is used to build all core services
# Just set the SERVICE_NAME as ARG on build time, SERVICE_NAME is relatvie to "core/services" directory and can be
# "entity-management" or "adapter-services/dsc-adapter"
#
# Usage: in "core/" execute
# docker build --build-arg SERVICE_NAME=entity-management -t ghcr.io/fraunhoferisst/diva/um-test . -f ./services/Dockerfile
# ######################################################################################################################


# Build service binary
FROM node:16.14.0-alpine3.15 as builder
LABEL org.opencontainers.image.source=https://github.com/fraunhoferisst/diva

ARG SERVICE_NAME

RUN mkdir -p /app
WORKDIR /app

ENV NODE_ENV=production

COPY services/common ./services/common
COPY services/eslint-config ./services/eslint-config
COPY services/$SERVICE_NAME ./services/$SERVICE_NAME
COPY *.json ./

RUN npm ci --ignore-scripts --production --no-optional
RUN npx lerna bootstrap --hoist --ignore-scripts -- --production --no-optional
RUN npm run build:alpine --prefix services/$SERVICE_NAME

# Execute binary
FROM alpine:3.15.0
LABEL org.opencontainers.image.source=https://github.com/fraunhoferisst/diva

ARG SERVICE_NAME

RUN mkdir -p /app
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/services/$SERVICE_NAME/index-alpine /app/index-alpine

CMD ["/app/index-alpine"]

