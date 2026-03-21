#!/usr/bin/env bash
set -euo pipefail

SERVICE_NAME="ucbl-room-viewer"

usage() {
  cat <<EOF
Install/deploy ${SERVICE_NAME} with Podman Quadlet.

Usage:
  quadlet/install.sh [options]

Options:
  --mode <system|user>       Installation mode override (default: auto-detected)
  --no-cache                 Disable Podman build cache
  --build-only               Build image only, then exit (no systemd changes)
  --help                     Show this help

Examples:
  sudo quadlet/install.sh
  quadlet/install.sh
  sudo quadlet/install.sh --build-only
  sudo quadlet/install.sh --no-cache
EOF
}

MODE=""
MODE_SOURCE="auto"
PROJECT_SOURCE="$(pwd)"
UNIT_SOURCE="$PROJECT_SOURCE/quadlet/$SERVICE_NAME.container"
BUILD_ONLY=0
NO_CACHE=0
BUILD_NETWORK="default"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --mode)
      MODE="${2:-}"
      MODE_SOURCE="flag"
      shift 2
      ;;
    --no-cache)
      NO_CACHE=1
      shift
      ;;
    --build-only)
      BUILD_ONLY=1
      shift
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      usage
      exit 1
      ;;
  esac
done

if [[ -z "$MODE" ]]; then
  if [[ ${EUID:-$(id -u)} -eq 0 ]]; then
    MODE="system"
  else
    MODE="user"
  fi
fi

if [[ "$MODE" != "system" && "$MODE" != "user" ]]; then
  echo "Invalid --mode value: $MODE (expected system or user)" >&2
  exit 1
fi

if [[ "$MODE_SOURCE" == "auto" ]]; then
  echo "Auto-detected mode: $MODE"
fi

if [[ ! -e /dev/net/tun ]]; then
  BUILD_NETWORK="host"
  echo "No /dev/net/tun detected, forcing podman build network to host."
fi


IMAGE_LATEST_REF="localhost/${SERVICE_NAME}:latest"
BUILD_TIMESTAMP="$(date -u +%Y%m%d%H%M%S)"
IMAGE_VERSION_REF="localhost/${SERVICE_NAME}:${BUILD_TIMESTAMP}"

if [[ ! -d "$PROJECT_SOURCE" ]]; then
  echo "Project source directory not found: $PROJECT_SOURCE" >&2
  exit 1
fi

if [[ ! -f "$PROJECT_SOURCE/Dockerfile" ]]; then
  echo "Dockerfile not found in source directory: $PROJECT_SOURCE/Dockerfile" >&2
  exit 1
fi

if [[ ! -f "$UNIT_SOURCE" ]]; then
  echo "Quadlet file not found: $UNIT_SOURCE" >&2
  exit 1
fi

run() {
  echo "+ $*"
  "$@"
}

enable_unit_best_effort() {
  # Quadlet/systemd behavior differs by distro version; enabling may fail even if start/restart works.
  if "${SYSTEMCTL[@]}" enable "$SERVICE_NAME"; then
    return 0
  fi
  if "${SYSTEMCTL[@]}" enable "$SERVICE_NAME"; then
    return 0
  fi

  echo "Warning: could not enable $SERVICE_NAME for boot on this system; continuing with runtime start/restart only." >&2
  return 0
}

build_image() {
  local -a build_cmd=("${SUDO[@]}" podman build)

  if [[ "$BUILD_NETWORK" == "host" ]]; then
    build_cmd+=(--network host)
  fi

  if [[ "$NO_CACHE" -eq 1 ]]; then
    build_cmd+=(--no-cache)
  fi

  # Build one immutable timestamped tag and keep latest as deploy/runtime alias.
  build_cmd+=(--pull=always -t "$IMAGE_VERSION_REF" -t "$IMAGE_LATEST_REF" -f "$PROJECT_SOURCE/Dockerfile" "$PROJECT_SOURCE")

  run "${build_cmd[@]}"
}

SUDO=()
if [[ "$MODE" == "system" ]]; then
  if [[ ${EUID:-$(id -u)} -ne 0 ]]; then
    if command -v sudo >/dev/null 2>&1; then
      SUDO=(sudo)
    else
      echo "System mode requires root privileges (run as root or install sudo)." >&2
      exit 1
    fi
  fi
fi

if ! command -v podman >/dev/null 2>&1; then
  echo "podman is required but was not found in PATH." >&2
  exit 1
fi

if [[ "$BUILD_ONLY" -eq 0 ]]; then
  if ! command -v systemctl >/dev/null 2>&1; then
    echo "systemctl is required but was not found in PATH." >&2
    exit 1
  fi
fi

if [[ "$MODE" == "system" ]]; then
  UNIT_DEST_DIR="/etc/containers/systemd"
  SYSTEMCTL=("${SUDO[@]}" systemctl)
else
  UNIT_DEST_DIR="${XDG_CONFIG_HOME:-$HOME/.config}/containers/systemd"
  SYSTEMCTL=(systemctl --user)
fi
UNIT_DEST_PATH="$UNIT_DEST_DIR/$SERVICE_NAME.container"

# Build once at deploy time; service starts no longer trigger rebuilds.
build_image
echo "Built image tags: $IMAGE_VERSION_REF (versioned), $IMAGE_LATEST_REF (deployment alias)."

if [[ "$BUILD_ONLY" -eq 1 ]]; then
  echo "Build-only completed (no Quadlet/systemd changes applied)."
  echo "Image tags available: $IMAGE_VERSION_REF (versioned), $IMAGE_LATEST_REF (deployment alias)."
  exit 0
fi

run "${SUDO[@]}" mkdir -p "$UNIT_DEST_DIR"
run "${SUDO[@]}" cp "$UNIT_SOURCE" "$UNIT_DEST_PATH"

run "${SYSTEMCTL[@]}" daemon-reload
enable_unit_best_effort
if "${SYSTEMCTL[@]}" is-active --quiet "$SERVICE_NAME.service"; then
  run "${SYSTEMCTL[@]}" restart "$SERVICE_NAME.service"
else
  run "${SYSTEMCTL[@]}" start "$SERVICE_NAME.service"
fi
run "${SYSTEMCTL[@]}" --no-pager --full status "$SERVICE_NAME.service"

echo "Deployment completed."
if [[ "$MODE" == "user" ]]; then
  echo "Tip: to keep the user service running after logout, run: loginctl enable-linger $USER"
fi

