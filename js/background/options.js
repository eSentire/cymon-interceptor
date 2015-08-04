'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Options = (function () {
    function Options(tags, fetchLookback, fetchInterval) {
        _classCallCheck(this, Options);

        this._tags = tags || {
            'blacklist': false,
            'botnet': false,
            'dnsbl': true,
            'malicious activity': false,
            'malware': false,
            'phishing': false,
            'spam': false
        };
        this._fetchLookback = fetchLookback || 1;
        this._fetchInterval = fetchInterval || 24;
    }

    _createClass(Options, [{
        key: 'set',
        value: function set(input) {
            var optionsUpdated = false;
            var intervalUpdated = false;

            if (typeof input === 'object') {
                if (input.tags && typeof input.tags === 'object') {
                    this._tags = input.tags;
                    chrome.storage.sync.set({ tags: this._tags });
                    optionsUpdated = true;
                }
                if (input.fetchLookback && typeof input.fetchLookback === 'number' && input.fetchLookback % 1 === 0 && input.fetchLookback > 0 && input.fetchLookback <= 3) {
                    this._fetchLookback = input.fetchLookback;
                    chrome.storage.sync.set({ fetchLookback: this._fetchLookback });
                    optionsUpdated = true;
                }
                if (input.fetchInterval && typeof input.fetchInterval === 'number' && input.fetchInterval % 1 === 0 && input.fetchInterval > 0 && input.fetchInterval <= 24) {
                    this._fetchInterval = input.fetchInterval;
                    chrome.storage.sync.set({ fetchInterval: this._fetchInterval });
                    intervalUpdated = true;
                }

                if (optionsUpdated) {
                    chrome.runtime.sendMessage({ action: "blacklistOptionsUpdated" });
                }
                if (intervalUpdated) {
                    chrome.runtime.sendMessage({ action: "fetchIntervalUpdated" });
                }
                return true;
            } else {
                return false;
            }
        }
    }, {
        key: 'getTags',
        value: function getTags() {
            return this._tags;
        }
    }, {
        key: 'getFetchLookback',
        value: function getFetchLookback() {
            return this._fetchLookback;
        }
    }, {
        key: 'getFetchInterval',
        value: function getFetchInterval() {
            return this._fetchInterval;
        }
    }]);

    return Options;
})();


//function Options(tags, fetchLookback, fetchInterval) {
//    var _tags = tags || {
//            'blacklist': false,
//            'botnet': false,
//            'dnsbl': true,
//            'malicious activity': false,
//            'malware': false,
//            'phishing': false,
//            'spam': false
//        };
//    var _fetchLookback = fetchLookback || 1;
//    var _fetchInterval = fetchInterval || 24;
//
//    this.set = function(input) {
//        var optionsUpdated = false;
//        var intervalUpdated = false;
//
//        if (typeof input ==='object') {
//            if (input.tags && typeof input.tags === 'object') {
//                _tags = input.tags;
//                chrome.storage.sync.set({tags: _tags});
//                optionsUpdated = true;
//            }
//            if (input.fetchLookback && typeof input.fetchLookback === 'number' && input.fetchLookback % 1 === 0 && input.fetchLookback > 0 && input.fetchLookback <= 3) {
//                _fetchLookback = input.fetchLookback;
//                chrome.storage.sync.set({fetchLookback: _fetchLookback});
//                optionsUpdated = true;
//            }
//            if (input.fetchInterval && typeof input.fetchInterval === 'number' && input.fetchInterval % 1 === 0 && input.fetchInterval > 0 && input.fetchInterval <= 24) {
//                _fetchInterval = input.fetchInterval;
//                chrome.storage.sync.set({fetchInterval: _fetchInterval});
//                intervalUpdated = true;
//            }
//
//            if (optionsUpdated) {
//                chrome.runtime.sendMessage({ action: "blacklistOptionsUpdated" });
//            }
//            if (intervalUpdated) {
//                chrome.runtime.sendMessage({ action: "fetchIntervalUpdated" });
//            }
//            return true;
//        } else {
//            return false;
//        }
//    };
//
//    this.getTags = function() {
//        return _tags;
//    };
//
//    this.getFetchLookback = function () {
//        return _fetchLookback;
//    };
//
//    this.getFetchInterval = function () {
//        return _fetchInterval;
//    };
//
//    //this.setTags = function (tags) {
//    //    if (typeof tags === 'object') {
//    //        _tags = tags;
//    //        chrome.storage.sync.set({tags: _tags});
//    //    }
//    //};
//    //
//    //this.setFetchLookback = function (days) {
//    //    if (typeof days === 'number' && days % 1 === 0 && days > 0 && days <= 3) {
//    //        _fetchLookback = days;
//    //        chrome.storage.sync.set({fetchLookback: _fetchLookback});
//    //    }
//    //};
//    //
//    //this.setFetchInterval = function (interval) {
//    //    if (typeof interval === 'number' && interval % 1 === 0 && interval > 0 && interval <= 24) {
//    //        _fetchInterval = interval;
//    //        chrome.storage.sync.set({fetchInterval: _fetchInterval});
//    //    }
//    //};
//}