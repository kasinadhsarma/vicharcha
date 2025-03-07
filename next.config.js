// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Important: Ignore both kerberos.node and the module itself.
    config.externals.push({
      kerberos: 'kerberos',
      'kerberos/build/Release/kerberos.node': 'kerberos/build/Release/kerberos.node',
      'kerberos/lib/kerberos': 'kerberos/lib/kerberos',
    });

    // Ignore kerberos for server build.
    if (isServer) {
        config.externals = [...(config.externals || []), 'kerberos'];
      config.resolve.alias['kerberos'] = false;
    }

    // Ensure Webpack doesn't try to parse binary files
    config.module.rules.push({
      test: /\.node$/,
      use: 'node-loader', // or just ignore
    });
    return config;
  }
};

module.exports = nextConfig;
