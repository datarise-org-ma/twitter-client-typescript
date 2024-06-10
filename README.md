# Unofficial Twitter Typescript Client for [Twitter/X Rapid API](https://rapidapi.com/datarise-datarise-default/api/twitter-x)

This is a TypeScript package that provides an asynchronous client for interacting with the Twitter V2 API via the [RapidAPI platform](https://rapidapi.com/datarise-datarise-default/api/twitter-x). This client provides various methods for accessing Twitter data.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Advanced Usage](#advanced-usage)
- [License](#license)

## Installation

To install the package, use npm or yarn:

```bash
npm install twitter-client-typescript
```

or

```bash
yarn add twitter-client-typescript
```

## Usage

To use the client, you will need to create an instance of the `AsyncTwitterClient` class and provide your RapidAPI key:

```typescript
import { AsyncTwitterClient } from 'twitter-client-typescript';

const api_key = 'YOUR_RAPIDAPI_KEY';
const client = new AsyncTwitterClient(api_key);

// Use the client to make API calls
// Search for tweets
client.search('elon musk').then((response) => {
    result = response.data;
    console.log(result);
}).catch((error) => {
  console.error(error);
});

// Get user details
client.user_details('elonmusk').then((response) => {
    result = response.data;
    console.log(result);
}).catch((error) => {
  console.error(error);
});

// Get user tweets
client.user_tweets('elonmusk').then((response) => {
    result = response.data;
    console.log(result);
}).catch((error) => {
  console.error(error);
});

```

## Advanced Usage

*AsyncTwitterClient* class supports batch requests. You can make multiple requests in parallel and get the results in a single response. Here is an example:

```typescript
import { AsyncTwitterClient } from 'twitter-client-typescript';

const api_key = 'YOUR_RAPID_API_KEY';
const client = new AsyncTwitterClient(api_key, 10000); // 10s timeout

const users = ['elonmusk', 'BillGates', 'JeffBezos', 'tim_cook', 'satyanadella'];

// Create an array of promises
const promises = users.map((user) => client.user_details(user));

// Make the requests in parallel
Promise.all(promises).then((responses) => {
    responses.forEach((response, index) => {
        console.log(users[index], response.data);
    });
}).catch((error) => {
    console.error(error);
});
```

## Check Rate limit

You can check the rate limit of the API using the `rate_limit` method. AsyncTwitterClient has a `rate_limit` attribute that returns the rate limit details. It's updated after each request.

```typescript
import { AsyncTwitterClient } from 'twitter-client-typescript';

const api_key = 'YOUR_RAPID_API_KEY';
const client = new AsyncTwitterClient(api_key);

// Get user details
client.user_details('elonmusk').then((response) => {
    result = response.data;
    console.log(result);
}).catch((error) => {
  console.error(error);
});

// Check rate limit
console.log(`Limit : ${client.rate_limit.limit}`);
console.log(`Remaining requests: ${client.rate_limit.remaining}`);
console.log(`Reset time: ${client.rate_limit.reset}`);
```


## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

If you have any questions or feedback, feel free to reach out to us at contact [at] datarise [dot] ma.