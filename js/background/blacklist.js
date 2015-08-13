"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Blacklist = (function () {
    function Blacklist() {
        var blacklist = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

        _classCallCheck(this, Blacklist);

        this._blacklist = blacklist;
    }

    _createClass(Blacklist, [{
        key: "get",
        value: function get() {
            return this._blacklist;
        }
    }, {
        key: "set",
        value: function set(blacklist) {
            if (blacklist && blacklist.constructor === Array) {
                this._blacklist = blacklist;
                chrome.storage.local.set({ blacklist: this._blacklist });
                chrome.runtime.sendMessage({ action: "blacklistUpdated" });
                return true;
            } else {
                //throw new Error("Invalid value for 'blacklist'; expected an array of strings representing the new blacklist.");
                return false;
            }
        }
    }, {
        key: "add",
        value: function add(domains) {
            if (domains && domains.constructor === Array) {
                var blacklistHash = {};
                $.each(this._blacklist, function (index, domain) {
                    blacklistHash[domain] = true;
                });
                $.each(domains, function (index, domain) {
                    blacklistHash[domain] = true;
                });

                this._blacklist = Object.keys(blacklistHash);
                chrome.storage.local.set({ blacklist: this._blacklist });
                chrome.runtime.sendMessage({ action: "blacklistUpdated" });
                return true;
            } else {
                //throw new Error("Invalid value for 'domains'; expected an array of strings representing domains to add to the blacklist.");
                return false;
            }
        }
    }]);

    return Blacklist;
})();

