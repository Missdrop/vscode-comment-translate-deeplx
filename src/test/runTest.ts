/**
 * Test Runner for VSCode Extension
 * 
 * This module sets up and runs integration tests for the DeepLX Comment Translate extension.
 * It downloads VS Code, configures the test environment, and executes the test suite.
 * 
 * @module runTest
 */

import * as path from 'path';
import { runTests } from '@vscode/test-electron';

/**
 * Main test runner function
 * 
 * Downloads and runs VS Code with the extension in test mode.
 * The test runner will:
 * 1. Download the specified VS Code version
 * 2. Install the extension from the development path
 * 3. Run the test suite specified in extensionTestsPath
 * 4. Exit with appropriate status code
 * 
 * @async
 * @throws {Error} If test execution fails
 */
async function main() {
	try {
		// The folder containing the Extension Manifest package.json
		// Passed to `--extensionDevelopmentPath`
		const extensionDevelopmentPath = path.resolve(__dirname, '../../');

		// The path to test runner
		// Passed to --extensionTestsPath
		const extensionTestsPath = path.resolve(__dirname, './suite/index');

		// Download VS Code, unzip it and run the integration test
		await runTests({ extensionDevelopmentPath, extensionTestsPath });
	} catch (err) {
		console.error('Failed to run tests');
		process.exit(1);
	}
}

main();
