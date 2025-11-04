const react = require("@vitejs/plugin-react-swc");
const path = require("path");

module.exports = {
  server: {
    host: "::",
    port: 8080,
    allowedHosts: ["the-green-shop.onrender.com"],
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
};
