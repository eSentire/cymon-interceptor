"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Whitelist = (function () {
    function Whitelist(whitelist) {
        _classCallCheck(this, Whitelist);

        this._whitelist = whitelist || [];
    }

    _createClass(Whitelist, [{
        key: "get",
        value: function get() {
            return this._whitelist;
        }
    }, {
        key: "add",
        value: function add(domain) {
            if (this._whitelist.indexOf(domain) == -1) {
                this._whitelist.push(domain);
                chrome.storage.sync.set({ whitelist: this._whitelist });
                chrome.runtime.sendMessage({ action: "updateEvent" });
                return true;
            } else {
                return false;
            }
        }
    }, {
        key: "remove",
        value: function remove(domain) {
            var index = this._whitelist.indexOf(domain);
            if (index != -1) {
                this._whitelist.splice(index, 1);
                chrome.storage.sync.set({ whitelist: this._whitelist });
                chrome.runtime.sendMessage({ action: "updateEvent" });
                return true;
            } else {
                return false;
            }
        }
    }, {
        key: "clear",
        value: function clear() {
            this._whitelist = [];
            chrome.storage.sync.set({ whitelist: [] });
            chrome.runtime.sendMessage({ action: "updateEvent" });
        }
    }]);

    return Whitelist;
})();