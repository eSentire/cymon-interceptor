function Whitelist() {
    this._whitelist = [];
}

Whitelist.prototype.init = function(storage) {
    if (storage && storage.whitelist) {
        this._whitelist = storage.whitelist;
        chrome.runtime.sendMessage({ action: "whitelistUpdated" });
    }
};

Whitelist.prototype.add = function(domain) {
    if (this._whitelist.indexOf(domain) == -1) {
        this._whitelist.push(domain);
        chrome.storage.sync.set({ whitelist: this._whitelist });
        chrome.runtime.sendMessage({ action: "whitelistUpdated" });
        return true;
    } else {
        return false;
    }
};


Whitelist.prototype.remove = function(domain) {
    var index = this._whitelist.indexOf(domain)
    if (index != -1) {
        this._whitelist.splice(index, 1);
        chrome.storage.sync.set({ whitelist: this._whitelist });
        chrome.runtime.sendMessage({ action: "whitelistUpdated" });
        return true;
    } else {
        return false;
    }
};

Whitelist.prototype.get = function(){
    return this._whitelist;
};

Whitelist.prototype.clear = function () {
    this._whitelist = [];
    chrome.storage.sync.set({ whitelist: [] });
    chrome.runtime.sendMessage({ action: "whitelistUpdated" });
};