'use strict';
const axios = require('axios');
const OdooAuthClient = require('./authClient');

class Odoo {

	constructor(config) {
		config = config || {};

		if (typeof config.host !== 'string') {
			throw new TypeError(`Expected \`host\` to be a \`string\`, got \`${typeof config.host}\``);
		}

		this._config = Object.assign({
			port: 80
		}, config);
	}

	async connect(opts) {
		const config = Object.assign({}, this._config, opts);
		
		const params = {
			db: config.database,
			login: config.username,
			password: config.password
		};

		// Throw them away
		delete config.database;
		delete config.username;
		delete config.password;

		const protocol = config.protocol === 'https' ? 'https://' : 'http://';
		const baseURL = `${protocol}${config.host}:${config.port}`;
		this.dataInstance = axios.create({
			baseURL
		});
	  
		this.dataInstance.defaults.headers.common['Content-Type'] = 'application/json';
		const payload = {
			jsonrpc: '2.0',
			params
		};
		return await this.dataInstance.post('/web/session/authenticate', payload)
	}

	async getAuthOdooClient(bodyResult, sessionId) {
		const config = Object.assign({}, this._config);
		return new OdooAuthClient(bodyResult, {
			protocol: config.protocol,
			host: config.host,
			port: config.port,
			sid: `session_id=${sessionId}`
		});
	}
}

module.exports = Odoo;

