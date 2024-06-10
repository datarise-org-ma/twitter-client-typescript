
import axios, { AxiosInstance, AxiosResponse, AxiosRequestHeaders } from 'axios';
import { performance } from 'perf_hooks';

const HOST = "twitter-x.p.rapidapi.com";
const BASE = `https://${HOST}/`;
const API = "https://rapidapi.com/datarise-datarise-default/api/twitter-x";
let LOGGER: Console = console;


export class RateLimit {
    limit: number;
    remaining: number;
    reset: number;

    constructor(limit: number, remaining: number, reset: number) {
        this.limit = limit;
        this.remaining = remaining;
        this.reset = reset;
    }

    static fromHeaders(headers: any): RateLimit {
        const c = new RateLimit(
            parseInt(headers["x-ratelimit-rapid-free-plans-hard-limit-limit"]),
            parseInt(headers["x-ratelimit-rapid-free-plans-hard-limit-remaining"]),
            parseInt(headers["x-ratelimit-rapid-free-plans-hard-limit-reset"])
        );
        LOGGER.debug(`Rate limit: ${c}`, { "limit": c.remaining });
        return c;
    }
}


export class AsyncTwitterClient {
    private base_url: string;
    private api_key: string;
    private headers: AxiosRequestHeaders;
    private session: AxiosInstance;
    private rate_limit: RateLimit;
    private timeout: number;

    constructor(api_key: string, timeout: number = 20000) {
        this.base_url = BASE;
        this.api_key = api_key;
        this.headers = this.__headers();
        this.rate_limit = new RateLimit(0, 0, 0);
        this.timeout = timeout;
        this.session = axios.create({ timeout: this.timeout, headers: this.headers });
    }

    private __headers(): AxiosRequestHeaders {
        return {
            "x-rapidapi-key": `${this.api_key}`,
            "x-rapidapi-host": HOST,
            "Content-Type": HOST,
        };
    }

    get_timeout(): number {
        return this.timeout;
    }

    set_timeout(timeout: number): void {
        this.timeout = timeout;
        this.session = axios.create({ timeout: this.timeout, headers: this.headers });
    }

    get_rate_limit(): RateLimit {
        return this.rate_limit;
    }

    async search(query: string, section: string = "top", limit: number = 20, cursor: string | null = null): Promise<AxiosResponse> {
        const url = `${this.base_url}search/`;
        LOGGER.info(`[Search] Query: ${query} - Section: ${section} - Limit: ${limit}`, { "limit": this.rate_limit });
        const params: { query: string; section: string; limit: number; cursor?: string } = {
            "query": query,
            "section": section,
            "limit": limit,
        };
        if (cursor) {
            params["cursor"] = cursor;
        }
        const start = performance.now();
        const response = await this.session.get(url, { params: params });
        if (response.status === 200) {
            this.rate_limit = RateLimit.fromHeaders(response.headers);
        }
        LOGGER.debug(`[Search] Response: ${response.status}, elapsed time: ${(performance.now() - start).toFixed(2)}s - Limit: ${this.rate_limit.remaining}`);
        return response;
    }

    async tweet_details(tweet_id: string, cursor: string | null = null): Promise<AxiosResponse> {
        const url = `${this.base_url}tweet/`;
        LOGGER.info(`[Tweet Details] Tweet ID: ${tweet_id}`, { "limit": this.rate_limit });
        const params: { tweet_id: string; cursor?: string } = {
            "tweet_id": tweet_id,
        };
        if (cursor) {
            params["cursor"] = cursor;
        }
        const start = performance.now();
        const response = await this.session.get(url, { params: params });
        if (response.status === 200) {
            this.rate_limit = RateLimit.fromHeaders(response.headers);
        }
        LOGGER.debug(`[Tweet Details] Response: ${response.status}, elapsed time: ${(performance.now() - start).toFixed(2)}s - Limit: ${this.rate_limit.remaining}`);
        return response;
    }

