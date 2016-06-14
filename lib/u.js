'use strict';

exports.pad = function(num, width) {
    return ((new Array(width)).join('0') + num).slice(-width)
}

exports.numlen = function(num) {
    if (num === 0) return 1
    return Math.ceil(Math.log(num + 1) / Math.LN10)
}
