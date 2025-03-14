const path = require("path");

const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = [
  {
    name: "app_main",
    entry: "./src/index.mjs",
    output: {
      filename: "js/app.mjs",
      library: {
        type: "module"
      },
      assetModuleFilename: "wasm/[name][ext]"
    },
    plugins: [new MiniCssExtractPlugin()],
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
          test: /\.html$/i,
          loader: "file-loader",
          options: {
            name: "[name].[ext]"
          }
        },
        {
          test: /\.wasm/,
          type: "asset/resource"
        },
        {
          test: /\.svg/,
          type: "asset/inline"
        },
        {
          test: /\.s[ac]ss$/i,
          use: [
            MiniCssExtractPlugin.loader,
            "css-loader",
            "sass-loader"
          ]
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
