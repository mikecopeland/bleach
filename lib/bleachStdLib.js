var he = (typeof he === 'undefined') ? {} : he; // to allow for use of this StdLib separately

var bleachStdLib;
bleachStdLib = {

    matcher: /<\/?([a-zA-Z0-9]+)*(.*?)\/?>/igm,

    whitelist: [
        'a',
        'b',
        'p',
        'em',
        'strong'
    ],

    analyze : function (html) {
        html = String(html) || '';

        var matches = [],
            match;

        // extract all tags
        while ((match = bleach.matcher.exec(html)) != null) {
            var attrr = match[2].split(' '),
                attrs = [];

            // extract attributes from the tag
            attrr.shift();
            attrr.forEach(function (attr) {
                attr = attr.split('=');
                var attr_name = attr[0],
                    attr_val = attr.length > 1 ? attr.slice(1).join('=') : null;
                // remove quotes from attributes
                if (attr_val && attr_val.charAt(0).match(/'|"/)) attr_val = attr_val.slice(1);
                if (attr_val && attr_val.charAt(attr_val.length - 1).match(/'|"/)) attr_val = attr_val.slice(0, -1);
                attr = {
                    name: attr_name,
                    value: attr_val
                };
                if (!attr.value) delete attr.value;
                if (attr.name) attrs.push(attr);
            });

            var tag = {
                full: match[0],
                name: match[1],
                attr: attrs
            };

            matches.push(tag);
        }

        return matches;
    },

    sanitize : function (html, options) {
        html = String(html) || '';
        options = options || {};

        var mode = options.mode || 'white',
            list = options.list || whitelist;

        var matches = bleach.analyze(html);

        if ((mode == 'white' && list.indexOf('script') == -1)
            || (mode == 'black' && list.indexOf('script') != -1)) {
            html = html.replace(/<script(.*?)>(.*?[\r\n])*?(.*?)(.*?[\r\n])*?<\/script>/gim, '');
        }


        if ((mode == 'white' && list.indexOf('style') == -1)
            || (mode == 'black' && list.indexOf('style') != -1)) {
            html = html.replace(/<style(.*?)>(.*?[\r\n])*?(.*?)(.*?[\r\n])*?<\/style>/gim, '');
        }

        matches.forEach(function (tag) {
            if (mode == 'white') {
                if (list.indexOf(tag.name) == -1) {
                    html = html.replace(tag.full, '');
                }
            } else if (mode == 'black') {
                if (list.indexOf(tag.name) != -1) {
                    html = html.replace(tag.full, '');
                }
            } else {
                throw new Error('Unknown sanitization mode "' + mode + '"');
            }
        });

        if (options.encode_entities) html = he.encode(html); //to be used in Node Module

        return html;
    }
}