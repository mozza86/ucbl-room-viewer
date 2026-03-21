# Quadlet config (Podman + systemd)

This folder contains a Quadlet unit for `ucbl-room-viewer`.

## Files

- `ucbl-room-viewer.container`: runs the app container from a prebuilt local image.
- `install.sh`: deploy script that builds the image from project sources, installs the Quadlet unit, reloads systemd, and restarts the service. It also supports build-only mode.

## Quick install with script (recommended)

System mode:

```bash
chmod +x quadlet/install.sh
sudo quadlet/install.sh
```

User mode:

```bash
chmod +x quadlet/install.sh
quadlet/install.sh
```

Common options:

```bash
quadlet/install.sh --help
quadlet/install.sh --mode system
quadlet/install.sh --mode user
quadlet/install.sh --build-only
quadlet/install.sh --no-cache
```

## Manual install (system mode)

Copy the unit file:

```bash
sudo cp quadlet/ucbl-room-viewer.container /etc/containers/systemd/
```

Reload and enable:

```bash
sudo systemctl daemon-reload
sudo systemctl enable ucbl-room-viewer.service
sudo systemctl start ucbl-room-viewer.service
```

Check status:

```bash
sudo systemctl status ucbl-room-viewer.service
sudo podman ps
```

## Manual install (rootless user mode)

Copy the unit file:

```bash
mkdir -p ~/.config/containers/systemd
cp quadlet/ucbl-room-viewer.container ~/.config/containers/systemd/
```

Reload and enable:

```bash
systemctl --user daemon-reload
systemctl --user enable ucbl-room-viewer.service
systemctl --user start ucbl-room-viewer.service
loginctl enable-linger "$USER"
```

## Notes

- Port mapping is `8888:3000`.
- `NODE_ENV=production` is set in the container.
- The image is built during `quadlet/install.sh`, not at each service start.
- Each build now creates two tags: a UTC timestamped tag (`localhost/ucbl-room-viewer:YYYYMMDDHHMMSS`) and `localhost/ucbl-room-viewer:latest`.
- Quadlet keeps using `Image=localhost/ucbl-room-viewer:latest`, so deployments remain stable while preserving per-build traceability.
- The install script always uses the current directory as project source and the fixed service name `ucbl-room-viewer`.
- The install script auto-detects mode: `system` when run as root, `user` otherwise (`--mode` can override this).
- If `/dev/net/tun` is missing, the script automatically builds with Podman `--network host` to avoid pasta/tun failures.
- Use `--build-only` if you want to build the image without changing Quadlet/systemd.
- Use `--no-cache` to force a fresh image build without reusing build cache layers.
- On some LXC/systemd versions, `enable` may fail for Quadlet units; `start`/`restart` of `ucbl-room-viewer.service` can still work.
