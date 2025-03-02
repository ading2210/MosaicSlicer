#!/bin/bash

set -e
set -x

pack_dir() {
  local source_dir="$1"
  local out_path="$2"
  shift; shift;
  tar -cvf - -C "$source_dir" "$@" | gzip -9 - > "$out_path"
}

mkdir -p "static/dist/resources"
pack_dir "third_party/Cura/resources/" "static/dist/resources/cura_data.tar.gz" \
  definitions \
  extruders \
  i18n \
  setting_visibility \
  quality \
  variants