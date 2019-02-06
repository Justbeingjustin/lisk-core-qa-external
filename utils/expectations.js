const { sortBy } = require('../utils');

const username = (response, expectedValue) => {
	response.data.forEach(r => {
		expect(r.delegate.username).to.deep.equal(expectedValue);
	});
};

const limit = (response, expectedValue) => {
	expect(response.data).to.have.lengthOf(expectedValue);
};

const sort = (response, expectedValue) => {
	const [field, order] = expectedValue.split(':');
	const result = response.data.map(item => item[field]);

	if (result.length > 0 && !Number.isNaN(result[0])) {
		return expect(result).to.deep.equal(sortBy(result, order));
	}

	if (order.toLowerCase() === 'asc') {
		return expect(result).to.be.ascending;
	}
	return expect(result).to.be.descending;
};

const offset = (response, expectedValue) => {
	expect(response.meta.offset).to.deep.equal(parseInt(expectedValue));
};

const senderIdOrRecipientId = (response, expectedValue) => {
	const result = [response.data[0].senderId, response.data[0].recipientId];
	expect(result).to.include(expectedValue);
};

const search = (response, expectedValue) => {
	response.data.forEach(element => {
		const pattern = new RegExp(expectedValue);
		expect(element.username).to.match(pattern);
	});
};

const minAmount = (response, expectedValue) => {
	response.data.forEach(t => {
		expect(t.amount).to.be.bignumber.at.least(expectedValue);
	});
};

const maxAmount = (response, expectedValue) => {
	response.data.forEach(t => {
		expect(t.amount).to.be.bignumber.at.most(expectedValue);
	});
};

const fromTimestamp = (response, expectedValue) => {
	response.data.forEach(t => {
		expect(t.timestamp).to.be.bignumber.at.least(expectedValue);
	});
};

const toTimestamp = (response, expectedValue) => {
	response.data.forEach(t => {
		expect(t.timestamp).to.be.bignumber.at.most(expectedValue);
	});
};

const blockId = (response, expectedValue) => {
	expect(response.data[0].id).to.deep.equal(expectedValue);
};

module.exports = {
	username,
	limit,
	sort,
	offset,
	senderIdOrRecipientId,
	search,
	minAmount,
	maxAmount,
	fromTimestamp,
	toTimestamp,
	blockId,
};
