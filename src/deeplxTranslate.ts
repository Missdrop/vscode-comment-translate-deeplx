import axios from 'axios';
import { workspace } from 'vscode';
import { ITranslate, ITranslateOptions } from 'comment-translate-manager';

const PREFIXCONFIG = 'deeplxTranslate';
const PREFIXCONFIGa = 'commentTranslate';


export function getConfig<T>(key): T | undefined {
    const configuration = workspace.getConfiguration(PREFIXCONFIG);
    return configuration.get<T>(key);
}

export function getConfigaa<T>(key): T | undefined {
    const configuration = workspace.getConfiguration(PREFIXCONFIGa);
    return configuration.get<T>(key);
}

interface DeepLXTranslateOption {
    apiUrl?: string;
    authToken?: string;
    useUrlToken?: boolean;
}

export class DeepLXTranslate implements ITranslate {

    get maxLen(): number {
        const a = getConfigaa<number>('maxTranslationLength') || 6000;
        return a;
    }

    private _defaultOption: DeepLXTranslateOption;
    private readonly _translateApiUrl: string;
    private readonly _authToken: string;
    private readonly _useUrlToken: boolean;

    constructor() {
        const apiUrl = getConfig<string>('authKey') || 'http://127.0.0.1:1188/translate';
        const authToken = getConfig<string>('token') || '';
        const useUrlToken = getConfig<boolean>('useUrlToken') || false;

        this._translateApiUrl = apiUrl;
        this._authToken = authToken;
        this._useUrlToken = useUrlToken;

        this._defaultOption = this.createOption();
        workspace.onDidChangeConfiguration(async eventNames => {
            if (eventNames.affectsConfiguration(PREFIXCONFIG)) {
                this._defaultOption = this.createOption();
            }
        });
    }

    createOption() {
        const defaultOption: DeepLXTranslateOption = {
            authToken: this._authToken,
            useUrlToken: this._useUrlToken
        };
        return defaultOption;
    }

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

            // Add authorization either via header or URL parameter
            if (this._useUrlToken) {
                url += (url.includes('?') ? '&' : '?') + `token=${encodeURIComponent(this._authToken)}`;
            } else if (this._authToken) {
                headers["Authorization"] = `Bearer ${this._authToken}`;
            }

            const response = await axios.post(url, requestPayload, {
                headers
            });

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

    link(content: string, { to = 'auto' }: ITranslateOptions) {
        return '';
    }

    isSupported(src: string) {
        return true;
    }
}






