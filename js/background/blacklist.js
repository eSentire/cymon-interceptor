"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Blacklist = (function () {
    function Blacklist(blacklist) {
        _classCallCheck(this, Blacklist);

        this._blacklist = blacklist || [];
    }

    _createClass(Blacklist, [{
        key: "get",
        value: function get() {
            return this._blacklist;
        }
    }, {
        key: "set",
        value: function set(blacklist) {
            if (blacklist.constructor === Array) {
                this._blacklist = blacklist;
            }
            chrome.storage.local.set({ blacklist: this._blacklist });
            chrome.runtime.sendMessage({ action: "blacklistUpdated" });
        }
    }, {
        key: "add",
        value: function add(domains) {
            if (domains.constructor === Array) {
                this._blacklist = this._blacklist.concat(domains);
                chrome.storage.local.set({ blacklist: this._blacklist });
                chrome.runtime.sendMessage({ action: "blacklistUpdated" });
                return true;
            } else {
                return false;
            }
        }
    }]);

    return Blacklist;
})();


//function Blacklist(blacklist) {
//    var _blacklist = blacklist || [];
//
//    this.get = function () {
//        return _blacklist;
//    };
//
//    this.set = function (blacklist) {
//        if (blacklist.constructor === Array) {
//            _blacklist = blacklist;
//        }
//        chrome.storage.local.set({blacklist: _blacklist});
//        chrome.runtime.sendMessage({ action: "blacklistUpdated" });
//    };
//
//    this.add = function (domains) {
//        if (domains.constructor === Array) {
//            _blacklist = _blacklist.concat(domains);
//            chrome.storage.local.set({blacklist: _blacklist});
//            chrome.runtime.sendMessage({ action: "blacklistUpdated" });
//            return true;
//        } else {
//            return false;
//        }
//    };
//}