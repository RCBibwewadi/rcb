const { execSync } = require('child_process');

try {
  console.log('Starting build...');
  const output = execSync('npm run build', { 
    encoding: 'utf-8',
    stdio: 'pipe',
    maxBuffer: 10 * 1024 * 1024
  });
  console.log(output);
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed!');
  console.error('STDOUT:', error.stdout);
  console.error('STDERR:', error.stderr);
  process.exit(1);
}