    async tweet_retweeters(tweet_id: string, limit: number = 20, cursor: string | null = null): Promise<AxiosResponse> {
        const url = `${this.base_url}tweet/retweeters/`;
        LOGGER.info(`[Tweet Retweeters] Tweet ID: ${tweet_id} - Limit: ${limit}`, { "limit": this.rate_limit });
        const params: { tweet_id: string; limit: number; cursor?: string } = {
            "tweet_id": tweet_id,
            "limit": limit,
        };
        if (cursor) {
            params["cursor"] = cursor;
        }
        const start = performance.now();
        const response = await this.session.get(url, { params: params });
        if (response.status === 200) {
            this.rate_limit = RateLimit.fromHeaders(response.headers);
        }
        LOGGER.debug(`[Tweet Retweeters] Response: ${response.status}, elapsed time: ${(performance.now() - start).toFixed(2)}s - Limit: ${this.rate_limit.remaining}`);
        return response;
    }

    async tweet_favoriters(tweet_id: string, limit: number = 20, cursor: string | null = null): Promise<AxiosResponse> {
        const url = `${this.base_url}tweet/favoriters/`;
        LOGGER.info(`[Tweet Favoriters] Tweet ID: ${tweet_id} - Limit: ${limit}`, { "limit": this.rate_limit });
        const params: { tweet_id: string; limit: number; cursor?: string } = {
            "tweet_id": tweet_id,
            "limit": limit,
        };
        if (cursor) {
            params["cursor"] = cursor;
        }
        const start = performance.now();
        const response = await this.session.get(url, { params: params });
        if (response.status === 200) {
            this.rate_limit = RateLimit.fromHeaders(response.headers);
        }
        LOGGER.debug(`[Tweet Favoriters] Response: ${response.status}, elapsed time: ${(performance.now() - start).toFixed(2)}s - Limit: ${this.rate_limit.remaining}`);
        return response;
    }

    async user_details(username: string | null = null, user_id: string | null = null, cursor: string | null = null): Promise<AxiosResponse> {
        if (!username && !user_id) {
            throw new Error("Either username or user_id must be provided.");
        }
        const url = `${this.base_url}user/details`;
        const params: { username?: string; user_id?: string; cursor?: string } = {};
        if (username) {
            LOGGER.info(`[User Details] Username: ${username}`, { "limit": this.rate_limit });
            params["username"] = username;
        }
        if (user_id) {
            LOGGER.info(`[User Details] User ID: ${user_id}`, { "limit": this.rate_limit });
            params["user_id"] = user_id;
        }
        if (cursor) {
            params["cursor"] = cursor;
        }
        const start = performance.now();
        const response = await this.session.get(url, { params: params });
        if (response.status === 200) {
            this.rate_limit = RateLimit.fromHeaders(response.headers);
        }
        LOGGER.debug(`[User Details] Response: ${response.status}, elapsed time: ${(performance.now() - start).toFixed(2)}s - Limit: ${this.rate_limit.remaining}`);
        return response;
    }

    async user_tweets(username: string | null = null, user_id: string | null = null, limit: number = 20, cursor: string | null = null): Promise<AxiosResponse> {
        if (!username && !user_id) {
            throw new Error("Either username or user_id must be provided.");
        }
        const url = `${this.base_url}user/tweets`;
        const params: { username?: string; user_id?: string; limit: number; cursor?: string } = { "limit": limit };
        if (username) {
            LOGGER.info(`[User Tweets] Username: ${username} - Limit: ${limit}`, { "limit": this.rate_limit });
            params["username"] = username;
        }
        if (user_id) {
            LOGGER.info(`[User Tweets] User ID: ${user_id} - Limit: ${limit}`, { "limit": this.rate_limit });
            params["user_id"] = user_id;
        }
        if (cursor) {
            params["cursor"] = cursor;
        }
        const start = performance.now();
        const response = await this.session.get(url, { params: params });
        if (response.status === 200) {
            this.rate_limit = RateLimit.fromHeaders(response.headers);
        }
        LOGGER.debug(`[User Tweets] Response: ${response.status}, elapsed time: ${(performance.now() - start).toFixed(2)}s - Limit: ${this.rate_limit.remaining}`);
        return response;
    }

