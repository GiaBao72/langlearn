module.exports = {
  apps: [{
    name: 'langlearn',
    script: 'node_modules/.bin/next',
    args: 'start -p 3000',
    cwd: '/home/tmc/projects/langlearn',
    instances: 1,
    exec_mode: 'fork',
    max_memory_restart: '512M',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      DATABASE_URL: 'postgresql://langlearn_user:langlearn_pass_2026@localhost:5432/langlearn',
      JWT_ACCESS_SECRET: 'ae9e4e7973a7dcb85645f1fc2772131a3232a056cccff1806d093a3d832fdcc7',
      JWT_REFRESH_SECRET: 'c8652d8a7cd858340401bde602c5b010538f7e37536acb8d496163e3008627c1',
      NEXTAUTH_URL: 'http://118.70.49.57:3000',
    }
  }]
}
