module.exports = {
  apps: [
    {
      name: "igle",
      script: "sh",
      args: "-c 'pnpm start'",
      cwd: "/srv/igle",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