    async user_tweets_and_replies(username: string | null = null, user_id: string | null = null, limit: number = 20, cursor: string | null = null): Promise<AxiosResponse> {
        if (!username && !user_id) {
            throw new Error("Either username or user_id must be provided.");
        }
        const url = `${this.base_url}user/tweetsandreplies`;
        const params: { username?: string; user_id?: string; limit: number; cursor?: string } = { "limit": limit };
        if (username) {
            LOGGER.info(`[User Tweets and Replies] Username: ${username} - Limit: ${limit}`, { "limit": this.rate_limit });
            params["username"] = username;
        }
        if (user_id) {
            LOGGER.info(`[User Tweets and Replies] User ID: ${user_id} - Limit: ${limit}`, { "limit": this.rate_limit });
            params["user_id"] = user_id;
        }
        if (cursor) {
            params["cursor"] = cursor;
        }
        const start = performance.now();
        const response = await this.session.get(url, { params: params });
        if (response.status === 200) {
            this.rate_limit = RateLimit.fromHeaders(response.headers);
        }
        LOGGER.debug(`[User Tweets and Replies] Response: ${response.status}, elapsed time: ${(performance.now() - start).toFixed(2)}s - Limit: ${this.rate_limit.remaining}`);
        return response;
    }

    async user_followers(username: string | null = null, user_id: string | null = null, limit: number = 20, cursor: string | null = null): Promise<AxiosResponse> {
        if (!username && !user_id) {
            throw new Error("Either username or user_id must be provided.");
        }
        const url = `${this.base_url}user/followers`;
        const params: { username?: string; user_id?: string; limit: number; cursor?: string } = { "limit": limit };
        if (username) {
            LOGGER.info(`[User Followers] Username: ${username} - Limit: ${limit}`, { "limit": this.rate_limit });
            params["username"] = username;
        }
        if (user_id) {
            LOGGER.info(`[User Followers] User ID: ${user_id} - Limit: ${limit}`, { "limit": this.rate_limit });
            params["user_id"] = user_id;
        }
        if (cursor) {
            params["cursor"] = cursor;
        }
        const start = performance.now();
        const response = await this.session.get(url, { params: params });
        if (response.status === 200) {
            this.rate_limit = RateLimit.fromHeaders(response.headers);
        }
        LOGGER.debug(`[User Followers] Response: ${response.status}, elapsed time: ${(performance.now() - start).toFixed(2)}s - Limit: ${this.rate_limit.remaining}`);
        return response;
    }

    async user_following(username: string | null = null, user_id: string | null = null, limit: number = 20, cursor: string | null = null): Promise<AxiosResponse> {
        if (!username && !user_id) {
            throw new Error("Either username or user_id must be provided.");
        }
        const url = `${this.base_url}user/following`;
        const params: { username?: string; user_id?: string; limit: number; cursor?: string } = { "limit": limit };
        if (username) {
            LOGGER.info(`[User Following] Username: ${username} - Limit: ${limit}`, { "limit": this.rate_limit });
            params["username"] = username;
        }
        if (user_id) {
            LOGGER.info(`[User Following] User ID: ${user_id} - Limit: ${limit}`, { "limit": this.rate_limit });
            params["user_id"] = user_id;
        }
        if (cursor) {
            params["cursor"] = cursor;
        }
        const start = performance.now();
        const response = await this.session.get(url, { params: params });
        if (response.status === 200) {
            this.rate_limit = RateLimit.fromHeaders(response.headers);
        }
        LOGGER.debug(`[User Following] Response: ${response.status}, elapsed time: ${(performance.now() - start).toFixed(2)}s - Limit: ${this.rate_limit.remaining}`);
        return response;
    }

