function Blacklist() {
    this._blacklist = [];
}

Blacklist.prototype.init = function (storage) {
    if (storage && storage.blacklist) {
        this._blacklist = storage.blacklist;
    }
};

Blacklist.prototype.getList = function () {
    return this._blacklist;
};

Blacklist.prototype.setList = function (blacklist) {
    this._blacklist = blacklist;
    chrome.storage.sync.set({blacklist: this._blacklist})
};

Blacklist.prototype.retrieveBlacklist = function () {
    var request = new XMLHttpRequest();
    request.open("GET", 'http://cymoncommunity-dev-wartenuq33.elasticbeanstalk.com/api/nexus/v1/blacklist/ip/dnsbl/?days=3', true); //TODO: Hard-coded URL = bad?
    request.onreadystatechange = function () {//TODO: Need login creds
        if (request.readyState == 4) {
            console.log(JSON.parse(request.responseText));
        }
    }
    request.send();
}