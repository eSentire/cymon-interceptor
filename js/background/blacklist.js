function Blacklist() {
    this._blacklist = [];
    this._lastFetch = 0;
}

Blacklist.prototype.init = function (storage) {
    if (storage) {
        if (storage.blacklist) {
            this._blacklist = storage.blacklist;
        }
        if (storage.lastFetch) {
            this._lastFetch = storage.lastFetch;
        }
    }
};

Blacklist.prototype.getBlacklist = function () {
    return this._blacklist;
};

Blacklist.prototype.setBlacklist = function (blacklist) {
    this._blacklist = blacklist;
    chrome.storage.local.set({blacklist: this._blacklist})
};

Blacklist.prototype.addToBlacklist = function (domain) {
    if (this._blacklist.indexOf(domain) == -1) {
        this._blacklist.push(domain);
        chrome.storage.local.set({ blacklist: this._blacklist });
        return true;
    } else {
        return false;
    }
};

Blacklist.prototype.setLastFetch = function(time) {
    if (typeof time === 'number') {
        this._lastFetch = time;
        chrome.storage.local.set({ lastFetch: this._lastFetch });
        return true;
    } else {
        return false;
    }
};

Blacklist.prototype.getLastFetch = function() {
    return this._lastFetch;
}