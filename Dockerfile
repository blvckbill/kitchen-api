# ---------- builder stage ----------
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package management blueprints for deterministic caching
COPY package*.json ./

# Install all dependencies including devDependencies for build steps
RUN npm ci

# Copy core application workspace
COPY . .

# ---------- final stage ----------
FROM node:20-alpine

ENV NODE_ENV=production \
    APP_HOME=/home/app/web

# Install dumb-init for robust process virtualization
RUN apk add --no-cache dumb-init bash

# Establish secure isolated system group and user
RUN addgroup -S app && adduser -S -G app -h /home/app app \
  && mkdir -p ${APP_HOME} && chown -R app:app /home/app

WORKDIR ${APP_HOME}

# Copy dependency requirements
COPY --chown=app:app package*.json ./

# Install production runtime dependencies strictly, omitting devDependencies
RUN npm ci --omit=dev

# Selectively pull verified source components from the builder stage
COPY --chown=app:app --from=builder /app/src ./src
COPY --chown=app:app --from=builder /app/database ./database
COPY --chown=app:app --from=builder /app/knexfile.js ./knexfile.js
COPY --chown=app:app --from=builder /app/entrypoint.sh ./entrypoint.sh

RUN chmod +x ${APP_HOME}/entrypoint.sh

# Revoke root privileges
USER app

EXPOSE 3000

# Pipeline execution directly through the signal-handling init system
ENTRYPOINT ["dumb-init", "./entrypoint.sh"]