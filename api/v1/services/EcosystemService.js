var _ = require('lodash');

var utils = require('../utils')
var errors = require('../errors');
var Ecosystem = require('../models/Ecosystem');


module.exports.getAllEcosystems = function () {
	return Ecosystem.fetchAll();
}

module.exports.createEcosystem = function (name) {
	var ecosystem = Ecosystem.forge({name: name.toLowerCase()});

	return ecosystem.save()
		.catch(
			utils.errors.DuplicateEntryError,
			utils.errors.handleDuplicateEntryError("An ecosystem with the given name already exists", "name")
		);
}

module.exports.deleteEcosystem = function (name) {
	return Ecosystem
		.findByName(name)
		.then(function (result) {
			if (_.isNull(result)) {
				var message = "An ecosystem with the given name does not exist";
				var source = "name";
				throw new errors.InvalidParameterError(message, source);
			}

			return result.destroy();
		});
}
