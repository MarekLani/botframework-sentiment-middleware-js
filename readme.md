# Sentiment Analysis Middleware

### Build status

NOTE!:  latest changes were not made part of npm package yet, because of this issue: https://github.com/Microsoft/botbuilder-js/issues/484 

| Branch | Status                                                       | Recommended NPM package version                              |
| ------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| master | [![Build status](https://api.travis-ci.com/MarekLani/botframework-sentiment-middleware-js.svg?branch=master)](https://travis-ci.com/MarekLani/botframework-sentiment-middleware-js/) | [![NPM package version](https://d25lcipzij17d.cloudfront.net/badge.svg?id=js&type=6&v=1.0.3&x2=0)](https://www.npmjs.com/package/botbuilder-sentimentmiddleware) |

### Description
This piece of middleware will get sentiment score of each incoming message text using Cognitive Services Text Analytics API and therefore requires a key. There is a free tier which meets most demo/PoC needs.  You can get more info at https://azure.microsoft.com/en-us/services/cognitive-services/text-analytics/

The implementation detects the language of the text and get the sentiment of the same. Currently, nearly 17 languages are supported. Full list of supported languages can be seen at https://docs.microsoft.com/en-us/azure/cognitive-services/text-analytics/text-analytics-supported-languages

### Installation

Available via NPM package [botbuilder-sentimentmiddleware](https://www.npmjs.com/package/botbuilder-sentimentmiddleware/)

Install into your project using the following command in the package manager;
```
    npm install botbuilder-sentimentmiddleware --save
```

### Usage (Typescript supported)

First create sentimentAnalysisMiddleware object and add it to middleware pipeline

```typescript
const sentimentAnalysisMiddleware = new SentimentAnalysisMiddleware({textAnalyticsAzureRegion:'{e.g. westeurope}', textAnalyticsKey:'{your text analytics key}',language:'en'})

botFrameworkAdapter.use(sentimentAnalysisMiddleware);
```

Subsequently you can obtain sentiment score for incoming message in following way:

```typescript
await sentimentAnalysisMiddleware.sentimentScore(context)
```

If not used within middleware pipeline, you can still use `getSentimentScore` method to call cognitive service and obtain the sentiment score on demand.

```typescript
await sentimentAnalysisMiddleware.getSentimentScore(context)
```