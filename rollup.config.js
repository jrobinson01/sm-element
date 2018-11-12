import resolve from 'rollup-plugin-node-resolve';

export default {
  input: './lib/sm-element.js',
  output: {
    file: 'sm-element.bundled.js',
    format: 'esm',
  },
  onwarn(warning) {
    if (warning.code !== 'CIRCULAR_DEPENDENCY') {
      console.error(`(!) ${warning.message}`);
    }
  },
  plugins: [
    resolve(),
  ]
}
