#!/usr/bin/env sh

set -eu

BUILD_DIR=./build
ENTRY_POINT=./bin/spider-repl.ts
BUNDLE_OUT="$BUILD_DIR/spider-repl.js"
BINARY_OUT="$BUILD_DIR/spider-repl"
BLOB_OUT="$BUILD_DIR/spider-repl.blob"

bundle() {
  echo "Bundling..."
  npx esbuild "$ENTRY_POINT" --bundle \
    --platform=node \
    --format=cjs \
    --outfile="$BUNDLE_OUT"
}

build_blob() {
  echo "Building blob..."
  node --experimental-sea-config ./sea-config.json
}

build_exe() {
  echo "Building executable..."
  cp -r "$(command -v node)" "$BINARY_OUT"
  chmod 744 "$BINARY_OUT"

  npx postject "$BINARY_OUT" \
    NODE_SEA_BLOB "$BLOB_OUT" \
    --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2
}

case "$1" in
  bundle) bundle ;;
  build)
    mkdir -p build
    bundle
    build_blob
    build_exe
  ;;
  *) echo "Invalid command $1" && exit 1 ;;
esac