    async user_likes(username: string | null = null, user_id: string | null = null, limit: number = 20, cursor: string | null = null): Promise<AxiosResponse> {
        if (!username && !user_id) {
            throw new Error("Either username or user_id must be provided.");
        }
        const url = `${this.base_url}user/likes`;
        const params: { username?: string; user_id?: string; limit: number; cursor?: string } = { "limit": limit };
        if (username) {
            LOGGER.info(`[User Likes] Username: ${username} - Limit: ${limit}`, { "limit": this.rate_limit });
            params["username"] = username;
        }
        if (user_id) {
            LOGGER.info(`[User Likes] User ID: ${user_id} - Limit: ${limit}`, { "limit": this.rate_limit });
            params["user_id"] = user_id;
        }
        if (cursor) {
            params["cursor"] = cursor;
        }
        const start = performance.now();
        const response = await this.session.get(url, { params: params });
        if (response.status === 200) {
            this.rate_limit = RateLimit.fromHeaders(response.headers);
        }
        LOGGER.debug(`[User Likes] Response: ${response.status}, elapsed time: ${(performance.now() - start).toFixed(2)}s - Limit: ${this.rate_limit.remaining}`);
        return response;
    }

    async user_media(username: string | null = null, user_id: string | null = null, limit: number = 20, cursor: string | null = null): Promise<AxiosResponse> {
        if (!username && !user_id) {
            throw new Error("Either username or user_id must be provided.");
        }
        const url = `${this.base_url}user/media`;
        const params: { username?: string; user_id?: string; limit: number; cursor?: string } = { "limit": limit };
        if (username) {
            LOGGER.info(`[User Media] Username: ${username} - Limit: ${limit}`, { "limit": this.rate_limit });
            params["username"] = username;
        }
        if (user_id) {
            LOGGER.info(`[User Media] User ID: ${user_id} - Limit: ${limit}`, { "limit": this.rate_limit });
            params["user_id"] = user_id;
        }
        if (cursor) {
            params["cursor"] = cursor;
        }
        const start = performance.now();
        const response = await this.session.get(url, { params: params });
        if (response.status === 200) {
            this.rate_limit = RateLimit.fromHeaders(response.headers);
        }
        LOGGER.debug(`[User Media] Response: ${response.status}, elapsed time: ${(performance.now() - start).toFixed(2)}s - Limit: ${this.rate_limit.remaining}`);
        return response;
    }

    async list_details(list_id: string): Promise<AxiosResponse> {
        const url = `${this.base_url}list/details`;
        LOGGER.info(`[List Details] List ID: ${list_id}`, { "limit": this.rate_limit });
        const params: { list_id: string } = { "list_id": list_id };
        const start = performance.now();
        const response = await this.session.get(url, { params: params });
        if (response.status === 200) {
            this.rate_limit = RateLimit.fromHeaders(response.headers);
        }
        LOGGER.debug(`[List Details] Response: ${response.status}, elapsed time: ${(performance.now() - start).toFixed(2)}s - Limit: ${this.rate_limit.remaining}`);
        return response;
    }

    async list_tweets(list_id: string, limit: number = 20, cursor: string | null = null): Promise<AxiosResponse> {
        const url = `${this.base_url}list/tweets`;
        LOGGER.info(`[List Tweets] List ID: ${list_id} - Limit: ${limit}`, { "limit": this.rate_limit });
        const params: { list_id: string; limit: number; cursor?: string } = { "list_id": list_id, "limit": limit };
        if (cursor) {
            params["cursor"] = cursor;
        }
        const start = performance.now();
        const response = await this.session.get(url, { params: params });
        if (response.status === 200) {
            this.rate_limit = RateLimit.fromHeaders(response.headers);
        }
        LOGGER.debug(`[List Tweets] Response: ${response.status}, elapsed time: ${(performance.now() - start).toFixed(2)}s - Limit: ${this.rate_limit.remaining}`);
        return response;
    }

