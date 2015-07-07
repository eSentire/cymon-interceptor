/***************************************************************************
******************************Class Whitelist*******************************
***************************************************************************/

function Whitelist() {
    this._whitelist = []; //TODO: Make is-a
}

//To be used at the start of each session to load data from storage
Whitelist.prototype.init = function(storage) {
    if (storage) {
        this._whitelist = storage;
    }
};

Whitelist.prototype.add = function(domain) {
    var domain_pattern = "*://" + domain + "/*";
    if (this._whitelist.indexOf(domain_pattern) == -1) {
        this._whitelist.push(domain_pattern);
        chrome.storage.local.set({"whitelist": this._whitelist});
    }
};

Whitelist.prototype.get = function(){
    return this._whitelist;
};

Whitelist.prototype.clear = function () {
    this._whitelist = [];
    chrome.storage.local.set({"whitelist": []});
};