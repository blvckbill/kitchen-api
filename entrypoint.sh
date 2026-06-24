#!/bin/bash
set -e

echo "Running database migration layer..."
npx knex migrate:latest

echo "Booting Express Application Engine..."
exec node src/server.js