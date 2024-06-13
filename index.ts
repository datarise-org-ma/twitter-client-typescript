
import axios, { AxiosInstance, AxiosResponse, AxiosRequestHeaders, AxiosResponseHeaders } from 'axios';
import { performance } from 'perf_hooks';

const HOST = "twitter-x.p.rapidapi.com";
const BASE = `https://${HOST}/`;
const API = "https://rapidapi.com/datarise-datarise-default/api/twitter-x";


enum LogLevel {
    DEBUG = "DEBUG",
    INFO = "INFO",
    WARN = "WARN",
    ERROR = "ERROR",
}

class Console {
    private logLevel: string;

    constructor(logLevel: string) {
        this.logLevel = logLevel;
    }

    debug(message: string, data?: any): void {
        if (this.logLevel === LogLevel.DEBUG) {
            console.debug(message, data);
        }
    }

    info(message: string, data?: any): void {
        if (this.logLevel === LogLevel.DEBUG || this.logLevel === LogLevel.INFO) {
            console.info(message, data);
        }
    }

    warn(message: string, data?: any): void {
        if (this.logLevel === LogLevel.DEBUG || this.logLevel === LogLevel.INFO || this.logLevel === LogLevel.WARN) {
            console.warn(message, data);
        }
    }

    error(message: string, data?: any): void {
        if (this.logLevel === LogLevel.DEBUG || this.logLevel === LogLevel.INFO || this.logLevel === LogLevel.WARN || this.logLevel === LogLevel.ERROR) {
            console.error(message, data);
        }
    }

    setLogLevel(logLevel: string): void {
        this.logLevel = logLevel;
    }
}


let LOGGER: Console = new Console(LogLevel.INFO);

export class RateLimit {
    limit: number;
    remaining: number;
    reset: number;

    constructor(limit: number, remaining: number, reset: number) {
        this.limit = limit;
        this.remaining = remaining;
        this.reset = reset;
    }

    static fromHeaders(headers: AxiosResponseHeaders): RateLimit {
        const limit = parseInt(headers["x-ratelimit-rapid-free-plans-hard-limit-limit"] || "0");
        const remaining = parseInt(headers["x-ratelimit-rapid-free-plans-hard-limit-remaining"] || "0");
        const reset = parseInt(headers["x-ratelimit-rapid-free-plans-hard-limit-reset"] || "0");

        if (isNaN(limit) || isNaN(remaining) || isNaN(reset)) {
            LOGGER.error('Invalid headers provided');
            return new RateLimit(0, 0, 0);
        }

        const c = new RateLimit(limit, remaining, reset);

        if (LOGGER && typeof LOGGER.debug === 'function') {
            LOGGER.debug(`Rate limit: ${c}`, { "limit": c.remaining });
        }

        return c;
    }
}

export interface ClientConfig {
    apiKey?: string;
    logLevel?: string;
    timeout?: number;
}

