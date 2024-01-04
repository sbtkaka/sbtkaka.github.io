module.exports = {
  apps : [{
    name: '918KissU-Report',
    script: 'main',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development',
      PORT: 3178,
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 5178,
    }
  }],
};