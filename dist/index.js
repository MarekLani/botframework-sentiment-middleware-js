"use strict";
/**
 * @module botbuilder-sentimentmiddleware
 */
/**
 * All code is licensed under the MIT License by the community.
 */
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
const sentimentAnalysisMiddleware_1 = require("./sentimentAnalysisMiddleware");
let s = { textAnalyticsAzureRegion: 'westeurope', textAnalyticsKey: 'a53a78efa76742deb0a03752ef6a7840' };
let m = new sentimentAnalysisMiddleware_1.SentimentAnalysisMiddleware(s);
m.getSentiment("Hello");
m.getSentiment("Hello").then((score) => { console.log(score); });
__export(require("./sentimentAnalysisMiddleware"));