    async trends_locations(): Promise<AxiosResponse> {
        const url = `${this.base_url}trends/available`;
        LOGGER.info(`[Trends Locations]`, { "limit": this.rate_limit });
        const start = performance.now();
        const response = await this.session.get(url);
        if (response.status === 200) {
            this.rate_limit = RateLimit.fromHeaders(response.headers);
        }
        LOGGER.debug(`[Trends Locations] Response: ${response.status}, elapsed time: ${(performance.now() - start).toFixed(2)}s - Limit: ${this.rate_limit.remaining}`);
        return response;
    }

    async trends(woeid: string): Promise<AxiosResponse> {
        const url = `${this.base_url}trends/place`;
        LOGGER.info(`[Trends] WOEID: ${woeid}`, { "limit": this.rate_limit });
        const params: { id: string } = { "id": woeid };
        const start = performance.now();
        const response = await this.session.get(url, { params: params });
        if (response.status === 200) {
            this.rate_limit = RateLimit.fromHeaders(response.headers);
        }
        LOGGER.debug(`[Trends] Response: ${response.status}, elapsed time: ${(performance.now() - start).toFixed(2)}s - Limit: ${this.rate_limit.remaining}`);
        return response;
    }

    async community_details(community_id: string): Promise<AxiosResponse> {
        const url = `${this.base_url}community/details`;
        LOGGER.info(`[Community Details] Community ID: ${community_id}`, { "limit": this.rate_limit });
        const params: { community_id: string } = { "community_id": community_id };
        const start = performance.now();
        const response = await this.session.get(url, { params: params });
        if (response.status === 200) {
            this.rate_limit = RateLimit.fromHeaders(response.headers);
        }
        LOGGER.debug(`[Community Details] Response: ${response.status}, elapsed time: ${(performance.now() - start).toFixed(2)}s - Limit: ${this.rate_limit.remaining}`);
        return response;
    }

    async community_tweets(community_id: string, limit: number = 20, cursor: string | null = null): Promise<AxiosResponse> {
        const url = `${this.base_url}community/tweets`;
        LOGGER.info(`[Community Tweets] Community ID: ${community_id} - Limit: ${limit}`, { "limit": this.rate_limit });
        const params: { community_id: string; limit: number; cursor?: string } = { "community_id": community_id, "limit": limit };
        if (cursor) {
            params["cursor"] = cursor;
        }
        const start = performance.now();
        const response = await this.session.get(url, { params: params });
        if (response.status === 200) {
            this.rate_limit = RateLimit.fromHeaders(response.headers);
        }
        LOGGER.debug(`[Community Tweets] Response: ${response.status}, elapsed time: ${(performance.now() - start).toFixed(2)}s - Limit: ${this.rate_limit.remaining}`);
        return response;
    }

    async community_members(community_id: string, limit: number = 20, cursor: string | null = null): Promise<AxiosResponse> {
        const url = `${this.base_url}community/members`;
        LOGGER.info(`[Community Members] Community ID: ${community_id} - Limit: ${limit}`, { "limit": this.rate_limit });
        const params: { community_id: string; limit: number; cursor?: string } = { "community_id": community_id, "limit": limit };
        if (cursor) {
            params["cursor"] = cursor;
        }
        const start = performance.now();
        const response = await this.session.get(url, { params: params });
        if (response.status === 200) {
            this.rate_limit = RateLimit.fromHeaders(response.headers);
        }
        LOGGER.debug(`[Community Members] Response: ${response.status}, elapsed time: ${(performance.now() - start).toFixed(2)}s - Limit: ${this.rate_limit.remaining}`);
        return response;
    }

}
