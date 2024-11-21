/** @type {import('next').NextConfig} */
const nextConfig = {
	images: { loader: "custom", loaderFile: "./loader.ts" },
	output: "export",
};

export default nextConfig;
