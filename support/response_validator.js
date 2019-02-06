const liskCommons = require('lisk-commons');
const { flattern, from } = require('../utils');
const expectations = require('../utils/expectations');

/* eslint camelcase: ["error", {allow: ["codecept_helper"]}] */
const Helper = codecept_helper;
const otherFields = [
	'username',
	'limit',
	'sort',
	'offset',
	'senderIdOrRecipientId',
	'minAmount',
	'maxAmount',
	'fromTimestamp',
	'toTimestamp',
];

class ResponseValidator extends Helper {
	async getSchemaDefinition(name) {
		const { result, error } = await from(liskCommons.schema());

		expect(error).to.be.null;
		return result.definitions[name];
	}

	async expectResponseToBeValid(response, definition) {
		const schemaDefinition = await this.getSchemaDefinition(definition);

		return expect(response).to.be.jsonSchema(schemaDefinition);
	}

	expectResponseToBeSortedBy(data, field, order) {
		const fieldOrder = `${field}:${order}`;
		expectations.sort(data, fieldOrder);
	}

	expectResultToMatchParams(response, params) {
		Object.entries(params).forEach(item => {
			const [k, v] = item;
			if (otherFields.includes(k)) {
				this.handleOtherParams(response, k, v);
			} else {
				const data = flattern(response.data[0]);
				expect(data[k].toString()).to.deep.equal(v);
			}
		});
	}

	expectBlockResultToMatchParams(response, params) {
		const [[k, v]] = Object.entries(params);
		if (['limit', 'sort', 'offset', 'blockId'].includes(k)) {
			this.handleOtherParams(response, k, v);
		} else {
			const data = flattern(response.data[0]);
			expect(data[k].toString()).to.deep.equal(v);
		}
	}

	expectDelegatesToMatchParams(response, params) {
		const [[k, v]] = Object.entries(params);
		if (['limit', 'sort', 'offset', 'search'].includes(k)) {
			this.handleOtherParams(response, k, v);
		} else {
			const data = flattern(response.data[0]);
			expect(data[k].toString()).to.deep.equal(v);
		}
	}

	expectMultisigAccountToHaveContracts(account, contracts) {
		const addresses = account.data[0].members.map(m => m.address);
		expect(contracts.every(c => addresses.includes(c.address))).to.deep.equal(
			true
		);
	}

	expectVotesResultToMatchParams(response, params) {
		Object.entries(params).forEach(item => {
			const [k, v] = item;
			if (['sort'].includes(k)) {
				const [field, order] = v.split(':');
				const data = { data: response.data.votes };
				this.expectResponseToBeSortedBy(data, field, order);
			} else if (k !== 'limit') {
				expect(response.data[k].toString()).to.deep.equal(v);
			}
		});
	}

	expectVotersResultToMatchParams(response, params) {
		Object.entries(params).forEach(item => {
			const [k, v] = item;
			if (['sort'].includes(k)) {
				const [field, order] = v.split(':');
				const data = { data: response.data.voters };
				this.expectResponseToBeSortedBy(data, field, order);
			} else if (k !== 'limit') {
				expect(response.data[k].toString()).to.deep.equal(v);
			}
		});
	}

	expectDefaultCount(response) {
		expect(response.data.length).to.be.at.most(10);
	}

	handleOtherParams(response, key, value) {
		expectations[key](response, value);
	}
}

module.exports = ResponseValidator;
