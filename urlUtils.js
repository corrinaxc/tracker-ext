// URL Processing Funcs

export const generateRandomInteger = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

export const getDomainFromUrl = (url) => {
    try {
        return new URL(url).hostname;
    } catch (error) {
        console.error('Invalid URL:', url);
        return null;
    }
};

export const isSearchEngine = (domain, searchEngines) => searchEngines.some(searchEngine => domain.includes(searchEngine));

export const isIgnoredUrl = (url, ignoredPatterns) => ignoredPatterns.some(pattern => url.includes(pattern));
