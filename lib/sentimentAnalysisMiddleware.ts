import { MiddlewareSet, TurnContext } from 'botbuilder';
import * as request from "request-promise-native";

export interface TextAnalyticsSettings {
    /**
     * Connection settings for Azure Cognitive Services - Text Analytics account
    */

    /** Region where Text Analytics service is deployed (e.g. 'westeurope').*/
    textAnalyticsAzureRegion: string;

    /** Text Analytics key */
    textAnalyticsKey: string;

    /**(Optional) language to be used, if not provided,  sentiment analysis middleware will invoke language detection as well */
    language?: string;
}

export class SentimentAnalysisMiddleware extends MiddlewareSet {
    private readonly COGNITIVE_SERVICES_BASE_URL = '.api.cognitive.microsoft.com';
    private readonly TEXT_ANALYTICS_PATH = '/text/analytics/v2.0/';
    private cacheKey :Symbol;


    private textAnalyticsApiKey: string;
    private textAnalyticsAzureRegion: string;
    private language: string = '';


    /**
     * @param settings Text Analytics Settings including connections settigns and language settings (optional)
     */
    constructor(settings: TextAnalyticsSettings) {

        super();

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
    public async onTurn(context: TurnContext, next: any): Promise<any> {
        try {
            await this.getSentimentScore(context);
        } catch (error) {
            return Promise.reject(error);

        }
        return Promise.resolve().then(await next());
    }

    /** Call when obtaining sentiment score from middleware 
     * 
     * @paran context TurnContext
    */
    sentimentScore(context: TurnContext)
    {
        return context.services.get(this.cacheKey);
    }

    /**
     * Runs the message in the given context through the Sentiment Analysis API.
     * 
     * @param context The context containing the message to score.
     * @returns The sentiment analysis score of the message in the given context or the moving average of scores.
     */
    public async getSentimentScore(context: TurnContext): Promise<number> {
        return new Promise<number>(async (resolve, reject) => {
            if (context.activity.type !== 'message') {
                reject('The activity is not of type message');
            }

            let message = context.activity.text;
               
            let score = 0
            try {
                score = await this.detectSentimentScore(message);
                context.services.set(this.cacheKey,score);
                resolve(score);
            } catch (error) {
                reject(`Failed to score the message: ${error}`);
            }
        });
    }

    /**
     * Gets the sentiment analysis score for the given message.
     * 
     * @param message The message to score.
     * @returns The analysis of the message including the score.
     */
    private async detectSentimentScore(message: string): Promise<number> {
        try {
            let language = (this.language != '') ? this.language : await this.detectLanguage(message);

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
      
            var response = await request.post(options)
            let result = JSON.parse(response).documents[0];
            if (result != undefined) {
                
                 let score = result.score
                 return  Promise.resolve(score); 
            }
            throw new Error('Text Analytics Sentiment detection error')
        }
        catch (e) {
            return Promise.reject(e);
        }
    }

    private async detectLanguage(message: string): Promise<string> {

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
            var response = JSON.parse(await request.post(options));
            let result = response.documents[0];
            if (result != undefined) {
                 let topDetectedScore = Math.max.apply(Math, result.detectedLanguages.map( (dl:any) => {return dl.score;}))
                 let language = result.detectedLanguages.find((dl:any) => { return dl.score == topDetectedScore; }).iso6391Name

                 return  Promise.resolve(language); 
            }
            throw new Error('Text Analytics Language detection error')
        }
        catch (e) {
            return Promise.reject(e);
        }
    }
}
