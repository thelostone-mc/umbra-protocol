import { provider } from '@openzeppelin/test-environment';
import { getDefaultProvider, Web3Provider } from '@ethersproject/providers';
import * as chai from 'chai';
import * as utils from '../src/utils/utils';
import type { ExternalProvider, EthersProvider } from '../src/types';

const { expect } = chai;

const web3Provider = (provider as unknown) as ExternalProvider;
const ethersProvider = new Web3Provider(web3Provider);

// Define truth values to test for when not testing ENS or CNS
const publicKey =
  '0x04df3d784d6d1e55fabf44b7021cf17c00a6cccc53fea00d241952ac2eebc46dc674c91e60ccd97576c1ba2a21beed21f7b02aee089f2eeec357ffd349488a7cee';
const publicKeys = { spendingPublicKey: publicKey, viewingPublicKey: publicKey };

/**
 * @notice Wrapper function to verify that an async function rejects with the specified message
 * @param promise Promise to wait for
 * @param message Expected rejection message
 */
const expectRejection = async (promise: Promise<any>, message: string) => {
  // Error type requires strings, so we set them to an arbitrary value and
  // later check the values. If unchanged, the promise did not reject
  let error: Error = { name: 'default', message: 'default' };
  try {
    await promise;
  } catch (e) {
    error = e;
  } finally {
    expect(error.name).to.not.equal('default');
    expect(error.message).to.not.equal('default');
    expect(error.message).to.equal(message);
  }
};

describe('Utilities', () => {
  describe('Helpers', () => {
    it('properly pads hex values', async () => {
      const shortHex = '1234';
      const fullHex16 = '00000000000000000000000000001234';
      const fullHex32 = '0000000000000000000000000000000000000000000000000000000000001234';
      expect(utils.padHex(shortHex)).to.equal(fullHex32);
      expect(utils.padHex(shortHex, 32)).to.equal(fullHex32);
      expect(utils.padHex(shortHex, 16)).to.equal(fullHex16);
    });

    it('recovers public keys from transactions', async () => {
      const hash = '0x45fa716ee2d484ac67ef787625908072d851bfa369db40567e16ee08a7fdefd2';
      expect(await utils.recoverPublicKeyFromTransaction(hash, ethersProvider)).to.equal(publicKey);
    });
  });

  describe('Recipient identifier lookups', () => {
    before(async () => {
      await ethersProvider.getNetwork();
      ethersProvider.network.name = 'rinkeby'; // don't do this in prod, just for testing purposes so we use Rinkeby registry, not localhost
    });

    it('looks up recipients by public key', async () => {
      const keys = await utils.lookupRecipient(publicKey, ethersProvider);
      expect(keys.spendingPublicKey).to.equal(publicKeys.spendingPublicKey);
      expect(keys.viewingPublicKey).to.equal(publicKeys.viewingPublicKey);
    });

    it('looks up recipients by transaction hash', async () => {
      const hash = '0x45fa716ee2d484ac67ef787625908072d851bfa369db40567e16ee08a7fdefd2';
      const keys = await utils.lookupRecipient(hash, ethersProvider);
      expect(keys.spendingPublicKey).to.equal(publicKeys.spendingPublicKey);
      expect(keys.viewingPublicKey).to.equal(publicKeys.viewingPublicKey);
    });

    it('looks up recipients by address', async () => {
      const address = '0x60A5dcB2fC804874883b797f37CbF1b0582ac2dD';
      const ethersProvider = getDefaultProvider('rinkeby') as EthersProvider; // otherwise throws with unsupported network since we're on localhost
      const keys = await utils.lookupRecipient(address, ethersProvider);
      expect(keys.spendingPublicKey).to.equal(publicKeys.spendingPublicKey);
      expect(keys.viewingPublicKey).to.equal(publicKeys.viewingPublicKey);
    });

    it('looks up recipients by ENS', async () => {
      const keys = await utils.lookupRecipient('msolomon.eth', ethersProvider);
      // These values are set on the Rinkeby resolver
      expect(keys.spendingPublicKey).to.equal(
        '0x0445e52d17b8c845d0dcb490ba6701e3f31d24828768aa77e613b7f1be712b383240c1bf8f278ebb160c77a3d1cc84b200459ded5095ee50551c339b158a3a00e1'
      );
      expect(keys.viewingPublicKey).to.equal(
        '0x041190b7e2b61b8872c9ea5fff14770e7d3e78900282371b09ee9f2b8c4016b9967b5e9ee9e1e0bef30052e806321f0685a3ad69e2233be6813b81a5d293feea76'
      );
    });

    it('looks up recipients by CNS', async () => {
      const keys = await utils.lookupRecipient('udtestdev-msolomon.crypto', ethersProvider);
      // These values are set on the Rinkeby resolver
      expect(keys.spendingPublicKey).to.equal(
        '0x0445e52d17b8c845d0dcb490ba6701e3f31d24828768aa77e613b7f1be712b383240c1bf8f278ebb160c77a3d1cc84b200459ded5095ee50551c339b158a3a00e1'
      );
      expect(keys.viewingPublicKey).to.equal(
        '0x041190b7e2b61b8872c9ea5fff14770e7d3e78900282371b09ee9f2b8c4016b9967b5e9ee9e1e0bef30052e806321f0685a3ad69e2233be6813b81a5d293feea76'
      );
    });
  });

  describe('Input validation', () => {
    // ts-expect-error statements needed throughout this section to bypass TypeScript checks that would stop this file
    // from being compiled/ran

    it('throws when padHex is given a bad input', () => {
      const errorMsg = 'Input must be a hex string without the 0x prefix';
      expect(() => utils.padHex('q')).to.throw(errorMsg);
      expect(() => utils.padHex('0x1')).to.throw(errorMsg);
    });

    it('throws when recoverPublicKeyFromTransaction is given a bad transaction hash', async () => {
      const errorMsg = 'Invalid transaction hash provided';
      await expectRejection(utils.recoverPublicKeyFromTransaction('q', ethersProvider), errorMsg);
      // @ts-expect-error
      await expectRejection(utils.recoverPublicKeyFromTransaction(1, ethersProvider), errorMsg);
    });

    it('throws when recoverPublicKeyFromTransaction is given a transaction that does not exist', async () => {
      const mainnetTxHash = '0xce4209b4cf80e249502d770dd7f2b19ceb22bbb2cfb49500fe0a32d95b127e81';
      await expectRejection(
        utils.recoverPublicKeyFromTransaction(mainnetTxHash, ethersProvider),
        'Transaction not found. Are the provider and transaction hash on the same network?'
      );
    });
  });
});
