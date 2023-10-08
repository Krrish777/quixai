/** @type {import('next').NextConfig} */
const path = require("path");
const nextConfig = {
    webpack: config => {
        config.module.rules.push({
            test: /\.node$/,
            use: "node-loader",
        });
        return config;
    },

    experimental: {
        serverComponentsExternalPackages: ['pdf.js-extract'],
    },

}

module.exports = nextConfig


// module.exports = {
//     reactStrictMode: false,
// }