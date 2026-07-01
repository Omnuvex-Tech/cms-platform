const { spawn } = require('node:child_process');

const [, , mode = 'development', ...args] = process.argv;

if (args.length === 0) {
  console.error(
    'Usage: node scripts/run-prisma.cjs <development|production> <prisma-args...>',
  );
  process.exit(1);
}

const env = {
  ...process.env,
  NODE_ENV: mode,
};

const commandPath = require.resolve('prisma/build/index.js', {
  paths: [process.cwd()],
});

const child = spawn(process.execPath, [commandPath, ...args], {
  cwd: process.cwd(),
  env,
  stdio: 'inherit',
});

child.on('exit', (code) => {
  process.exit(code ?? 1);
});

child.on('error', (error) => {
  console.error(error);
  process.exit(1);
});
