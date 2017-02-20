var CheckitError = require('checkit').Error;
var _ = require('lodash');
var _Promise = require('bluebird');

var CheckIn = require('../models/CheckIn');
var NetworkCredential = require('../models/NetworkCredential');
var UserService = require('../services/UserService');
var errors = require('../errors');
var utils = require('../utils');


/**
 * Finds a CheckIn by User ID
 * @param {Number} userId id of requested user
 * @returns {Promise} the resolving to obect {checkin: {CheckIn object}, credentials: {Credential object}}
 * @throws {NotFoundError} when the user has no check in
 */
module.exports.findCheckInByUserId = function (userId){
    return CheckIn
        .findByUserId(userId)
        .then(function (checkin){
            if (_.isNull(checkin)) {
                var message = "A check in record cannot be found for the given user";
                var source = "userId";
                throw new errors.NotFoundError(message, source);
            }
            return NetworkCredential.findByUserId(userId)
            .then(function(credentials){
                if (!_.isNull(credentials)) {
                    return {
                        "checkin": checkin,
                        "credentials": credentials
                    };
                }
                return {"checkin": checkin};
            })
        })
};

/**
 * Updates the CheckIn values to request
 * @param {Obejct} attributes to be updated
 * @returns {Promise} the resolved obect {checkin: {CheckIn object}}
 */
module.exports.updateCheckIn = function (attributes){
    return module.exports.findCheckInByUserId(attributes.userId)
        .then(function(fetchedCheckin) {
            checkin = fetchedCheckin.checkin;
            var updates = {
                "swag": attributes.swag || checkin.get('swag'),
                "location": attributes.location || checkin.get('location')
            };
            checkin.set(updates, {patch: true});
            return {"checkin": checkin.save()};
        });
};

/**
 * Creates a CheckIn object for given user with the given attributes
 * @param {Object} attribute values requested
 * @returns {Promise} resolving to obect {checkin: {CheckIn object}, credentials: {Credential object}}
 * @throws {InvalidParameterError} when the user has already checked in
 */
module.exports.createCheckIn = function (attributes){
    var credentialsRequested =  attributes.credentialsRequested;
    delete attributes.credentialsRequested;
    var checkin = CheckIn.forge(attributes);
    return checkin.validate()
        .catch(CheckitError, utils.errors.handleValidationError)
        .then(function(validation) {
            return CheckIn.findByUserId(attributes.userId);
        })
        .then(function (existingCheckin) {
            if (!_.isNull(existingCheckin)) {
                var message = "A check in record already exists for this user";
                var source = "userId";
                throw new errors.InvalidParameterError(message, source);
            }
            return CheckIn.transaction(function (t) {
                return checkin.save(null, {transacting: t})
                .then(function(model){
                    if(credentialsRequested){
                        return NetworkCredential.findUnassigned()
                        .then(function(networkCredential){
                            if (_.isNull(networkCredential)) {
                                var message = "There are no more unassigned credentials";
                                var source = "credentialsRequested";
                                throw new errors.NotFoundError(message, source);
                            }

                            var updates = {
                                "userId": attributes.userId,
                                "assigned": true
                            };

                            return networkCredential.save(updates, {transacting: t, patch:true})
                            .then(function(creds){
                                return {
                                    "checkin": model,
                                    "credentials": creds
                                };
                            });
                        });
                    }
                    else {
                        return {"checkin": model};
                    }
                });
            });
        });
};
