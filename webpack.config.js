const common_options = {
  mode: "development",
  experiments: {
    topLevelAwait: true,
    outputModule: true
  }
}

module.exports = [
  {
    name: "cura_worker",
    entry: "./src/engine/worker/index.mjs",
    output: {
      filename: "cura_worker.mjs",
      library: {
        type: "module"
      }
    },
    ...common_options
  },
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