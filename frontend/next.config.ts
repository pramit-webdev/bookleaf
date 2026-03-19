import type { NextConfig } from "next";
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve.alias['@'] = path.resolve(__dirname);
    return config;
  },
};

export default nextConfig;