export interface IAsyncTwitterClient {
    getTimeout(): number;
    setTimeout(timeout: number): void;
    getRateLimit(): RateLimit;
    search(query: string, section: string, limit: number, cursor: string | null, config: ClientConfig | null): Promise<AxiosResponse>;
    tweetDetails(tweet_id: string, cursor: string | null, config: ClientConfig | null): Promise<AxiosResponse>;
    tweetRetweeters(tweet_id: string, limit: number, cursor: string | null, config: ClientConfig | null): Promise<AxiosResponse>;
    tweetFavoriters(tweet_id: string, limit: number, cursor: string | null, config: ClientConfig | null): Promise<AxiosResponse>;
    userDetails(username: string | null, user_id: string | null, cursor: string | null, config: ClientConfig | null): Promise<AxiosResponse>;
    userTweets(username: string | null, user_id: string | null, limit: number, cursor: string | null, config: ClientConfig | null): Promise<AxiosResponse>;
    userTweetsAndReplies(username: string | null, user_id: string | null, limit: number, cursor: string | null, config: ClientConfig | null): Promise<AxiosResponse>;
    userFollowers(username: string | null, user_id: string | null, limit: number, cursor: string | null, config: ClientConfig | null): Promise<AxiosResponse>;
    userFollowing(username: string | null, user_id: string | null, limit: number, cursor: string | null, config: ClientConfig | null): Promise<AxiosResponse>;
    userMedia(username: string | null, user_id: string | null, limit: number, cursor: string | null, config: ClientConfig | null): Promise<AxiosResponse>;
    listDetails(list_id: string, config: ClientConfig | null): Promise<AxiosResponse>;
    listTweets(list_id: string, limit: number, cursor: string | null, config: ClientConfig | null): Promise<AxiosResponse>;
    trendsLocations(config: ClientConfig | null): Promise<AxiosResponse>;
    trends(woeid: string): Promise<AxiosResponse>;
    communityDetails(community_id: string, config: ClientConfig | null): Promise<AxiosResponse>;
    communityTweets(community_id: string, limit: number, cursor: string | null, config: ClientConfig | null): Promise<AxiosResponse>;
    communityMembers(community_id: string, limit: number, cursor: string | null, config: ClientConfig | null): Promise<AxiosResponse>;
}


export class AsyncTwitterClient implements IAsyncTwitterClient {
    private baseUrl: string;
    private apiKey: string;
    private headers: AxiosRequestHeaders;
    private session: AxiosInstance;
    private rateLimit: RateLimit;
    private timeout: number;
    private logLevel: string;

    // Instantiates a new AsyncTwitterClient
    // const client = new AsyncTwitterClient({ apiKey: "YOUR_API_KEY});d
    constructor(config: ClientConfig) {
        if (config.apiKey === undefined || config.apiKey === null || config.apiKey === "") {
            throw new Error("API Key is required.");
        }
        this.baseUrl = BASE;
        this.apiKey = config.apiKey;
        this.headers = this.__headers();
        this.rateLimit = new RateLimit(0, 0, 0);
        this.timeout = config.timeout || 10000;
        this.session = axios.create({ timeout: this.timeout, headers: this.headers });
        this.logLevel = config.logLevel || LogLevel.INFO;
        this.logLevel.toUpperCase()
        LOGGER = new Console(this.logLevel);
    }

    private __userAgent(): string {
        const packageConfig = require('./package.json');
        const version = packageConfig.version;
        const packageName = packageConfig.name;
        // Get session user agent
        const defaultSessionUserAgent = this.session.defaults.headers['User-Agent'];
        // Set user agent
        return `${defaultSessionUserAgent} ${packageName}/${version}`;
    }

    private __headers(): AxiosRequestHeaders {
        let headers: { [header: string]: string } = {
            "x-rapidapi-key": this.apiKey,
            "x-rapidapi-host": HOST,
            "Content-Type": HOST,
            "User-Agent": this.__userAgent(),
        };
        return headers as AxiosRequestHeaders;
    }

    private updateConfig(config: ClientConfig | null = null): ClientConfig {
        if (!config) {
            return {
                apiKey: this.apiKey,
                logLevel: this.logLevel,
                timeout: this.timeout
            };
        }
        var newConfig: ClientConfig = {
            apiKey: this.apiKey,
            logLevel: config.logLevel?.toUpperCase() || this.logLevel,
            timeout: config.timeout || this.timeout
        };
        return newConfig;
    }

    getTimeout(): number {
        return this.timeout;
    }

    setTimeout(timeout: number): void {
        this.timeout = timeout;
        this.session.defaults.timeout = this.timeout;
    }

    getRateLimit(): RateLimit {
        return this.rateLimit;
    }

