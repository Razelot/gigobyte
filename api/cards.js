const express = require('express');
const router = express.Router();

const sqlite = require('sqlite3');
const db = new sqlite.Database('./api/cards.cdb');

const decodeAttribute = require('./decode-attribute.json');
const decodeRace = require('./decode-race.json');
const decodeType = require('./decode-type.json');

const encodeAttribute = require('./encode-attribute.json');
const encodeRace = require('./encode-race.json');
// const encode_type = require('./encode-type.json');

// Format a card object
function formatCard(card) {

    // Invalid card
    if (!card) { return; }

    let cardObj = {};
    cardObj['id'] = card['id'];
    cardObj['name'] = card['name'];
    cardObj['attribute'] = decodeAttribute[card['attribute']];
    if (card['level']) { cardObj['level'] = parseInt(card['level'].toString(16).slice(-1), 16); }
    cardObj['race'] = decodeRace[card['race']];
    cardObj['type'] = decodeType[card['type']];
    cardObj['atk'] = card['atk'];
    cardObj['def'] = card['def'];
    cardObj['desc'] = card['desc'];

    return cardObj
}

// Get All Cards
router.get('/cards/', (req, res, next) => {

    const filterAtrributes = req.query.attributes ? " and " + createFilterQuery("attribute", req.query['attributes'].split(','), encodeAttribute) : "";
    const filterRaces = req.query.races ? " and " + createFilterQuery("race", req.query['races'].split(','), encodeRace) : "";
    // const filterLevel = req.query.level ? " and levels==" + req.query.level : "";
    // const filter_type = req.query.type ? (" and type==" + encode_type[req.query.type.toUpperCase()]) : "";

    // const sql = "select t.name, d.attribute, d.race, d.type, d.level, d.atk, d.def, t.desc from datas d, texts t where d.id = t.id"
    //     + filterAtrributes + filterRaces + " group by name";
    const sql = "select t.id, t.name from datas d, texts t where d.id = t.id"
        + filterAtrributes + filterRaces + " group by name"
        // + order by random()"
        ;

    // let cards = [];

    // db.each(sql, (err, card) => { // Format each card
    //     if (err) {
    //         attribute
    //         res.send(err.message);
    //     } else {
    //         let cardObj = formatCard(card);
    //         cards.push(cardObj);
    //     }
    // }, (err) => { // Display after all cards formatted
    //     res.json(cards);
    // });

    db.all(sql, (err, cards) => {
        if (err) {
            res.send(err.message);
        } else {
            res.json(cards);
        }
    });


});

// Search by name or description
router.get('/cards/:query', (req, res, next) => {

    const filterAtrributes = req.query.attributes ? " and " + createFilterQuery("attribute", req.query['attributes'].split(','), encodeAttribute) : "";
    const filterRaces = req.query.races ? " and " + createFilterQuery("race", req.query['races'].split(','), encodeRace) : "";
    // const filterLevel = req.query.level ? " and levels==" + req.query.level : "";
    // const filter_type = req.query.type ? (" and type==" + encode_type[req.query.type.toUpperCase()]) : "";

    // const sql = "select t.name, d.attribute, d.race, d.type, d.level, d.atk, d.def, t.desc from datas d, texts t where d.id = t.id and (upper(t.name) like upper($query) or upper(t.desc) like upper($query)) "
    //     + filterAtrributes + filterRaces + " group by name";
    const sql = "select t.id, t.name from datas d, texts t where d.id = t.id and (upper(t.name) like upper($query) or upper(t.desc) like upper($query)) "
        + filterAtrributes + filterRaces + " group by name";

    const params = { $query: '%' + decodeURI(req.params.query) + '%' }

    // let cards = [];

    // db.each(sql, params, (err, card) => { // Format each card
    //     if (err) {
    //         res.send(err.message);
    //     } else {
    //         let cardObj = formatCard(card);
    //         cards.push(cardObj);
    //     }
    // }, (err) => { // Display after all cards formatted
    //     res.json(cards);
    // });


    db.all(sql, params, (err, cards) => {
        if (err) {
            res.send(err.message);
        } else {
            res.json(cards);
        }
    });

});

// Get Single Card by ID
router.get('/card/:id', (req, res, next) => {
    // const sql = "select t.id, t.name, d.attribute, d.race, d.type, d.level, d.atk, d.def, t.desc from datas d, texts t where d.id = t.id and upper(t.name)=?";
    const sql = "select t.id, t.name, d.attribute, d.race, d.type, d.level, d.atk, d.def, t.desc from datas d, texts t where d.id = t.id and t.id=?";


    db.get(sql, req.params.id, (err, card) => {
        if (err) {
            res.send(err.message);
            return;
        } else {
            let cardObj = formatCard(card);
            res.json(cardObj);
        }
    });

});


function createFilterQuery(field, filters, encoder) {
    let query = "(";
    for (var i = 0; i < filters.length; i++) {
        if (i != 0) {
            query = query + " or ";
        }
        if (encoder) {
            query = query + field + "==" + encoder[filters[i].toLowerCase()] + "";
        } else {
            query = query + field + "==" + filters[i] + "";
        }
    }
    query = query + ")"
    return query;
}

module.exports = router;