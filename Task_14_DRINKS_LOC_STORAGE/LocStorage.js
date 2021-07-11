"use strict";

function LocStorage(name) {    
    var self = this;
    self.list = {};

    if (localStorage.getItem(name)) {
        self.list = JSON.parse(localStorage[name]);
    }
    self.addValue = (key, value) => {
        self.list[key] = value;
        self.store();
    }
    self.getValue = (key) => {
        return (key in self.list) ? self.list[key] : undefined;
    }
    self.deleteValue = (key) => {
        if (key in self.list) {
            delete self.list[key];
            self.store();
            return true;
        }
        return false;
    }
    self.getKeys = () => {
        return (Object.keys(self.list));
    }
    self.store = function () {
        localStorage.setItem(name, JSON.stringify(self.list));
    }
}
