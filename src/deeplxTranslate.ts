/**
 * DeepLX Translate Module
 * 
 * This module provides translation functionality for VSCode comment-translate extension
 * by integrating with the DeepLX API. It supports flexible authentication methods
 * (Bearer token or URL parameter) and simple request/response handling.
 * 
 * @module deeplxTranslate
 */

import axios from 'axios';
import { workspace } from 'vscode';
import { ITranslate, ITranslateOptions } from 'comment-translate-manager';

/** Configuration namespace for DeepLX translate settings */
const PREFIXCONFIG = 'deeplxTranslate';

/** Configuration namespace for general comment-translate settings */
const PREFIXCONFIGa = 'commentTranslate';


/**
 * Retrieves configuration value from DeepLX translate settings
 * 
 * @template T - The type of configuration value to retrieve
 * @param {string} key - The configuration key name
 * @returns {T | undefined} The configuration value, or undefined if not found
 * 
 * @example
 * const apiUrl = getConfig<string>('authKey');
 * const maxLen = getConfig<number>('maxTranslationLength');
 */
export function getConfig<T>(key): T | undefined {
    const configuration = workspace.getConfiguration(PREFIXCONFIG);
    return configuration.get<T>(key);
}

/**
 * Retrieves configuration value from general comment-translate settings
 * 
 * @template T - The type of configuration value to retrieve
 * @param {string} key - The configuration key name
 * @returns {T | undefined} The configuration value, or undefined if not found
 * 
 * @example
 * const maxLen = getConfigaa<number>('maxTranslationLength');
 */
export function getConfigaa<T>(key): T | undefined {
    const configuration = workspace.getConfiguration(PREFIXCONFIGa);
    return configuration.get<T>(key);
}

/**
 * Configuration options for DeepLX translate service
 * 
 * @interface DeepLXTranslateOption
 */
interface DeepLXTranslateOption {
    /** Optional API endpoint URL override */
    apiUrl?: string;
    
    /** Optional authentication token for API requests */
    authToken?: string;
    
    /** Whether to use token as URL parameter instead of Authorization header */
    useUrlToken?: boolean;
}

/**
 * DeepLX Translate Service Implementation
 * 
 * Implements the ITranslate interface for the comment-translate extension.
 * Provides translation capabilities through the DeepLX API with support for:
 * - Bearer token authentication via Authorization header
 * - Token-based authentication via URL parameters
 * - Configurable source and target languages
 * - Dynamic configuration updates
 * 
 * @class DeepLXTranslate
 * @implements {ITranslate}
 */
export class DeepLXTranslate implements ITranslate {

    /**
     * Gets the maximum allowed length for text to translate
     * 
     * @returns {number} Maximum translation length (default: 6000 characters)
     */
    get maxLen(): number {
        const a = getConfigaa<number>('maxTranslationLength') || 6000;
        return a;
    }

    /** Default translation options */
    private _defaultOption: DeepLXTranslateOption;
    
    /** API endpoint URL for translation requests */
    private readonly _translateApiUrl: string;
    
    /** Authentication token for API requests */
    private readonly _authToken: string;
    
    /** Flag to determine authentication method (URL parameter vs header) */
    private readonly _useUrlToken: boolean;

    /**
     * Initializes the DeepLX translate service
     * 
     * Loads configuration from VSCode settings and sets up watchers for
     * configuration changes. Default values are used if not configured:
     * - API URL: http://127.0.0.1:1188/translate
     * - Authentication: empty (optional)
     * - Auth method: header (useUrlToken = false)
     */
    constructor() {
        const apiUrl = getConfig<string>('authKey') || 'http://127.0.0.1:1188/translate';
        const authToken = getConfig<string>('token') || '';
        const useUrlToken = getConfig<boolean>('useUrlToken') || false;

        this._translateApiUrl = apiUrl;
        this._authToken = authToken;
        this._useUrlToken = useUrlToken;

        this._defaultOption = this.createOption();
        
        // Watch for configuration changes and update options accordingly
        workspace.onDidChangeConfiguration(async eventNames => {
            if (eventNames.affectsConfiguration(PREFIXCONFIG)) {
                this._defaultOption = this.createOption();
            }
        });
    }

    /**
     * Creates a DeepLX translate option object with current settings
     * 
     * @returns {DeepLXTranslateOption} Configured translate options
     */
    createOption() {
        const defaultOption: DeepLXTranslateOption = {
            authToken: this._authToken,
            useUrlToken: this._useUrlToken
        };
        return defaultOption;
    }

    /**
     * Translates text content using the DeepLX API
     * 
     * Makes a POST request to the DeepLX API with the specified source and target languages.
     * Supports two authentication methods:
     * 1. Bearer token in Authorization header (default)
     * 2. Token as URL query parameter (if useUrlToken is true)
     * 
     * API Request Format:
     * ```json
     * {
     *   "text": "content to translate",
     *   "source_lang": "EN",
     *   "target_lang": "ZH"
     * }
     * ```
     * 
     * Expected Response Format:
     * ```json
     * {
     *   "code": 200,
     *   "data": "translated text",
     *   "alternatives": ["alternative 1", "alternative 2"],
     *   "source_lang": "EN",
     *   "target_lang": "ZH",
     *   "method": "Free"
     * }
     * ```
     * 
     * @async
     * @param {string} content - The text content to translate
     * @returns {Promise<string>} The translated text
     * @throws {Error} If translation request fails or API returns error code
     * 
     * @example
     * try {
     *   const translated = await translator.translate("Hello, World!");
     *   console.log(translated); // "你好，世界！"
     * } catch (error) {
     *   console.error("Translation failed:", error.message);
     * }
     */
    async translate(content: string): Promise<string> {
        const source = getConfig<string>('source') || 'EN';
        const target = getConfig<string>('target') || 'ZH';

        const requestPayload = {
            text: content,
            source_lang: source,
            target_lang: target
        };

        try {
            let url = this._translateApiUrl;
            const headers: Record<string, string> = {
                "Content-Type": "application/json"
            };

            // Add authorization either via URL parameter or Authorization header
            if (this._useUrlToken) {
                // Use URL parameter authentication: /translate?token=...
                url += (url.includes('?') ? '&' : '?') + `token=${encodeURIComponent(this._authToken)}`;
            } else if (this._authToken) {
                // Use Bearer token in Authorization header
                headers["Authorization"] = `Bearer ${this._authToken}`;
            }

            const response = await axios.post(url, requestPayload, {
                headers
            });

            // Verify both HTTP status and API response code
            if (response.status === 200 && response.data.code === 200) {
                const { data } = response.data;
                return data;
            } else {
                throw new Error(`翻译失败: ${response.data.code || response.status}`);
            }
        } catch (error) {
            throw new Error(`翻译失败: ${error.message}`);
        }
    }

    /**
     * Generates a translation link (not implemented for DeepLX)
     * 
     * @param {string} content - The text content
     * @param {ITranslateOptions} options - Translation options
     * @returns {string} Empty string (not supported by this implementation)
     */
    link(content: string, { to = 'auto' }: ITranslateOptions) {
        return '';
    }

    /**
     * Checks if a language is supported for translation
     * 
     * @param {string} src - Language code to check
     * @returns {boolean} Always returns true (all languages are supported)
     */
    isSupported(src: string) {
        return true;
    }
}






