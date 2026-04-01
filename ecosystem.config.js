module.exports = {
  apps: [{
    name: 'langlearn',
    script: 'node_modules/.bin/next',
    args: 'start -p 12431',
    cwd: '/root/langlearn',
    env: {
      NODE_ENV: 'production',
      PORT: '12431',
      HOSTNAME: '0.0.0.0'
    }
  }]
}
