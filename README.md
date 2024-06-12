# Unofficial Twitter Typescript Client for [Twitter/X Rapid API](https://rapidapi.com/datarise-datarise-default/api/twitter-x)

<!-- Add badges for CI/CD, npm version, etc. -->
![Build Status](https://github.com/datarise-org-ma/twitter-client-typescript/actions/workflows/ci.yaml/badge.svg)
[![npm version](https://badge.fury.io/js/twitter-client-typescript.svg)](https://badge.fury.io/js/twitter-client-typescript)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

This is a TypeScript package that provides an asynchronous client for interacting with the Twitter V2 API via the [RapidAPI platform](https://rapidapi.com/datarise-datarise-default/api/twitter-x). This client provides various methods for accessing Twitter data.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
  - [Simple Example](#simple-example)
  - [Advanced Usage](#advanced-usage)
  - [Check Rate limit](#check-rate-limit)
- [License](#license)
- [Contact](#contact)

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

### Simple Example

To use the client, you will need to create an instance of the `AsyncTwitterClient` class and provide your RapidAPI key:

```typescript
import { AsyncTwitterClient } from 'twitter-client-typescript';

const client = new AsyncTwitterClient({ apiKey: "YOUR_API_KEY" });


// Use the client to make API calls
// Search for tweets
client.search('elon musk').then((response) => {
    result = response.data;
    console.log(result);
}).catch((error) => {
  console.error(error);
});

// Get user details
client.userDetails('elonmusk').then((response) => {
    result = response.data;
    console.log(result);
}).catch((error) => {
  console.error(error);
});

// Get user tweets
client.userTweets('elonmusk').then((response) => {
    result = response.data;
    console.log(result);
}).catch((error) => {
  console.error(error);
});

```

### Advanced Usage

*AsyncTwitterClient* class supports batch requests. You can make multiple requests in parallel and get the results in a single response. Here is an example:

```typescript
import { AsyncTwitterClient } from 'twitter-client-typescript';

const client = new AsyncTwitterClient({ apiKey: "YOUR_API_KEY", timeout: 10000 });

const users = ['elonmusk', 'BillGates', 'JeffBezos', 'tim_cook', 'satyanadella'];

// Create an array of promises
const promises = users.map((user) => client.userDetails(user));

// Make the requests in parallel
Promise.all(promises).then((responses) => {
    responses.forEach((response, index) => {
        console.log(users[index], response.data);
    });
}).catch((error) => {
    console.error(error);
});
```

### Check Rate limit

You can check the rate limit of the API using the `rateLimit` method. `AsyncTwitterClient` has a `rateLimit` attribute that returns the rate limit details. It's updated after each request.

```typescript
import { AsyncTwitterClient } from 'twitter-client-typescript';

const client = new AsyncTwitterClient({apiKey: 'YOUR_RAPID_API_KEY'});

// Get user details
client.userDetails('elonmusk').then((response) => {
    result = response.data;
    console.log(result);
}).catch((error) => {
  console.error(error);
});

// Check rate limit
console.log(`Limit : ${client.rateLimit.limit}`);
console.log(`Remaining requests: ${client.rateLimit.remaining}`);
console.log(`Reset time: ${client.rateLimit.reset}`);
```


## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

If you have any questions or feedback, feel free to reach out to us at contact [at] datarise [dot] ma.