#!/bin/bash

pack_dir() {
  local source_dir="$1"
  local out_path="$2"
  shift; shift;
  tar -cvf - -C "$source_dir" "$@" | gzip -9 - > "$out_path"
}

mkdir "static/dist/"
pack_dir "Cura/resources/" "static/dist/cura_resources.tar.gz" \
  definitions \
  extruders \
  i18n \
  setting_visibility \
  quality \
  variants