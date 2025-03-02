# Web Slicer

## Building
Compile CuraEngine:
```
$ scripts/build_cura.sh
```

Make sure you have emscripten installed before this
Compile MicroPython:
```
$ scripts/build_micropython.sh
```

Install JS dependencies:
```
$ npm i
```

Bundle JS with Webpack:
```
npm run build:prod
```
