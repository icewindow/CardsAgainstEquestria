var log = require('logule').init(module);
var _ = require('underscore');

var https = require('https');
var fs = require('fs');

var config = null;

var probeDeck = function (req, res) {
    res.type('application/json');

    var code = req.body.code;
    if (!code || code.length != 5) {
        res.send(400);
        return;
    }

    log.debug('Probing CardCast deck ' + code);

    var options = {
        host: config.cardcast.host,
        port: config.cardcast.port,
        method: 'GET',
        path: _.template(config.cardcast.deckInfo)({deck: code})
    };

    var probeReq = https.request(options, function (probeRes) {
        log.debug('Probed CardCast deck: ' + probeRes.statusCode);
        if (probeRes.statusCode != 200) {
            res.send(JSON.stringify({response: {id: 'not_found', message: 'Deck not found'}}));
            return;
        }

        probeRes.setEncoding('utf-8');
        probeRes.on('data', function (chunk) {
            log.debug('Deck metadata successfully probed');
            res.send(JSON.stringify({response: JSON.parse(chunk)}));
        });
    });

    probeReq.on('error', function (err) {
        log.warn('Failed to probe CardCast deck (options: ' + JSON.stringify(options) + '): ' + err.message);
        res.send(500);
    });

    probeReq.end();
};

var importDeck = function (req, res) {
    var code = req.body.code;
    if (!code || code.length != 5) {
        res.send(400);
        return;
    }

    log.debug('Importing CardCast deck ' + code);

    var options = {
        host: config.cardcast.host,
        port: config.cardcast.port,
        method: 'GET',
        path: _.template(config.cardcast.deckInfo)({deck: code})
    };

    var probeReq = https.request(options, function (probeRes) {
        log.debug('Probed CardCast deck: ' + probeRes.statusCode);
        if (probeRes.statusCode != 200) {
            res.send(JSON.stringify({response: {id: 'not_found', message: 'Deck not found'}}));
            return;
        }

        probeRes.setEncoding('utf-8');
        probeRes.on('data', function (chunk) {
            log.debug('Deck metadata successfully probed');

            var meta = JSON.parse(chunk);

            var options = {
                host: config.cardcast.host,
                port: config.cardcast.port,
                method: 'GET',
                path: _.template(config.cardcast.deckCards)({deck: code})
            };

            var importReq = https.request(options, function (importRes) {
                log.debug('Importing CardCast deck: ' + importRes.statusCode);
                if (importRes.statusCode != 200) {
                    res.send(500);
                    return;
                }

                importRes.setEncoding('utf-8');
                importRes.on('data', function (chunk) {
                    log.trace('Deck successfully imported');

                    var cards = JSON.parse(chunk);

                    meta.black_cards = cards.calls;
                    meta.white_cards = cards.responses;

                    console.log(meta);

                    fs.writeFile(process.cwd() + '/data/cc_decks/' + code + '.json', JSON.stringify(meta), function (err) {
                        if (err) {
                            log.warn('Failed to save deck ' + code + ': ' + err.message);
                        } else {
                            log.info('Successfully saved deck ' + code);
                        }
                    });

                    res.send(200);
                });
            });

            importReq.on('error', function (err) {
                log.info('Failed to import CardCast deck (options: ' + JSON.stringify(options) + '): ' + err.message);
                res.send(500);
            });

            importReq.end();
        });
    });

    probeReq.on('error', function (err) {
        log.warn('Failed to probe CardCast deck (options: ' + JSON.stringify(options) + '): ' + err.message);
        res.send(500);
    });

    probeReq.end();
};

module.exports = function (app, appConfig) {
    config = appConfig;

    app.post('/ajax/admin/cardcast/probe', probeDeck);
    app.post('/ajax/admin/cardcast/import', importDeck);
};
