var Options = (function() {
    var _tags = {
        'blacklist': false,
        'botnet': false,
        'dnsbl': true,
        'malicious activity': false,
        'malware': false,
        'phishing': false,
        'spam': false
    };
    var _fetchLookback = 1;
    var _fetchInterval = 24;

    function optionsObject() {};

    optionsObject.prototype.init = function (storage) {
        if (storage && storage.options) {
            if (storage.options.tags) {
                _tags = storage.options.tags;
            }
            if (storage.options.fetchLookback) {
                _fetchLookback = storage.options.fetchLookback;
            }
            if (storage.options.fetchInterval) {
                _fetchInterval = storage.options.fetchInterval;
            }
        }
    };

    optionsObject.prototype.save = function () {
        chrome.storage.sync.set({
            options: {
                tags: _tags,
                fetchLookback: _fetchLookback,
                fetchInterval: _fetchInterval
            }
        });
    };

    optionsObject.prototype.getTags = function () {
        return _tags;
    };

    optionsObject.prototype.setTags = function (tags) {
        _tags = tags;
        this.save();
        chrome.runtime.sendMessage({action: "blacklistOptionsUpdated"});
    };

    optionsObject.prototype.getFetchLookback = function () {
        return _fetchLookback;
    };

    optionsObject.prototype.setFetchLookback = function (days) {
        if (typeof days === 'number' && days % 1 === 0 && days > 0 && days <= 3) {
            _fetchLookback = days;
            this.save();
            chrome.runtime.sendMessage({action: "blacklistOptionsUpdated"});
        }
    };

    optionsObject.prototype.getFetchInterval = function () {
        return _fetchInterval;
    };

    optionsObject.prototype.getFetchIntervalMs = function () {
        return _fetchInterval * 3600000;
    };

    optionsObject.prototype.setFetchInterval = function (interval) {
        if (typeof interval === 'number' && interval % 1 === 0 && interval > 0 && interval <= 24) {
            _fetchInterval = interval;
            this.save();
            chrome.runtime.sendMessage({action: "fetchIntervalUpdated"});
        }
    };

    return optionsObject;
})();