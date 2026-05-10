/**
 * VSCode DeepLX Comment Translate Extension
 * 
 * This is the main entry point for the DeepLX translation extension.
 * It integrates with the comment-translate extension by registering the DeepLXTranslate
 * service as a translation provider.
 * 
 * The extension allows users to translate code comments using DeepLX API.
 * 
 * @module extension
 */

import { ITranslateRegistry } from 'comment-translate-manager';
import * as vscode from 'vscode';
import { DeepLXTranslate } from './deeplxTranslate';

/**
 * Activates the extension when VSCode loads it
 * 
 * Called when the extension is activated (on VSCode startup if auto-load,
 * or when a trigger event occurs). This function registers the DeepLX translation
 * service with the comment-translate extension registry.
 * 
 * @param {vscode.ExtensionContext} context - The extension context provided by VSCode
 * @returns {object} An object with the extendTranslate function for registering translation services
 * 
 * @example
 * // The returned object structure:
 * {
 *   extendTranslate: function(registry) {
 *     registry('deeplx', DeepLXTranslate);
 *   }
 * }
 */
export function activate(context: vscode.ExtensionContext) {
    // Return extension API to register with comment-translate extension
    return {
        /**
         * Registers the DeepLX translation service
         * 
         * @param {ITranslateRegistry} registry - The registry to register translation providers
         */
        extendTranslate: function (registry: ITranslateRegistry) {
            // Register 'deeplx' as the translation provider using DeepLXTranslate class
            registry('deeplx', DeepLXTranslate);
        }
    };
}

/**
 * Deactivates the extension when VSCode unloads it
 * 
 * Called when the extension is deactivated (on VSCode shutdown or extension disable).
 * Currently, no cleanup is required as the DeepLX service handles its own cleanup.
 * 
 * @function deactivate
 */
export function deactivate() {
    // No cleanup required for this extension
}
