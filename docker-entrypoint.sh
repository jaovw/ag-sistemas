set -euo pipefail

# Simple wait-for-postgres function
wait_for_postgres() {
  echo "⏳ Waiting for Postgres at $DATABASE_URL ..."
  # Extract host and port from DATABASE_URL (supports typical postgres URL)
  # Fallback: try pg_isready if available
  # Parse host and port:
  proto_removed=${DATABASE_URL#*://}
  hostport=${proto_removed%%/*}
  # hostport may be user:pass@host:port or host:port
  hostport=${hostport##*@}
  host=${hostport%%:*}
  port=${hostport##*:}
  if [ -z "$host" ] || [ -z "$port" ]; then
    echo "Could not parse host/port from DATABASE_URL, skipping wait."
    return 0
  fi

  # Wait loop
  for i in {1..40}; do
    if nc -z "$host" "$port" 2>/dev/null; then
      echo "Postgres is available at $host:$port"
      return 0
    fi
    echo "  - try $i: Postgres not ready yet..."
    sleep 1
  done

  echo "Timed out waiting for Postgres at $host:$port"
  return 1
}

# Ensure env var exists
if [ -z "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL is not set. Exiting."
  exit 1
fi

# Try to wait for postgres (best-effort)
wait_for_postgres || true

# Generate prisma client (idempotent)
echo "Running prisma generate..."
npx prisma generate --schema=prisma/schema.prisma

# Apply schema - in production consider using migrate deploy instead of db push
if [ "${PRISMA_MIGRATE:-}" = "1" ]; then
  echo "Running prisma migrate deploy..."
  npx prisma migrate deploy --schema=prisma/schema.prisma
else
  echo "Running prisma db push (non destructive) to ensure schema exists..."
  npx prisma db push --schema=prisma/schema.prisma
fi

# Start the app
echo "Starting Next.js..."
exec "$@"
