#!/usr/bin/env bash
set -euo pipefail

# Defaults to docker-compose.prod.yml but can be overridden:
COMPOSE_FILE="${COMPOSE_FILE:-compose.prod.yaml}"

COMPOSE_CMD=("docker" "compose" "-f" "$COMPOSE_FILE")

usage() {
    cat <<EOF
Usage: $0 <command> [service]
Commands:
    up                     start containers in detached mode
    down                   stop and remove containers, networks, volumes
    logs [service Name]    follow logs (tail 200 lines). If no service, shows all
    ps                     list containers
    restart                 down then up -d
    rebuild                 down then up -d --build
    clear                  down, remove volumes and images
EOF
    exit 2
}

if [ $# -lt 1 ]; then
    usage
fi

cmd="$1"; shift || true

case "$cmd" in
    up)
        "${COMPOSE_CMD[@]}" up -d "$@"
        ;;
    down)
        "${COMPOSE_CMD[@]}" down
        ;;
    logs)
        if [ $# -eq 0 ]; then
            "${COMPOSE_CMD[@]}" logs -f --tail=200
        else
            "${COMPOSE_CMD[@]}" logs -f --tail=200 "$@"
        fi
        ;;
    ps)
        "${COMPOSE_CMD[@]}" ps
        ;;
    restart)
        "${COMPOSE_CMD[@]}" down
        "${COMPOSE_CMD[@]}" up -d "$@"
        ;;
    rebuild)
        "${COMPOSE_CMD[@]}" down
        "${COMPOSE_CMD[@]}" up -d --build "$@"
        ;;
    clear)
        "${COMPOSE_CMD[@]}" down -v --rmi all
        ;;
    *)
        usage
        ;;
esac