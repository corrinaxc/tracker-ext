// Session Management

import { generateRandomInteger } from './urlUtils.js';

let sessionId = null;
let inactivityTimeout;
let pageVisitCounter = 1;

export const assignSessionId = () => {
    sessionId = generateRandomInteger(10000000, 99999999);
    console.log("New Session ID assigned:", sessionId);
    return sessionId;
};

export const resetInactivityTimeout = (callback) => {
    clearTimeout(inactivityTimeout);
    inactivityTimeout = setTimeout(() => {
        callback(); 
    }, 15 * 60 * 1000); 
};

export const getSessionId = () => sessionId;

export const incrementPageVisitCounter = () => pageVisitCounter++;
