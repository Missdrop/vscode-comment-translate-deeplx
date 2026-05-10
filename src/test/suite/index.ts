/**
 * Test Suite Index
 *
 * This module discovers and runs all test files in the test suite using Mocha.
 * It loads all .test.js files from the test directory and executes them.
 *
 * @module test/suite/index
 */

import * as path from 'path';
const Mocha = require('mocha');
const glob = require('glob');

/**
 * Runs all tests in the test suite
 *
 * Discovers all test files matching the pattern '*.test.js' in the test directory,
 * loads them into the Mocha test runner, and executes them. The test results are
 * reported back via the returned promise.
 *
 * Test Configuration:
 * - UI: TDD (describe/suite style)
 * - Color output: Enabled
 *
 * @returns {Promise<void>} A promise that resolves when all tests pass,
 *                          or rejects with an error if any tests fail
 *
 * @example
 * run().then(() => {
 *   console.log('All tests passed');
 * }).catch((error) => {
 *   console.error('Tests failed:', error.message);
 * });
 */
export function run(): Promise<void> {
	// Create the mocha test runner with TDD interface and colored output
	const mocha = new Mocha({
		ui: 'tdd',
		color: true
	});

	// Define the root directory where test files are located
	const testsRoot = path.resolve(__dirname, '..');

	return new Promise((c, e) => {
		// Find all test files matching the pattern
		glob('**/**.test.js', { cwd: testsRoot }, (err, files) => {
			if (err) {
				return e(err);
			}

			// Add each test file to the mocha test suite
			files.forEach(f => mocha.addFile(path.resolve(testsRoot, f)));

			try {
				// Run the mocha test suite
				mocha.run(failures => {
					// Check if any tests failed
					if (failures > 0) {
						// Reject promise if tests failed
						e(new Error(`${failures} tests failed.`));
					} else {
						// Resolve promise if all tests passed
						c();
					}
				});
			} catch (err) {
				console.error(err);
				e(err);
			}
		});
	});
}