    async search(query: string, section: string = "top", limit: number = 20, cursor: string | null = null, config: ClientConfig | null = null): Promise<AxiosResponse> {
        const url = `${this.baseUrl}search/`;
        LOGGER.info(`[Search] Query: ${query} - Section: ${section} - Limit: ${limit}`, { "limit": this.rateLimit });
        const params: { query: string; section: string; limit: number; cursor?: string } = {
            "query": query,
            "section": section,
            "limit": limit,
        };
        if (cursor) {
            params["cursor"] = cursor;
        }
        const start = performance.now();
        try {
            const c = this.updateConfig(config);
            const response = await this.session.get(url, { params: params, timeout: c.timeout });
            if (response.status === 200) {
                this.rateLimit = RateLimit.fromHeaders(response.headers as AxiosResponseHeaders);
            }
            LOGGER.debug(`[Search] Response: ${response.status}, elapsed time: ${(performance.now() - start).toFixed(2)}s - Limit: ${this.rateLimit.remaining}`);
            return response;
        } catch (error) {
            LOGGER.error(`[Search] Request failed: ${error}`);
            throw error;
        }
    }

    async tweetDetails(tweet_id: string, cursor: string | null = null, config: ClientConfig | null = null): Promise<AxiosResponse> {
        const url = `${this.baseUrl}tweet/`;
        LOGGER.info(`[Tweet Details] Tweet ID: ${tweet_id}`, { "limit": this.rateLimit });
        const params: { tweet_id: string; cursor?: string } = {
            "tweet_id": tweet_id,
        };
        if (cursor) {
            params["cursor"] = cursor;
        }
        const start = performance.now();
        try {
            const c = this.updateConfig(config);
            const response = await this.session.get(url, { params: params, timeout: c.timeout });
            if (response.status === 200) {
                this.rateLimit = RateLimit.fromHeaders(response.headers as AxiosResponseHeaders);
            }
            LOGGER.debug(`[Tweet Details] Response: ${response.status}, elapsed time: ${(performance.now() - start).toFixed(2)}s - Limit: ${this.rateLimit.remaining}`);
            return response;

        } catch (error) {
            LOGGER.error(`[Search] Request failed: ${error}`);
            throw error;
        }
    }

    async tweetRetweeters(tweet_id: string, limit: number = 20, cursor: string | null = null, config: ClientConfig | null = null): Promise<AxiosResponse> {
        const url = `${this.baseUrl}tweet/retweeters/`;
        LOGGER.info(`[Tweet Retweeters] Tweet ID: ${tweet_id} - Limit: ${limit}`, { "limit": this.rateLimit });
        const params: { tweet_id: string; limit: number; cursor?: string } = {
            "tweet_id": tweet_id,
            "limit": limit,
        };
        if (cursor) {
            params["cursor"] = cursor;
        }
        const start = performance.now();
        try {
            const c = this.updateConfig(config);
            const response = await this.session.get(url, { params: params, timeout: c.timeout });
            if (response.status === 200) {
                this.rateLimit = RateLimit.fromHeaders(response.headers as AxiosResponseHeaders);
            }
            LOGGER.debug(`[Tweet Retweeters] Response: ${response.status}, elapsed time: ${(performance.now() - start).toFixed(2)}s - Limit: ${this.rateLimit.remaining}`);
            return response;
        } catch (error) {
            LOGGER.error(`[Search] Request failed: ${error}`);
            throw error;
        }
    }

    async tweetFavoriters(tweet_id: string, limit: number = 20, cursor: string | null = null, config: ClientConfig | null = null): Promise<AxiosResponse> {
        const url = `${this.baseUrl}tweet/favoriters/`;
        LOGGER.info(`[Tweet Favoriters] Tweet ID: ${tweet_id} - Limit: ${limit}`, { "limit": this.rateLimit });
        const params: { tweet_id: string; limit: number; cursor?: string } = {
            "tweet_id": tweet_id,
            "limit": limit,
        };
        if (cursor) {
            params["cursor"] = cursor;
        }
        const start = performance.now();
        try {
            const c = this.updateConfig(config);
            const response = await this.session.get(url, { params: params, timeout: c.timeout });
            if (response.status === 200) {
                this.rateLimit = RateLimit.fromHeaders(response.headers as AxiosResponseHeaders);
            }
            LOGGER.debug(`[Tweet Favoriters] Response: ${response.status}, elapsed time: ${(performance.now() - start).toFixed(2)}s - Limit: ${this.rateLimit.remaining}`);
            return response;
        } catch (error) {
            LOGGER.error(`[Search] Request failed: ${error}`);
            throw error;
        }
    }

