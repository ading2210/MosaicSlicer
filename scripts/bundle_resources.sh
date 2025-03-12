#!/bin/bash

set -e
set -x

pack_dir() {
  local source_dir="$1"
  local out_path="$2"
  shift; shift;
  tar -cvf - -C "$source_dir" "$@" | gzip -9 - > "$out_path"
}

#todo: add xml material definitons to bundle

mkdir -p "static/dist/resources"
mkdir -p "/tmp/cura_resources"
cp -r third_party/Cura/resources/{definitions,extruders,i18n,setting_visibility,quality,variants,intent} "/tmp/cura_resources"
mkdir -p "/tmp/cura_resources/materials"
cp -r "third_party/fdm_materials/"*.xml.fdm_material "/tmp/cura_resources/materials"

pack_dir "/tmp/cura_resources" "static/dist/resources/cura_data.tar.gz" "."
rm -rf "/tmp/cura_resources"
gzip -l "static/dist/resources/cura_data.tar.gz"