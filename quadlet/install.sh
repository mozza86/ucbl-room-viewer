#!/usr/bin/env bash
set -euo pipefail

DEFAULT_SERVICE_NAME="ucbl-room-viewer"
SERVICE_NAME="$DEFAULT_SERVICE_NAME"

usage() {
  cat <<EOF
Install/deploy ${SERVICE_NAME} with Podman Quadlet.

Usage:
  quadlet/install.sh [options]

Options:
  --mode <system|user>       Installation mode (default: system)
  --source <path>            Project source directory (default: repo root)
  --target <path>            Deployment directory (default: /opt/${SERVICE_NAME} in system mode, \$HOME/${SERVICE_NAME} in user mode)
  --service-name <name>      systemd service base name (default: ${SERVICE_NAME})
  --unit-source <path>       Source Quadlet .container file (default: <source>/quadlet/<service-name>.container)
  --build-network <mode>     Podman build network mode: auto|default|host (default: auto)
  --skip-build               Skip podman image build during deployment
  --build-only               Copy sources + build image, then exit (no systemd changes)
  --help                     Show this help

Examples:
  sudo quadlet/install.sh
  sudo quadlet/install.sh --target /srv/${SERVICE_NAME}
  quadlet/install.sh --mode user --target "\$HOME/apps/${SERVICE_NAME}"
  sudo quadlet/install.sh --service-name my-app --build-only
  sudo quadlet/install.sh --build-network host
EOF
}

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
DEFAULT_SOURCE="$(cd -- "$SCRIPT_DIR/.." && pwd)"

MODE="system"
PROJECT_SOURCE="$DEFAULT_SOURCE"
PROJECT_TARGET=""
UNIT_SOURCE=""
SKIP_BUILD=0
BUILD_ONLY=0
BUILD_NETWORK="${BUILD_NETWORK:-auto}"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --mode)
      MODE="${2:-}"
      shift 2
      ;;
    --source)
      PROJECT_SOURCE="${2:-}"
      shift 2
      ;;
    --target)
      PROJECT_TARGET="${2:-}"
      shift 2
      ;;
    --service-name)
      SERVICE_NAME="${2:-}"
      shift 2
      ;;
    --unit-source)
      UNIT_SOURCE="${2:-}"
      shift 2
      ;;
    --build-network)
      BUILD_NETWORK="${2:-}"
      shift 2
      ;;
    --skip-build)
      SKIP_BUILD=1
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

if [[ "$MODE" != "system" && "$MODE" != "user" ]]; then
  echo "Invalid --mode value: $MODE (expected system or user)" >&2
  exit 1
fi

if [[ "$SKIP_BUILD" -eq 1 && "$BUILD_ONLY" -eq 1 ]]; then
  echo "--build-only and --skip-build cannot be used together." >&2
  exit 1
fi

if [[ "$BUILD_NETWORK" != "auto" && "$BUILD_NETWORK" != "default" && "$BUILD_NETWORK" != "host" ]]; then
  echo "Invalid --build-network value: $BUILD_NETWORK (expected auto, default, or host)." >&2
  exit 1
fi

if [[ -z "$PROJECT_TARGET" ]]; then
  if [[ "$MODE" == "system" ]]; then
    PROJECT_TARGET="/opt/$SERVICE_NAME"
  else
    PROJECT_TARGET="$HOME/$SERVICE_NAME"
  fi
fi

if [[ -z "$UNIT_SOURCE" ]]; then
  UNIT_SOURCE="$PROJECT_SOURCE/quadlet/$SERVICE_NAME.container"
fi

IMAGE_REF="localhost/${SERVICE_NAME}:latest"

if [[ ! -d "$PROJECT_SOURCE" ]]; then
  echo "Project source directory not found: $PROJECT_SOURCE" >&2
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

build_image() {
  local network_mode="$1"
  local -a build_cmd=("${SUDO[@]}" podman build --pull=always -t "$IMAGE_REF" -f "$PROJECT_TARGET/Dockerfile" "$PROJECT_TARGET")

  if [[ "$network_mode" != "default" ]]; then
    build_cmd=("${SUDO[@]}" podman build --network "$network_mode" --pull=always -t "$IMAGE_REF" -f "$PROJECT_TARGET/Dockerfile" "$PROJECT_TARGET")
  fi

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

if command -v rsync >/dev/null 2>&1; then
  run "${SUDO[@]}" mkdir -p "$PROJECT_TARGET"
  run "${SUDO[@]}" rsync -a --delete \
    --exclude .git \
    --exclude node_modules \
    --exclude .next \
    --exclude .DS_Store \
    --exclude '*.log' \
    "$PROJECT_SOURCE/" "$PROJECT_TARGET/"
else
  echo "rsync not found; using tar fallback." >&2
  run "${SUDO[@]}" mkdir -p "$PROJECT_TARGET"
  run bash -c "cd \"$PROJECT_SOURCE\" && tar --exclude=.git --exclude=node_modules --exclude=.next --exclude='*.log' -cf - . | ${SUDO[*]:-} tar -C \"$PROJECT_TARGET\" -xf -"
fi

if [[ "$SKIP_BUILD" -eq 0 ]]; then
  # Build once at deploy time; service starts no longer trigger rebuilds.
  EFFECTIVE_BUILD_NETWORK="$BUILD_NETWORK"
  if [[ "$BUILD_NETWORK" == "auto" ]]; then
    if [[ -e /dev/net/tun ]]; then
      EFFECTIVE_BUILD_NETWORK="default"
    else
      EFFECTIVE_BUILD_NETWORK="host"
      echo "No /dev/net/tun detected, forcing podman build network to host." >&2
    fi
  fi

  build_image "$EFFECTIVE_BUILD_NETWORK"
else
  echo "Skipping image build (--skip-build)."
fi

if [[ "$BUILD_ONLY" -eq 1 ]]; then
  echo "Build-only completed (no Quadlet/systemd changes applied)."
  exit 0
fi

run "${SUDO[@]}" mkdir -p "$UNIT_DEST_DIR"

TMP_UNIT="$(mktemp)"
cleanup() {
  rm -f "$TMP_UNIT"
}
trap cleanup EXIT

awk -v wd="$PROJECT_TARGET" '
  BEGIN {updated=0}
  /^WorkingDirectory=/ {print "WorkingDirectory=" wd; updated=1; next}
  {print}
  END {if (!updated) print "WorkingDirectory=" wd}
' "$UNIT_SOURCE" > "$TMP_UNIT"

run "${SUDO[@]}" cp "$TMP_UNIT" "$UNIT_DEST_PATH"

run "${SYSTEMCTL[@]}" daemon-reload
# For Quadlet, enable the source unit name (<name>.container), not an absolute path.
run "${SYSTEMCTL[@]}" enable "$SERVICE_NAME.container"
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