    async userDetails(username: string | null = null, user_id: string | null = null, cursor: string | null = null, config: ClientConfig | null = null): Promise<AxiosResponse> {
        if (!username && !user_id) {
            throw new Error("Either username or user_id must be provided.");
        }
        const url = `${this.baseUrl}user/details`;
        const params: { username?: string; user_id?: string; cursor?: string } = {};
        if (username) {
            LOGGER.info(`[User Details] Username: ${username}`, { "limit": this.rateLimit });
            params["username"] = username;
        }
        if (user_id) {
            LOGGER.info(`[User Details] User ID: ${user_id}`, { "limit": this.rateLimit });
            params["user_id"] = user_id;
        }
        if (cursor) {
            params["cursor"] = cursor;
        }
        const start = performance.now();
        try {
            const c = this.updateConfig(config);
            const response = await this.session.get(url, { params: params, timeout: c.timeout });
            if (response.status === 200) {
                this.rateLimit = RateLimit.fromHeaders(response.headers as AxiosResponseHeaders);
            }
            LOGGER.debug(`[User Details] Response: ${response.status}, elapsed time: ${(performance.now() - start).toFixed(2)}s - Limit: ${this.rateLimit.remaining}`);
            return response;
        } catch (error) {
            LOGGER.error(`[Search] Request failed: ${error}`);
            throw error;
        }
    }

    async userTweets(username: string | null = null, user_id: string | null = null, limit: number = 20, cursor: string | null = null, config: ClientConfig | null = null): Promise<AxiosResponse> {
        if (!username && !user_id) {
            throw new Error("Either username or user_id must be provided.");
        }
        const url = `${this.baseUrl}user/tweets`;
        const params: { username?: string; user_id?: string; limit: number; cursor?: string } = { "limit": limit };
        if (username) {
            LOGGER.info(`[User Tweets] Username: ${username} - Limit: ${limit}`, { "limit": this.rateLimit });
            params["username"] = username;
        }
        if (user_id) {
            LOGGER.info(`[User Tweets] User ID: ${user_id} - Limit: ${limit}`, { "limit": this.rateLimit });
            params["user_id"] = user_id;
        }
        if (cursor) {
            params["cursor"] = cursor;
        }
        const start = performance.now();
        try {
            const c = this.updateConfig(config);
            const response = await this.session.get(url, { params: params, timeout: c.timeout });
            if (response.status === 200) {
                this.rateLimit = RateLimit.fromHeaders(response.headers as AxiosResponseHeaders);
            }
            LOGGER.debug(`[User Tweets] Response: ${response.status}, elapsed time: ${(performance.now() - start).toFixed(2)}s - Limit: ${this.rateLimit.remaining}`);
            return response;
        } catch (error) {
            LOGGER.error(`[Search] Request failed: ${error}`);
            throw error;
        }
    }

    async userTweetsAndReplies(username: string | null = null, user_id: string | null = null, limit: number = 20, cursor: string | null = null, config: ClientConfig | null = null): Promise<AxiosResponse> {
        if (!username && !user_id) {
            throw new Error("Either username or user_id must be provided.");
        }
        const url = `${this.baseUrl}user/tweetsandreplies`;
        const params: { username?: string; user_id?: string; limit: number; cursor?: string } = { "limit": limit };
        if (username) {
            LOGGER.info(`[User Tweets and Replies] Username: ${username} - Limit: ${limit}`, { "limit": this.rateLimit });
            params["username"] = username;
        }
        if (user_id) {
            LOGGER.info(`[User Tweets and Replies] User ID: ${user_id} - Limit: ${limit}`, { "limit": this.rateLimit });
            params["user_id"] = user_id;
        }
        if (cursor) {
            params["cursor"] = cursor;
        }
        const start = performance.now();
        try {
            const c = this.updateConfig(config);
            const response = await this.session.get(url, { params: params, timeout: c.timeout });
            if (response.status === 200) {
                this.rateLimit = RateLimit.fromHeaders(response.headers as AxiosResponseHeaders);
            }
            LOGGER.debug(`[User Tweets and Replies] Response: ${response.status}, elapsed time: ${(performance.now() - start).toFixed(2)}s - Limit: ${this.rateLimit.remaining}`);
            return response;
        } catch (error) {
            LOGGER.error(`[Search] Request failed: ${error}`);
            throw error;
        }
    }

