function Options() {
    this._tags = {
        'blacklist': false,
        'botnet': false,
        'dnsbl': true,
        'malicious activity': false,
        'malware': false,
        'phishing': false,
        'spam': false
    };
    this._fetchLookback = 1;
    this._fetchInterval = 24;
}

Options.prototype.init = function (storage) {
    if (storage && storage.options) {
        if (storage.options.tags) {
            this._tags = storage.options.tags;
        }
        if (storage.options.fetchLookback) {
            this._fetchLookback = storage.options.fetchLookback;
        }
        if (storage.options.fetchInterval) {
            this._fetchInterval = storage.options.fetchInterval;
        }
    }
};

Options.prototype.save = function () {
    chrome.storage.sync.set({
       options: {
           tags: this._tags,
           fetchLookback: this._fetchLookback,
           fetchInterval: this._fetchInterval
       }
    });
};

Options.prototype.getTags = function () {
    return this._tags;
};

Options.prototype.setTags = function (tags) {
    this._tags = tags;
    this.save();
    chrome.runtime.sendMessage({ action: "blacklistOptionsUpdated" });
};

Options.prototype.getFetchLookback = function () {
    return this._fetchLookback;
};

Options.prototype.setFetchLookback = function (days) {
    if (typeof days === 'number' && days % 1 === 0 && days > 0 && days <= 3) {
        this._fetchLookback = days;
        this.save();
        chrome.runtime.sendMessage({ action: "blacklistOptionsUpdated" });
    }
};

Options.prototype.getFetchInterval = function() {
    return this._fetchInterval;
};

Options.prototype.getFetchIntervalMs = function() {
    return this._fetchInterval * 3600000;
};

Options.prototype.setFetchInterval = function(interval) {
    if (typeof interval === 'number' && interval % 1 === 0 && interval > 0 && interval <= 24) {
        this._fetchInterval = interval;
        this.save();
        chrome.runtime.sendMessage({ action: "fetchIntervalUpdated" });
    }
};