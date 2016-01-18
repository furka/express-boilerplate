/* global Promise */
'use strict';

var _ = require('underscore');
var mongo = require('mongoskin');
var diffPatch = require('jsondiffpatch');
var shortid = require('shortid');
var db = mongo.db(process.env.MONGOLAB_URI, { native_parser: true });


/****************************************************
* HELPER FUNCTIONS
****************************************************/

//sends data as json
function sendData (response, data) {
  response.setHeader('Content-Type', 'application/json');
  response.setHeader('Cache-Control', 'no-cache');
  response.send(data);
}

//runs a query and then sends the results or an error back
//action must return a Promise
function query (action, request, response, next) {
  action(mongo.helper.toObjectID(request.params.id), request.body, response)
    .then(sendData.bind(null, response), next);
}

//rejects a promise if an error occurred, otherwise resolves it with data
function queryHandler (resolve, reject, err, data) {
  if (err) {
    return reject(err);
  }
  resolve(data);
}

//returns a promise that resolves or rejects depending on whether data is present
function ensureExist (data) {
  if (data) {
    return Promise.resolve(data);
  }

  return Promise.reject();
}

//returns a collection
function getCollection (collection, find, sort) {
  return new Promise(function (resolve, reject) {
    collection
      .find(find)
      .sort(sort)
      .toArray(queryHandler.bind(null, resolve, reject));
  });
}

//inserts a new document and returns its id
function insertNewDocument (collection, payload) {
  return new Promise(function (resolve, reject) {
    collection.insert(payload, queryHandler.bind(null, resolve, reject));
  });
}

//remove document by id
function removeDocumentByID (collection, id) {
  return new Promise(function (resolve, reject) {
    collection.removeById(id, queryHandler.bind(null, resolve, reject));
  });
}

//returns a document by id
function getDocumentByID (collection, id) {
  return new Promise(function (resolve, reject) {
    collection.findById(id, queryHandler.bind(null, resolve, reject));
  });
}

//set document by id
function setDocumentByID (collection, id, payload) {
  return new Promise(function (resolve, reject) {
    collection.updateById(id, payload, queryHandler.bind(null, resolve, reject));
  });
}


/****************************************************
* RESPONSE HANDLERS
****************************************************/

function getDocument (collection, id) {
  return getDocumentByID(collection, id)
    .then(ensureExist);
}

//INSERT DOCUMENT
function insertDocument (collection, history, id, payload, response) {
  id = mongo.helper.toObjectID(shortid.generate());
  payload._id = id;

  return insertDiff(history, id, payload, null)
    .then(insertNewDocument.bind(null, collection, payload))
    .then(function (data) {
      response.status(201);
      return Promise.resolve(data.insertedIds[0]);
    })
    .then(getDocumentByID.bind(null, collection));
}

//SET DOCUMENT BY ID
function setDocument (collection, history, id, payload) {
  //ensure id is maintained
  payload._id = id;

  return getDocumentByID(collection, id)
    .then(ensureExist)
    .then(insertDiff.bind(null, history, id, payload))
    .then(setDocumentByID.bind(null, collection, id, payload))
    .then(getDocumentByID.bind(null, collection, id));
}

//UPDATE DOCUMENT BY ID
function updateDocument (collection, history, id, payload) {
  return getDocumentByID(collection, id)
    .then(function (data) {
      return Promise.resolve(_.extend(data, payload));
    })
    .then(setDocument.bind(null, collection, history, id));
}

//DELETE DOCUMENT BY ID
function deleteDocumentByID (collection, history, id, payload, response) {
  return getDocumentByID(collection, id)
    .then(ensureExist)
    .then(insertDiff.bind(null, history, id, null))
    .then(removeDocumentByID.bind(null, collection, id))
    .then(function () { 
      response.status(204);
      return Promise.resolve(null);
    });
}

//INSERT DIFF
function insertDiff (history, id, payload, previous) {
  var diff = {
    date: Date.now(),
    documentId: id,
    delta: diffPatch.diff(previous, payload)
  };

  return insertNewDocument(history, diff);
}

//GET DOCUMENT DIFFS
function getDiff (history, id) {
  return getCollection(history, {documentId: id}, {date: -1});
}


/****************************************************
 * makes a mongoDB collection available as an API
 * GET      /collection             get entire collection
 * POST     /collection             insert a new document
 * GET      /collection/:id         get document by id
 * PUT      /collection/:id         set document by id
 * PATCH    /collection/:id         update document by id (partial update)
 * DELETE   /collection/:id         delete document by id
 * GET      /collection/:id/diff    get list of diffs between document updates
****************************************************/

function restfulAPI (router, collectionName, options) {
  options = options || {};

  var path = options.path;
  if (!path) {
    path = collectionName;
  }

  //bind collection
  db.bind(collectionName);
  var collection = db[collectionName];

  //bind history collection
  var history = options.history || 'history';
  db.bind(history);
  history = db[history];
  history.ensureIndex({documentId: 1}, {background: true});


  //bind actions
  router.get('/' + path, query.bind(null, getCollection.bind(null, collection, null, options.sort)));
  router.post('/' + path, query.bind(null, insertDocument.bind(null, collection, history)));

  router.get('/' + path + '/:id', query.bind(null, getDocument.bind(null, collection)));
  router.put('/' + path + '/:id', query.bind(null, setDocument.bind(null, collection, history)));
  router.patch('/' + path + '/:id', query.bind(null, updateDocument.bind(null, collection, history)));
  router.delete('/' + path + '/:id', query.bind(null, deleteDocumentByID.bind(null, collection, history)));

  router.get('/' + path + '/:id/diff', query.bind(null, getDiff.bind(null, history)));
}

module.exports = restfulAPI;
