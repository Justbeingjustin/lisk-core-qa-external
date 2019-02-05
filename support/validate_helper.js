const chai = require('chai');
const { TO_LISK, TO_BEDDOWS, from } = require('../utils');
const LiskUtil = require('./lisk_util');

/* eslint camelcase: ["error", {allow: ["codecept_helper"]}] */
const Helper = codecept_helper;
const liskUtil = new LiskUtil();

chai.use(require('chai-json-schema'));
chai.use(require('chai-sorted'));
chai.use(require('chai-bignumber')());

const expect = chai.expect;

class ValidateHelper extends Helper {
	async haveAccount(params) {
		const { result, error } = await from(liskUtil.call().getAccounts(params));
		const {
			data: [account],
		} = result;

		expect(error).to.be.null;
		this.helpers.ResponseValidator.expectResponseToBeValid(
			result,
			'AccountsResponse'
		);
		return account;
	}

	async haveAccountWithBalance(address, balance) {
		const account = await this.haveAccount({ address });

		if (!account || !(TO_LISK(account.balance) >= balance)) {
			if (account) {
				balance = Math.ceil(balance - TO_LISK(account.balance));
			}

			await liskUtil.transfer({
				recipientId: address,
				amount: TO_BEDDOWS(balance),
			});
		}
		await this.haveAccount({ address });
	}

	async haveAccountWithSecondSignature(address, passphrase, secondPassphrase) {
		const account = await this.haveAccount({ address });

		if (account && account.secondPublicKey) {
			expect(account.secondPublicKey)
				.to.be.an('string')
				.to.have.lengthOf(64);
		} else {
			await liskUtil.registerSecondPassphrase(passphrase, secondPassphrase);
		}
		return account;
	}

	async haveAccountRegisteredAsDelegate(params) {
		const account = await this.haveAccount({ address: params.address });

		if (account && account.delegate) {
			this.helpers.ResponseValidator.expectResponseToBeValid(
				account.delegate,
				'Delegate'
			);
		} else {
			if (account && account.secondPublicKey) {
				delete params.secondPassphrase;
			}
			await liskUtil.registerAsDelegate(params);
		}
		return account;
	}

	async haveMultiSignatureAccount(requester, keepers, params) {
		const account = await this.haveAccountWithBalance(requester.address, 100);

		await liskUtil.registerMultisignature(keepers, params);
		return account;
	}
}

module.exports = ValidateHelper;
