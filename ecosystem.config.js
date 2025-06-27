module.exports = {
  apps: [
    {
      name: "igle",
      script: "sh",
      args: "-c 'pnpm start'",
      cwd: "/home/igle-songs",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
