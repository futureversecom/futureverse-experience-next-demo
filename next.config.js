/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // experimental: {
  //   esmExternals: 'loose',
  //   fullySpecified: false,
  // },
  // transpilePackages: ['@apollo/client'],
  // webpack: (config, options) => {
  //   config.resolve.extensions.push('.ts', '.tsx', '.js', '.jsx', '.json')
  //   config.module.rules.push({
  //     test: /\.m?js$/,
  //     resolve: {
  //       fullySpecified: false,
  //     },
  //     include: ['graphql'].map((name) => new RegExp(`node_modules/${name}`)),
  //   })

  //   return config
  // },
}

module.exports = nextConfig
