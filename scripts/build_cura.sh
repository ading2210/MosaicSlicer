#!/bin/bash

set -e
set -x

if [ ! -d ".venv" ]; then
  python3 -m venv .venv
fi
source .venv/bin/activate


if ! pip3 list | grep conan > /dev/null; then
  pip3 install conan==2.7.1
fi

cd third_party/CuraEngine

conan config install -t git https://github.com/simplyrohan/conan-config
conan profile detect --force

conan install . -pr:h cura_wasm.jinja --build=missing --update 
cmake --preset conan-emscripten-release
cmake --build --preset conan-emscripten-release

mkdir -p ../../dist/compiled
# cp build/emscripten/Release/CuraEngine.js dist/compiled/CuraEngine.mjs
echo "const bc_channel = new BroadcastChannel('curaengine_cbs')\n" > ../../dist/compiled/CuraEngine.js
cat build/emscripten/Release/CuraEngine.js >> ../../dist/compiled/CuraEngine.js