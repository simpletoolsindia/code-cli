/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production'

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: false,
  output: 'export',
  distDir: '.next',
  basePath: isProd ? '/code-cli' : '',
  assetPrefix: isProd ? '/code-cli/' : '',
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config) => {
    // Disable CSS minification that causes the bracket error
    if (config.optimization?.minimizer) {
      config.optimization.minimizer = config.optimization.minimizer.filter(
        (minimizer) => !minimizer.toString().includes('CssMinimizerPlugin')
      )
    }
    return config
  },
}

module.exports = nextConfig
