#!/bin/bash

set -e
set -x

if [ ! -d ".venv" ]; then
  python3 -m venv .venv
fi
source .venv/bin/activate

if ! pip3 list | grep conan > /dev/null; then
  pip3 install conan==2.7.1
  conan config install https://github.com/ultimaker/conan-config.git
fi

cd CuraEngine
conan install . -pr:h cura_wasm.jinja --build=missing --update
cmake --preset conan-emscripten-release
cmake --build --preset conan-emscripten-release
cd ..

mkdir -p dist
cp CuraEngine/build/emscripten/Release/CuraEngine.js dist/CuraEngine.mjs