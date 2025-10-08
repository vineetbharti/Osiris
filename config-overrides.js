const path = require("path");

module.exports = function override(config) {
  config.resolve.alias = {
    ...config.resolve.alias,
    cesium: path.resolve(__dirname, "node_modules/cesium"),
  };

  config.module.rules.push({
    test: /\.json$/,
    type: "javascript/auto",
    include: /node_modules\/cesium/,
  });

  config.module.rules.push({
    test: /\.(glb|gltf|bin|jpg|png|svg|xml|json)$/,
    use: ["file-loader"],
  });

  config.plugins.forEach((plugin) => {
    if (plugin.constructor.name === "DefinePlugin") {
      plugin.definitions["process.env.CESIUM_BASE_URL"] = JSON.stringify("/cesium");
    }
  });

  return config;
};

