# Web Slicer

## Building

Make sure you have all submodules cloned:

```
$ git submodule update --init --progress
```

Compile CuraEngine:

```
$ scripts/build_cura.sh
```

Bundle Resourdces:

```
$ scripts/bundle_resources.sh
```

Install JS dependencies:

```
$ npm i
```

Bundle JS with Webpack:

```
$ npm run build:prod
```

Final output will be in `dist/`
