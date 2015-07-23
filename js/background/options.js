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

    function saveOptions() {
        chrome.storage.sync.set({
            options: {
                tags: _tags,
                fetchLookback: _fetchLookback,
                fetchInterval: _fetchInterval
            }
        });
    }

    this.getTags = function() {
        return _tags;
    };

    this.setTags = function (tags) {
        _tags = tags;
        saveOptions();
        chrome.runtime.sendMessage({action: "blacklistOptionsUpdated"});
    };

    this.getFetchLookback = function () {
        return _fetchLookback;
    };

    this.setFetchLookback = function (days) {
        if (typeof days === 'number' && days % 1 === 0 && days > 0 && days <= 3) {
            _fetchLookback = days;
            saveOptions();
            chrome.runtime.sendMessage({action: "blacklistOptionsUpdated"});
        }
    };

    this.getFetchInterval = function () {
        return _fetchInterval;
    };

    this.getFetchIntervalMs = function () {
        return _fetchInterval * 3600000;
    };

    this.setFetchInterval = function (interval) {
        if (typeof interval === 'number' && interval % 1 === 0 && interval > 0 && interval <= 24) {
            _fetchInterval = interval;
            saveOptions();
            chrome.runtime.sendMessage({action: "fetchIntervalUpdated"});
        }
    };
}