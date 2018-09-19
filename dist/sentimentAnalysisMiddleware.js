"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const botbuilder_1 = require("botbuilder");
const request = require("request-promise-native");
class SentimentAnalysisMiddleware extends botbuilder_1.MiddlewareSet {
    /**
     * @param settings Text Analytics Settings including connections settigns and language settings (optional)
     */
    constructor(settings) {
        super();
        this.COGNITIVE_SERVICES_BASE_URL = '.api.cognitive.microsoft.com';
        this.TEXT_ANALYTICS_PATH = '/text/analytics/v2.0/';
        this.language = '';
        if (!settings.textAnalyticsAzureRegion || settings.textAnalyticsAzureRegion.length == 0) {
            throw new Error('Missing Text Analytics Azure Region');
        }
        if (!settings.textAnalyticsKey || settings.textAnalyticsKey.length == 0) {
            throw new Error('API key for Text Analytics missing');
        }
        this.textAnalyticsAzureRegion = settings.textAnalyticsAzureRegion;
        this.textAnalyticsApiKey = settings.textAnalyticsKey;
        this.cacheKey = Symbol("sentimentScore");
        if (settings.language) {
            this.language = settings.language;
        }
    }
    /**
     * From MiddlewareSet
     * Runs analyze function which routes the incoming message through the Sentiment Analysis API and stores the result. If language settings was not provided, language recognitition is invoked.
     *
     * @param context The context containing the message to score.
     * @param next
     */
    onTurn(context, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                //await this.getSentiment(context);
            }
            catch (error) {
                return Promise.reject(error);
            }
            return Promise.resolve().then(yield next());
        });
    }
    /** Call when obtaining sentiment score from middleware
     *
     * @paran context TurnContext
    */
    getSentimentScore(context) {
        return context.services.get(this.cacheKey);
    }
    // /**
    //  * Runs the message in the given context through the Sentiment Analysis API.
    //  * 
    //  * @param context The context containing the message to score.
    //  * @returns The sentiment analysis score of the message in the given context or the moving average of scores.
    //  */
    // public async getSentiment(context: TurnContext): Promise<number> {
    //     return new Promise<number>(async (resolve, reject) => {
    //         if (context.activity.type !== 'message') {
    //             reject('The activity is not of type message');
    //             return;
    //         }
    //         let message = context.activity.text;
    //         let score = 0
    //         try {
    //             score = await this.detectSentimentScore(message);
    //             context.services.set(this.cacheKey,score);
    //             resolve(score);
    //         } catch (error) {
    //             reject(`Failed to score the message: ${error}`);
    //         }
    //     });
    // }
    /**
     * Runs the message in the given context through the Sentiment Analysis API.
     *
     * @param context The context containing the message to score.
     * @returns The sentiment analysis score of the message in the given context or the moving average of scores.
     */
    getSentiment(message) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let score = 0;
                try {
                    score = yield this.detectSentimentScore(message);
                    //context.services.set(this.cacheKey,score);
                    resolve(score);
                }
                catch (error) {
                    reject(`Failed to score the message: ${error}`);
                }
            }));
        });
    }
    /**
     * Gets the sentiment analysis score for the given message.
     *
     * @param message The message to score.
     * @returns The analysis of the message including the score.
     */
    detectSentimentScore(message) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let language = (this.language != '') ? this.language : yield this.detectLanguage(message);
                let documents = {
                    'documents': [
                        { 'id': '1', 'language': language, 'text': message }
                    ]
                };
                var options = {
                    uri: 'https://' + this.textAnalyticsAzureRegion.toLowerCase() + this.COGNITIVE_SERVICES_BASE_URL + this.TEXT_ANALYTICS_PATH + 'sentiment',
                    body: JSON.stringify(documents),
                    headers: {
                        'Ocp-Apim-Subscription-Key': this.textAnalyticsApiKey
                    }
                };
                var response = yield request.post(options);
                let result = JSON.parse(response).documents[0];
                if (result != undefined) {
                    let score = result.score;
                    return Promise.resolve(score);
                }
                throw new Error('Text Analytics Sentiment detection error');
            }
            catch (e) {
                return Promise.reject(e);
            }
        });
    }
    detectLanguage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            let documents = {
                'documents': [
                    { 'id': '1', 'text': message }
                ]
            };
            var options = {
                uri: 'https://' + this.textAnalyticsAzureRegion.toLowerCase() + this.COGNITIVE_SERVICES_BASE_URL + this.TEXT_ANALYTICS_PATH + 'languages',
                body: JSON.stringify(documents),
                headers: {
                    'Ocp-Apim-Subscription-Key': this.textAnalyticsApiKey
                }
            };
            try {
                var response = JSON.parse(yield request.post(options));
                let result = response.documents[0];
                if (result != undefined) {
                    let topDetectedScore = Math.max.apply(Math, result.detectedLanguages.map((dl) => { return dl.score; }));
                    let language = result.detectedLanguages.find((dl) => { return dl.score == topDetectedScore; }).iso6391Name;
                    return Promise.resolve(language);
                }
                throw new Error('Text Analytics Language detection error');
            }
            catch (e) {
                return Promise.reject(e);
            }
        });
    }
}
exports.SentimentAnalysisMiddleware = SentimentAnalysisMiddleware;
