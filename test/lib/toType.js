// See: https://javascriptweblog.wordpress.com/2011/08/08/fixing-the-javascript-typeof-operator/
Object.toType = function (obj) {
    return ({}).toString.call(obj).match(/\s([a-z|A-Z]+)/)[1].toLowerCase();
};