    async userFollowers(username: string | null = null, user_id: string | null = null, limit: number = 20, cursor: string | null = null, config: ClientConfig | null = null): Promise<AxiosResponse> {
        if (!username && !user_id) {
            throw new Error("Either username or user_id must be provided.");
        }
        const url = `${this.baseUrl}user/followers`;
        const params: { username?: string; user_id?: string; limit: number; cursor?: string } = { "limit": limit };
        if (username) {
            LOGGER.info(`[User Followers] Username: ${username} - Limit: ${limit}`, { "limit": this.rateLimit });
            params["username"] = username;
        }
        if (user_id) {
            LOGGER.info(`[User Followers] User ID: ${user_id} - Limit: ${limit}`, { "limit": this.rateLimit });
            params["user_id"] = user_id;
        }
        if (cursor) {
            params["cursor"] = cursor;
        }
        const start = performance.now();
        try {
            const c = this.updateConfig(config);
            const response = await this.session.get(url, { params: params, timeout: c.timeout });
            if (response.status === 200) {
                this.rateLimit = RateLimit.fromHeaders(response.headers as AxiosResponseHeaders);
            }
            LOGGER.debug(`[User Followers] Response: ${response.status}, elapsed time: ${(performance.now() - start).toFixed(2)}s - Limit: ${this.rateLimit.remaining}`);
            return response;
        } catch (error) {
            LOGGER.error(`[Search] Request failed: ${error}`);
            throw error;
        }
    }

    async userFollowing(username: string | null = null, user_id: string | null = null, limit: number = 20, cursor: string | null = null, config: ClientConfig | null = null): Promise<AxiosResponse> {
        if (!username && !user_id) {
            throw new Error("Either username or user_id must be provided.");
        }
        const url = `${this.baseUrl}user/following`;
        const params: { username?: string; user_id?: string; limit: number; cursor?: string } = { "limit": limit };
        if (username) {
            LOGGER.info(`[User Following] Username: ${username} - Limit: ${limit}`, { "limit": this.rateLimit });
            params["username"] = username;
        }
        if (user_id) {
            LOGGER.info(`[User Following] User ID: ${user_id} - Limit: ${limit}`, { "limit": this.rateLimit });
            params["user_id"] = user_id;
        }
        if (cursor) {
            params["cursor"] = cursor;
        }
        const start = performance.now();
        try {
            const c = this.updateConfig(config);
            const response = await this.session.get(url, { params: params, timeout: c.timeout });
            if (response.status === 200) {
                this.rateLimit = RateLimit.fromHeaders(response.headers as AxiosResponseHeaders);
            }
            LOGGER.debug(`[User Following] Response: ${response.status}, elapsed time: ${(performance.now() - start).toFixed(2)}s - Limit: ${this.rateLimit.remaining}`);
            return response;
        } catch (error) {
            LOGGER.error(`[Search] Request failed: ${error}`);
            throw error;
        }
    }

