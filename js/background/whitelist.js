function Whitelist() {
    this._whitelist = []; //TODO: Make is-a
}

//To be used at the start of each session to load data from storage
Whitelist.prototype.init = function(storage) {
    if (storage && storage.whitelist) {
        this._whitelist = storage.whitelist;
    }
};

Whitelist.prototype.add = function(domain) {
    var domain_pattern = "*://" + domain + "/*";
    if (this._whitelist.indexOf(domain_pattern) == -1) {
        this._whitelist.push(domain_pattern);
        chrome.storage.sync.set({ whitelist: this._whitelist });
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
};