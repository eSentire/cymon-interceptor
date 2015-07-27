function Options(tags, fetchLookback, fetchInterval) {
    var _tags = tags || {
            'blacklist': false,
            'botnet': false,
            'dnsbl': true,
            'malicious activity': false,
            'malware': false,
            'phishing': false,
            'spam': false
        };
    var _fetchLookback = fetchLookback || 1;
    var _fetchInterval = fetchInterval || 24;

    this.getTags = function() {
        return _tags;
    };

    this.setTags = function (tags) {
        if (tags.constructor === Object) {
            _tags = tags;
            chrome.storage.sync.set({tags: _tags});
            chrome.runtime.sendMessage({action: "blacklistOptionsUpdated"});
        }
    };

    this.getFetchLookback = function () {
        return _fetchLookback;
    };

    this.setFetchLookback = function (days) {
        if (typeof days === 'number' && days % 1 === 0 && days > 0 && days <= 3) {
            _fetchLookback = days;
            chrome.storage.sync.set({fetchLookback: _fetchLookback});
            chrome.runtime.sendMessage({action: "blacklistOptionsUpdated"});
        }
    };

    this.getFetchInterval = function () {
        return _fetchInterval;
    };

    this.setFetchInterval = function (interval) {
        if (typeof interval === 'number' && interval % 1 === 0 && interval > 0 && interval <= 24) {
            _fetchInterval = interval;
            chrome.storage.sync.set({fetchInterval: _fetchInterval});
            chrome.runtime.sendMessage({action: "fetchIntervalUpdated"});
        }
    };

    chrome.runtime.sendMessage({ action: "optionsInitialized" });
}