    async userMedia(username: string | null = null, user_id: string | null = null, limit: number = 20, cursor: string | null = null, config: ClientConfig | null = null): Promise<AxiosResponse> {
        if (!username && !user_id) {
            throw new Error("Either username or user_id must be provided.");
        }
        const url = `${this.baseUrl}user/media`;
        const params: { username?: string; user_id?: string; limit: number; cursor?: string } = { "limit": limit };
        if (username) {
            LOGGER.info(`[User Media] Username: ${username} - Limit: ${limit}`, { "limit": this.rateLimit });
            params["username"] = username;
        }
        if (user_id) {
            LOGGER.info(`[User Media] User ID: ${user_id} - Limit: ${limit}`, { "limit": this.rateLimit });
            params["user_id"] = user_id;
        }
        if (cursor) {
            params["cursor"] = cursor;
        }
        const start = performance.now();
        try {
            const c = this.updateConfig(config);
            const response = await this.session.get(url, { params: params, timeout: c.timeout });
            if (response.status === 200) {
                this.rateLimit = RateLimit.fromHeaders(response.headers as AxiosResponseHeaders);
            }
            LOGGER.debug(`[User Media] Response: ${response.status}, elapsed time: ${(performance.now() - start).toFixed(2)}s - Limit: ${this.rateLimit.remaining}`);
            return response;
        } catch (error) {
            LOGGER.error(`[Search] Request failed: ${error}`);
            throw error;
        }
    }

    async listDetails(list_id: string, config: ClientConfig | null = null): Promise<AxiosResponse> {
        const url = `${this.baseUrl}list/details`;
        LOGGER.info(`[List Details] List ID: ${list_id}`, { "limit": this.rateLimit });
        const params: { list_id: string } = { "list_id": list_id };
        const start = performance.now();
        try {
            const c = this.updateConfig(config);
            const response = await this.session.get(url, { params: params, timeout: c.timeout });
            if (response.status === 200) {
                this.rateLimit = RateLimit.fromHeaders(response.headers as AxiosResponseHeaders);
            }
            LOGGER.debug(`[List Details] Response: ${response.status}, elapsed time: ${(performance.now() - start).toFixed(2)}s - Limit: ${this.rateLimit.remaining}`);
            return response;
        } catch (error) {
            LOGGER.error(`[Search] Request failed: ${error}`);
            throw error;
        }
    }

    async listTweets(list_id: string, limit: number = 20, cursor: string | null = null, config: ClientConfig | null = null): Promise<AxiosResponse> {
        const url = `${this.baseUrl}list/tweets`;
        LOGGER.info(`[List Tweets] List ID: ${list_id} - Limit: ${limit}`, { "limit": this.rateLimit });
        const params: { list_id: string; limit: number; cursor?: string } = { "list_id": list_id, "limit": limit };
        if (cursor) {
            params["cursor"] = cursor;
        }
        const start = performance.now();
        try {
            const c = this.updateConfig(config);
            const response = await this.session.get(url, { params: params, timeout: c.timeout });
            if (response.status === 200) {
                this.rateLimit = RateLimit.fromHeaders(response.headers as AxiosResponseHeaders);
            }
            LOGGER.debug(`[List Tweets] Response: ${response.status}, elapsed time: ${(performance.now() - start).toFixed(2)}s - Limit: ${this.rateLimit.remaining}`);
            return response;
        } catch (error) {
            LOGGER.error(`[Search] Request failed: ${error}`);
            throw error;
        }
    }

    async trendsLocations(config: ClientConfig | null = null): Promise<AxiosResponse> {
        const url = `${this.baseUrl}trends/available`;
        LOGGER.info(`[Trends Locations]`, { "limit": this.rateLimit });
        const start = performance.now();
        try {
            const c = this.updateConfig(config);
            const response = await this.session.get(url, { timeout: c.timeout });
            if (response.status == 200) {
                this.rateLimit = RateLimit.fromHeaders(response.headers as AxiosResponseHeaders);
            }
            LOGGER.debug(`[Trends Locations] Response: ${response.status}, elapsed time: ${(performance.now() - start).toFixed(2)}s - Limit: ${this.rateLimit.remaining}`);
            return response;
        } catch (error) {
            LOGGER.error(`[Search] Request failed: ${error}`);
            throw error;
        }
    }

