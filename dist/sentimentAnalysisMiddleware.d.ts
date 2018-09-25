import { MiddlewareSet, TurnContext } from 'botbuilder';
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
export declare class SentimentAnalysisMiddleware extends MiddlewareSet {
    private readonly COGNITIVE_SERVICES_BASE_URL;
    private readonly TEXT_ANALYTICS_PATH;
    private cacheKey;
    private textAnalyticsApiKey;
    private textAnalyticsAzureRegion;
    private language;
    /**
     * @param settings Text Analytics Settings including connections settigns and language settings (optional)
     */
    constructor(settings: TextAnalyticsSettings);
    /**
     * From MiddlewareSet
     * Runs analyze function which routes the incoming message through the Sentiment Analysis API and stores the result. If language settings was not provided, language recognitition is invoked.
     *
     * @param context The context containing the message to score.
     * @param next
     */
    onTurn(context: TurnContext, next: any): Promise<any>;
    /** Call when obtaining sentiment score from middleware
     *
     * @paran context TurnContext
    */
    sentimentScore(context: TurnContext): any;
    /**
     * Runs the message in the given context through the Sentiment Analysis API.
     *
     * @param context The context containing the message to score.
     * @returns The sentiment analysis score of the message in the given context or the moving average of scores.
     */
    getSentimentScore(context: TurnContext): Promise<number>;
    /**
     * Gets the sentiment analysis score for the given message.
     *
     * @param message The message to score.
     * @returns The analysis of the message including the score.
     */
    private detectSentimentScore;
    private detectLanguage;
}
