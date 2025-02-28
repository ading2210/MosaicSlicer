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
      library: {
        type: "module"
      }
    },
    ...common_options
  }
]