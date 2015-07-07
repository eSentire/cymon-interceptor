/***************************************************************************
******************************Class Blocklist*******************************
***************************************************************************/

function Blocklist() {
    this._blocklist = []; //TODO: Make is-a
}

Blocklist.prototype.get = function() {
    return this._blocklist;
};

Blocklist.prototype.add = function(domain) {
    if (this._blocklist.indexOf(domain) == -1) {
        this._blocklist.push(domain);
    }
};

Blocklist.prototype.remove = function(domain) {
    var index = this._blocklist.indexOf(domain);
    if (index != -1) {
        this._blocklist.splice(index);
    }
};

Blocklist.prototype.clear = function() {
    this._blocklist = [];
};