#!/bin/bash
# Uso: ./unlock-account.sh correo@fet.edu.co

EMAIL=${1:?"Debes pasar el email como argumento. Ej: ./unlock-account.sh usuario@fet.edu.co"}

echo "Desbloqueando cuenta en Postgres..."
PGPASSWORD=insideout_secret psql -h localhost -p 5433 -U insideout -d insideout_db -c \
  "UPDATE login_attempts la SET attempts = 0, locked_until = NULL FROM users u WHERE la.user_id = u.id AND u.email = '$EMAIL';"

echo "Limpiando rate limit en Redis..."
KEYS=$(docker exec inside-bk-redis-1 redis-cli keys "rl:auth:*" 2>/dev/null | tr '\n' ' ')
if [ -n "$KEYS" ]; then
  docker exec inside-bk-redis-1 redis-cli del $KEYS
  echo "Rate limit de auth limpiado."
else
  echo "No habia keys de rate limit en Redis."
fi
