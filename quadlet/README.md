# Quadlet config (Podman + systemd)

This folder contains a Quadlet unit for `ucbl-room-viewer`.

## Files

- `ucbl-room-viewer.container`: runs the app container from a prebuilt local image.
- `install.sh`: deploy script that copies project files, builds the image once, installs the Quadlet unit, reloads systemd, and restarts the service. It also supports build-only mode.

## Quick install with script (recommended)

System mode:

```bash
chmod +x quadlet/install.sh
sudo quadlet/install.sh
```

User mode:

```bash
chmod +x quadlet/install.sh
quadlet/install.sh --mode user --target "$HOME/apps/ucbl-room-viewer"
```

Common options:

```bash
quadlet/install.sh --help
quadlet/install.sh --mode system --target /srv/ucbl-room-viewer
quadlet/install.sh --service-name ucbl-room-viewer
quadlet/install.sh --skip-build
quadlet/install.sh --build-only
quadlet/install.sh --build-network host
quadlet/install.sh --no-cache
```

## Manual install (system mode)

Copy the unit file:

```bash
sudo cp quadlet/ucbl-room-viewer.container /etc/containers/systemd/
```

Edit `WorkingDirectory` in `/etc/containers/systemd/ucbl-room-viewer.container` so it points to your repo path on the Linux host.

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

Edit `WorkingDirectory` in `~/.config/containers/systemd/ucbl-room-viewer.container`.

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
- The script uses `rsync` when available, with fallback to `tar`.
- The image is built during `quadlet/install.sh`, not at each service start.
- Use `--skip-build` if you want to redeploy/restart without rebuilding the image.
- Use `--build-only` if you want to copy sources and build the image without changing Quadlet/systemd.
- Use `--no-cache` to force a fresh image build without reusing build cache layers.
- `--build-only` and `--skip-build` cannot be used together.
- `--build-network auto` (default) switches to `host` for build when `/dev/net/tun` is missing.
- On some LXC/systemd versions, `enable` may fail for Quadlet units; `start`/`restart` of `ucbl-room-viewer.service` can still work.
