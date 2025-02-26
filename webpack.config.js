module.exports = [
  {
    mode: "development",
    name: "cura_worker",
    entry: "./src/worker/index.mjs",
    output: {
      filename: "cura_worker.mjs",
      library: {
        type: "module"
      }
    },
    experiments: {
      topLevelAwait: true,
      outputModule: true
    }
  }
]