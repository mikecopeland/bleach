/*
 * bleach
 * a minimal html sanitizer
 * cam@onswipe.com
 */

var fs = require('fs'),
    he = require('he'),
    bleachStdLib = require('./lib/bleachStdLib.js');


var bleach = {

  matcher: bleachStdLib.matcher,

  whitelist: bleachStdLib.whitelist,

  analyze: bleachStdLib.analyze,

  sanitize: bleachStdLib.sanitize,

  filterSync: function(html, filters) {
    html = String(html) || '';

    if (!filters) return;

    var available = fs.readdirSync(__dirname + '/../filters');

    if (Array.isArray(filters)) {
      for (var i in filters) {
        if (typeof filters[i] == 'function') {
          html = filters[i](html);
        } else {
          var file = filters[i] + '.js';
          for (var j in available) {
            if (file == available[j]) {
              html = require('../filters/' + file)(html);
            }
          }
        }
      }
      return html;
    } else if (typeof filters == 'string') {
      var file = filters + '.js';
      for (var i in available) {
        if (file == available[i]) {
          html = require('../filters/' + file)(html);
          return html;
        }
      }
      } else if (typeof filters == 'function') {
        html = filters(html);
        return html;
      } else return html;
  },

  filter: function(html, filters, callback) {
    if (typeof(callback) != 'function') {
      return bleach.filterSync(html, filters);
    }

    html = String(html) || '';

    if (!filters) callback('no filters provided', undefined);

    var available = fs.readdir(__dirname + '/../filters', function() {
      if (Array.isArray(filters)) {
        for (var i in filters) {
          if (typeof filters[i] == 'function') {
            html = filters[i](html);
          } else {
            var file = filters[i] + '.js';
            for (var j in available) {
              if (file == available[j]) {
                html = require('../filters/' + file)(html);
              }
            }
          }
        }
        return html;
      } else if (typeof filters == 'string') {
        var file = filters + '.js';
        for (var i in available) {
          if (file == available[i]) {
            html = require('../filters/' + file)(html);
            callback(undefined, html);
          }
        }
        } else if (typeof filters == 'function') {
          html = filters(undefined, html);
          callback(undefined, html);
        } else callback(undefined, html);
    });
  }

};

module.exports = bleach;