    async trends(woeid: string, config: ClientConfig | null = null): Promise<AxiosResponse> {
        const url = `${this.baseUrl}trends/place`;
        LOGGER.info(`[Trends] WOEID: ${woeid}`, { "limit": this.rateLimit });
        const params: { id: string } = { "id": woeid };
        const start = performance.now();
        try {
            const c = this.updateConfig(config);
            const response = await this.session.get(url, { params: params, timeout: c.timeout });
            if (response.status === 200) {
                this.rateLimit = RateLimit.fromHeaders(response.headers as AxiosResponseHeaders);
            }
            LOGGER.debug(`[Trends] Response: ${response.status}, elapsed time: ${(performance.now() - start).toFixed(2)}s - Limit: ${this.rateLimit.remaining}`);
            return response;
        } catch (error) {
            LOGGER.error(`[Search] Request failed: ${error}`);
            throw error;
        }
    }

    async communityDetails(community_id: string, config: ClientConfig | null = null): Promise<AxiosResponse> {
        const url = `${this.baseUrl}community/details`;
        LOGGER.info(`[Community Details] Community ID: ${community_id}`, { "limit": this.rateLimit });
        const params: { community_id: string } = { "community_id": community_id };
        const start = performance.now();
        try {
            const c = this.updateConfig(config);
            const response = await this.session.get(url, { params: params, timeout: c.timeout });
            if (response.status === 200) {
                this.rateLimit = RateLimit.fromHeaders(response.headers as AxiosResponseHeaders);
            }
            LOGGER.debug(`[Community Details] Response: ${response.status}, elapsed time: ${(performance.now() - start).toFixed(2)}s - Limit: ${this.rateLimit.remaining}`);
            return response;
        } catch (error) {
            LOGGER.error(`[Search] Request failed: ${error}`);
            throw error;
        }
    }

    async communityTweets(community_id: string, limit: number = 20, cursor: string | null = null, config: ClientConfig | null = null): Promise<AxiosResponse> {
        const url = `${this.baseUrl}community/tweets`;
        LOGGER.info(`[Community Tweets] Community ID: ${community_id} - Limit: ${limit}`, { "limit": this.rateLimit });
        const params: { community_id: string; limit: number; cursor?: string } = { "community_id": community_id, "limit": limit };
        if (cursor) {
            params["cursor"] = cursor;
        }
        const start = performance.now();
        try {
            const c = this.updateConfig(config);
            const response = await this.session.get(url, { params: params, timeout: c.timeout });
            if (response.status === 200) {
                this.rateLimit = RateLimit.fromHeaders(response.headers as AxiosResponseHeaders);
            }
            LOGGER.debug(`[Community Tweets] Response: ${response.status}, elapsed time: ${(performance.now() - start).toFixed(2)}s - Limit: ${this.rateLimit.remaining}`);
            return response;
        } catch (error) {
            LOGGER.error(`[Search] Request failed: ${error}`);
            throw error;
        }
    }

    async communityMembers(community_id: string, limit: number = 20, cursor: string | null = null, config: ClientConfig | null = null): Promise<AxiosResponse> {
        const url = `${this.baseUrl}community/members`;
        LOGGER.info(`[Community Members] Community ID: ${community_id} - Limit: ${limit}`, { "limit": this.rateLimit });
        const params: { community_id: string; limit: number; cursor?: string } = { "community_id": community_id, "limit": limit };
        if (cursor) {
            params["cursor"] = cursor;
        }
        const start = performance.now();
        try {
            const c = this.updateConfig(config);
            const response = await this.session.get(url, { params: params, timeout: c.timeout });
            if (response.status === 200) {
                this.rateLimit = RateLimit.fromHeaders(response.headers as AxiosResponseHeaders);
            }
            LOGGER.debug(`[Community Members] Response: ${response.status}, elapsed time: ${(performance.now() - start).toFixed(2)}s - Limit: ${this.rateLimit.remaining}`);
            return response;
        } catch (error) {
            LOGGER.error(`[Search] Request failed: ${error}`);
            throw error;
        }
    }

}
