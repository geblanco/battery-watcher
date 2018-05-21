#!/bin/bash

echo "[Desktop Entry]" > batteryWatcher.desktop
echo "Encoding=UTF-8" >> batteryWatcher.desktop
echo "Version=1.0" >> batteryWatcher.desktop
echo "Name=batteryWatcher" >> batteryWatcher.desktop
echo "Exec=/opt/batteryWatcher/batteryWatcher" >> batteryWatcher.desktop
echo "Terminal=false" >> batteryWatcher.desktop
echo "Type=Application" >> batteryWatcher.desktop
echo "Categories=Utility;" >> batteryWatcher.desktop

# TODO copy icon to icons folder

electron-packager ./ batteryWatcher \
  --platform=linux \
  --arch=x64 \
  --version=$(electron -v | cut -c 2-) \
  --prune \
  --ignore="mkDist.sh" \
  --ignore="tmpIcons/*" \
  --ignore=".gitignore" \
  --ignore=".git" \
  --version-string.FileDescription="batteryWatcher" \
  --version-string.FileVersion="0.1.0" \
  --version-string.ProductVersion="0.1.0" \
  --version-string.ProductName="Battery Watcher" \
  --app-version="0.1.0" \
  --overwrite

mv batteryWatcher-linux-x64 batteryWatcher