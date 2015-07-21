function Blacklist() {
    this._blacklist = [];
}

Blacklist.prototype.init = function (storage) {
    if (storage && storage.blacklist) {
        this._blacklist = storage.blacklist;
    }
};

Blacklist.prototype.get = function () {
    return this._blacklist;
};

Blacklist.prototype.set = function (blacklist) {
    this._blacklist = blacklist;
    chrome.storage.local.set({blacklist: this._blacklist})
};

Blacklist.prototype.add = function (domain) {
    if (this._blacklist.indexOf(domain) == -1) {
        this._blacklist.push(domain);
        chrome.storage.local.set({ blacklist: this._blacklist });
        return true;
    } else {
        return false;
    }
};