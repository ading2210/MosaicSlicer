const path = require("path");

const common_options = {
  mode: "development",
  devtool: "eval-source-map",
  experiments: {
    topLevelAwait: true,
    outputModule: true
  }
}

module.exports = [
  {
    name: "app_main",
    entry: "./src/index.mjs",
    output: {
      filename: "main.mjs",
      path: path.join(__dirname, "./static/dist"),
      library: {
        type: "module"
      }
    },
    ...common_options
  }
]