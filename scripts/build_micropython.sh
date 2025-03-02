#!/bin/bash

set -e
set -x

cd micropython/ports/webassembly
make submodules
make min
cd ../../..

mkdir -p dist/compiled
cp  micropython/ports/webassembly/build-standard/micropython.min.mjs dist/compiled/micropython.min.mjs
cp  micropython/ports/webassembly/build-standard/micropython.wasm dist/compiled/micropython.wasm