function Options() {
    this._tags = {
        blacklist: false,
        botnet: false,
        dnsbl: true,
        malicious_activity: false,
        malware: false,
        phishing: false,
        spam: false
    };
    this._days = 1;
}

Options.prototype.init = function (storage) {
    if (storage && storage.options) {
        if (storage.options.tags) {
            this._tags = storage.options.tags;
        }
        if (storage.options.days) {
            this._days = storage.options.days;
        }
    }
};

Options.prototype.getTags = function () {
    return this._tags;
};

Options.prototype.setTags = function (tags) {
    this._tags = tags;
    chrome.storage.sync.set({
        options: {
            tags: this._tags,
            days: this._days
        }
    });
};

Options.prototype.getDays = function () {
    return this._days;
};

Options.prototype.setDays = function (days) {
    this._days = days;
    chrome.storage.sync.set({
        options: {
            tags: this._tags,
            days: this._days
        }
    });
};