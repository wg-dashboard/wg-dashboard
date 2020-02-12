const path = require("path");

module.exports = {
	mode: process.env.NODE_ENV === "production" ? "production" : "development",
	entry: path.resolve(__dirname, "src/client/index.tsx"),
	devtool: "inline-source-map",
	target: "node",
	resolve: {
		extensions: [".ts", ".tsx", ".js"],
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				loader: "ts-loader",
				exclude: /node_modules/,
				options: {
					configFile: "tsconfig.client.json",
				},
			},
			{
				test: /\.css$/i,
				use: ["style-loader", "css-loader"],
			},
		],
	},
	output: {
		path: path.resolve(__dirname, "public/static/js"),
		filename: "app.js",
	},
	watch: true,
};
