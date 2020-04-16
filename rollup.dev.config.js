import svelte from 'rollup-plugin-svelte';
import { terser } from 'rollup-plugin-terser';
import resolve from '@rollup/plugin-node-resolve';
import livereload from 'rollup-plugin-livereload';

const pkg = require('./package.json');

export default [{
	input: 'src/tinro.js',
	output: [
	{ file: 'tests/dist/tinro_lib_test.js', format: 'es', sourcemap: true }
	],
	external: [
	...Object.keys(pkg.dependencies || {}),
	...Object.keys(pkg.peerDependencies || {}),
	'svelte',
	'svelte/store'
	],
	plugins: [resolve({dedupe: ['svelte']})]
},{
	input: 'tests/app.js',
	output: {
		sourcemap: true,
		format: 'iife',
		name: 'app',
		file: 'tests/www/build/bundle.js'
	},
	plugins: [
		rollup_plugin_alias(),
		svelte({
			dev: true,
			css: css => {
				css.write('tests/www/build/bundle.css');
			}
		}),
		resolve({dedupe: ['svelte']}),
		serve(),
		livereload('tests/www')
	],
	watch: {
		clearScreen: false
	}
}]

function serve() {
	let started = false;

	return {
		writeBundle() {
			if (!started) {
				started = true;

				require('child_process').spawn('npm', ['run', 'serve', '--', '--dev','--single'], {
					stdio: ['ignore', 'inherit', 'inherit'],
					shell: true
				});
			}
		}
	};
}

function rollup_plugin_alias(){
	const cwd = process.cwd();
	return {
        name: 'rollup_plugin_alias',
		resolveId(id,importer){
			return id==='tinro' ? this.resolve(`${cwd}/cmp/index.js`,importer) : 
			       id.endsWith('/dist/tinro_lib') ? this.resolve(`${cwd}/tests/dist/tinro_lib_test.js`,importer) : null
		}
	}
}
