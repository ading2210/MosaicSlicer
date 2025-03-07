const path = require("path");

module.exports = [
  {
    name: "app_main",
    entry: "./src/index.mjs",
    output: {
      filename: "app.mjs",
      path: path.join(__dirname, "./static/dist"),
      library: {
        type: "module"
      }
    },
    resolve: {
      fallback: {
        "url": false,
        "fs": false,
        "path": false,
        "module": false
      },
      alias: {
        "cura_icons": path.join(__dirname, "./third_party/Cura/resources/themes/cura-light/icons")
      }
    },
    module: {
      rules: [
        {
          test: /\.wasm/,
          type: "asset/resource"
        },
        {
          test: /\.svg/,
          type: "asset/inline"
        }
      ]
    },
    mode: "development",
    devtool: "eval-source-map",
    experiments: {
      topLevelAwait: true,
      outputModule: true
    }
  }
];
