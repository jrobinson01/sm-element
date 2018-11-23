import resolve from 'rollup-plugin-node-resolve';
import filesize from 'rollup-plugin-filesize';

export default {
  input: 'src/sm-element.js',
  output: {
    file: 'sm-element.bundled.js',
    format: 'esm',
  },
  external: [
    'lit-html/lit-html'
  ],
  onwarn(warning) {
    if (warning.code !== 'CIRCULAR_DEPENDENCY') {
      console.error(`(!) ${warning.message}`);
    }
  },
  plugins: [
    resolve({
      customResolveOptions: {
        moduleDirectory:'node_modules',
      },
    }),
    filesize({
      showBrotliSize: true
    })
  ]
}
