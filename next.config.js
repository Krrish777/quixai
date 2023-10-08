const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Add a condition to exclude pdf.js-extract only on the client side
    if (!isServer) {
      config.externals = {
        'pdf.js-extract': 'pdf.js-extract',
      };
    }

    // Add your existing webpack rules if needed
    config.module.rules.push({
      test: /\.node$/,
      use: "node-loader",
    });

    return config;
  },
};

module.exports = nextConfig;



// module.exports = {
//     reactStrictMode: false,
// }