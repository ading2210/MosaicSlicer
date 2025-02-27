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
    module: {
      rules: [
        {
          test: /\.s[ac]ss$/i,
          use: ["style-loader", "css-loader", "sass-loader"],
        },
      ],
    },
    ...common_options
  }
]