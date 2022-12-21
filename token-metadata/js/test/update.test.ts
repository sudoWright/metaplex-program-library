import spok from 'spok';
import { AssetData, Data, Metadata, TokenStandard } from '../src/generated';
import test from 'tape';
import { amman, InitTransactions, killStuckProcess } from './setup';
import { Keypair } from '@solana/web3.js';
import { createDefaultAsset } from './utils/DigitalAssetManager';
import { UpdateTestData } from './utils/UpdateTestData';

killStuckProcess();

test('Update: NonFungible asset', async (t) => {
  const API = new InitTransactions();
  const { fstTxHandler: handler, payerPair: payer, connection } = await API.payer();

  const daManager = await createDefaultAsset(t, API, handler, payer);
  const { mint, metadata, masterEdition } = daManager;
  const assetData = await daManager.getAssetData(connection);

  // Change some values and run update.
  const data: Data = {
    name: 'DigitalAsset2',
    symbol: 'DA2',
    uri: 'uri2',
    sellerFeeBasisPoints: 0,
    creators: assetData.creators,
  };

  const authorizationData = daManager.emptyAuthorizationData();

  const updateData = {
    newUpdateAuthority: null,
    data: data,
    primarySaleHappened: null,
    isMutable: null,
    tokenStandard: null,
    collection: null,
    uses: null,
    collectionDetails: null,
    programmableConfig: null,
    delegateState: null,
    authorizationData,
  };

  const { tx: updateTx } = await API.update(
    t,
    payer,
    mint,
    metadata,
    masterEdition,
    updateData,
    handler,
  );
  await updateTx.assertSuccess(t);
});

test('Update: Cannot Flip IsMutable to True', async (t) => {
  const API = new InitTransactions();
  const { fstTxHandler: handler, payerPair: payer, connection } = await API.payer();

  const daManager = await createDefaultAsset(t, API, handler, payer);
  const { mint, metadata, masterEdition } = daManager;

  // Flip isMutable to false
  const updateData = new UpdateTestData();
  updateData.isMutable = false;

  const { tx: updateTx } = await API.update(
    t,
    payer,
    mint,
    metadata,
    masterEdition,
    updateData,
    handler,
  );
  await updateTx.assertSuccess(t);

  const updatedMetadata = await Metadata.fromAccountAddress(connection, metadata);

  spok(t, updatedMetadata, {
    isMutable: false,
  });

  // Try to flip isMutable to true
  updateData.isMutable = true;

  const { tx: updateTx2 } = await API.update(
    t,
    payer,
    mint,
    metadata,
    masterEdition,
    updateData,
    handler,
  );
  await updateTx2.assertError(t, /Is Mutable can only be flipped to false/i);
});

test('Update: Cannot Flip PrimarySaleHappened to False', async (t) => {
  const API = new InitTransactions();
  const { fstTxHandler: handler, payerPair: payer, connection } = await API.payer();

  const daManager = await createDefaultAsset(t, API, handler, payer);
  const { mint, metadata, masterEdition } = daManager;

  // Flip to true
  const updateData = new UpdateTestData();
  updateData.primarySaleHappened = true;

  const { tx: updateTx } = await API.update(
    t,
    payer,
    mint,
    metadata,
    masterEdition,
    updateData,
    handler,
  );
  await updateTx.assertSuccess(t);

  const updatedMetadata = await Metadata.fromAccountAddress(connection, metadata);

  spok(t, updatedMetadata, {
    primarySaleHappened: true,
  });

  // Try to flip false -- this should fail
  updateData.primarySaleHappened = false;

  const { tx: updateTx2 } = await API.update(
    t,
    payer,
    mint,
    metadata,
    masterEdition,
    updateData,
    handler,
  );
  await updateTx2.assertError(t, /Primary sale can only be flipped to true/i);
});

test('Update: Set New Update Authority', async (t) => {
  const API = new InitTransactions();
  const { fstTxHandler: handler, payerPair: payer, connection } = await API.payer();

  const daManager = await createDefaultAsset(t, API, handler, payer);
  const { mint, metadata, masterEdition } = daManager;

  const newUpdateAuthority = new Keypair().publicKey;

  // Flip to true
  const updateData = new UpdateTestData();
  updateData.newUpdateAuthority = newUpdateAuthority;

  const { tx: updateTx } = await API.update(
    t,
    payer,
    mint,
    metadata,
    masterEdition,
    updateData,
    handler,
  );
  await updateTx.assertSuccess(t);

  const updatedMetadata = await Metadata.fromAccountAddress(connection, metadata);

  spok(t, updatedMetadata, {
    updateAuthority: newUpdateAuthority,
  });
});

test('Update: Cannot Update Immutable Data', async (t) => {
  const API = new InitTransactions();
  const { fstTxHandler: handler, payerPair: payer } = await API.payer();

  const daManager = await createDefaultAsset(t, API, handler, payer);
  const { mint, metadata, masterEdition } = daManager;

  // Flip isMutable to false
  const updateData = new UpdateTestData();
  updateData.isMutable = false;

  const { tx: updateTx } = await API.update(
    t,
    payer,
    mint,
    metadata,
    masterEdition,
    updateData,
    handler,
  );
  await updateTx.assertSuccess(t);

  // Try to write some data.
  updateData.data = {
    name: 'new-name',
    symbol: 'new-symbol',
    uri: 'new-uri',
    sellerFeeBasisPoints: 500,
    creators: null,
  };

  const { tx: updateTx2 } = await API.update(
    t,
    payer,
    mint,
    metadata,
    masterEdition,
    updateData,
    handler,
  );
  await updateTx2.assertError(t, /Data is immutable/i);
});

test('Update: Name Cannot Exceed 32 Bytes', async (t) => {
  const API = new InitTransactions();
  const { fstTxHandler: handler, payerPair: payer } = await API.payer();

  const daManager = await createDefaultAsset(t, API, handler, payer);
  const { mint, metadata, masterEdition } = daManager;

  const updateData = new UpdateTestData();
  updateData.data = {
    name: ''.padEnd(33, 'a'),
    symbol: 'new-symbol',
    uri: 'new-uri',
    sellerFeeBasisPoints: 100,
    creators: null,
  };

  const { tx: updateTx } = await API.update(
    t,
    payer,
    mint,
    metadata,
    masterEdition,
    updateData,
    handler,
  );
  await updateTx.assertError(t, /Name too long/i);
});

test('Update: Symbol Cannot Exceed 10 Bytes', async (t) => {
  const API = new InitTransactions();
  const { fstTxHandler: handler, payerPair: payer } = await API.payer();

  const daManager = await createDefaultAsset(t, API, handler, payer);
  const { mint, metadata, masterEdition } = daManager;

  const updateData = new UpdateTestData();
  updateData.data = {
    name: 'new-name',
    symbol: ''.padEnd(11, 'a'),
    uri: 'new-uri',
    sellerFeeBasisPoints: 100,
    creators: null,
  };

  const { tx: updateTx } = await API.update(
    t,
    payer,
    mint,
    metadata,
    masterEdition,
    updateData,
    handler,
  );
  await updateTx.assertError(t, /Symbol too long/i);
});

test('Update: URI Cannot Exceed 200 Bytes', async (t) => {
  const API = new InitTransactions();
  const { fstTxHandler: handler, payerPair: payer } = await API.payer();

  const daManager = await createDefaultAsset(t, API, handler, payer);
  const { mint, metadata, masterEdition } = daManager;

  const updateData = new UpdateTestData();
  updateData.data = {
    name: 'new-name',
    symbol: 'new-symbol',
    uri: ''.padEnd(201, 'a'),
    sellerFeeBasisPoints: 100,
    creators: null,
  };

  const { tx: updateTx } = await API.update(
    t,
    payer,
    mint,
    metadata,
    masterEdition,
    updateData,
    handler,
  );
  await updateTx.assertError(t, /Uri too long/i);
});

test('Update: SellerFeeBasisPoints Cannot Exceed 10_000', async (t) => {
  const API = new InitTransactions();
  const { fstTxHandler: handler, payerPair: payer } = await API.payer();

  const daManager = await createDefaultAsset(t, API, handler, payer);
  const { mint, metadata, masterEdition } = daManager;

  const updateData = new UpdateTestData();
  updateData.data = {
    name: 'new-name',
    symbol: 'new-symbol',
    uri: 'new-uri',
    sellerFeeBasisPoints: 10_005,
    creators: null,
  };

  const { tx: updateTx } = await API.update(
    t,
    payer,
    mint,
    metadata,
    masterEdition,
    updateData,
    handler,
  );
  await updateTx.assertError(t, /Basis points cannot be more than 10000/i);
});

test('Update: Creators Array Cannot Exceed Five Items', async (t) => {
  const API = new InitTransactions();
  const { fstTxHandler: handler, payerPair: payer } = await API.payer();

  const daManager = await createDefaultAsset(t, API, handler, payer);
  const { mint, metadata, masterEdition } = daManager;

  const creators = [];

  for (let i = 0; i < 6; i++) {
    creators.push({
      address: new Keypair().publicKey,
      verified: false,
      share: i < 5 ? 20 : 0, // Don't exceed 100% share total.
    });
  }

  const updateData = new UpdateTestData();
  updateData.data = {
    name: 'new-name',
    symbol: 'new-symbol',
    uri: 'new-uri',
    sellerFeeBasisPoints: 100,
    creators,
  };

  const { tx: updateTx } = await API.update(
    t,
    payer,
    mint,
    metadata,
    masterEdition,
    updateData,
    handler,
  );
  await updateTx.assertError(t, /Creators list too long/i);
});

test('Update: No Duplicate Creator Addresses', async (t) => {
  const API = new InitTransactions();
  const { fstTxHandler: handler, payerPair: payer } = await API.payer();

  const daManager = await createDefaultAsset(t, API, handler, payer);
  const { mint, metadata, masterEdition } = daManager;

  const creators = [];

  for (let i = 0; i < 2; i++) {
    creators.push({
      address: payer.publicKey,
      verified: true,
      share: 50,
    });
  }

  const updateData = new UpdateTestData();
  updateData.data = {
    name: 'new-name',
    symbol: 'new-symbol',
    uri: 'new-uri',
    sellerFeeBasisPoints: 100,
    creators,
  };

  const { tx: updateTx } = await API.update(
    t,
    payer,
    mint,
    metadata,
    masterEdition,
    updateData,
    handler,
  );
  await updateTx.assertError(t, /No duplicate creator addresses/i);
});

test('Update: Creator Shares Must Equal 100', async (t) => {
  const API = new InitTransactions();
  const { fstTxHandler: handler, payerPair: payer } = await API.payer();

  const daManager = await createDefaultAsset(t, API, handler, payer);
  const { mint, metadata, masterEdition } = daManager;

  const creators = [];

  creators.push({
    address: payer.publicKey,
    verified: true,
    share: 101,
  });

  const updateData = new UpdateTestData();
  updateData.data = {
    name: 'new-name',
    symbol: 'new-symbol',
    uri: 'new-uri',
    sellerFeeBasisPoints: 100,
    creators,
  };

  const { tx: updateTx } = await API.update(
    t,
    payer,
    mint,
    metadata,
    masterEdition,
    updateData,
    handler,
  );
  await updateTx.assertError(t, /Share total must equal 100 for creator array/i);
});

// test('Update: Cannot Unverify Another Creator', async (t) => {
//   const API = new InitTransactions();
//   const { fstTxHandler: handler, payerPair: payer, connection } = await API.payer();

//   const daManager = await createDefaultAsset(t, API, handler, payer);
//   const { mint, metadata, masterEdition } = daManager;

//   const creatorKey = new Keypair();
//   await amman.airdrop(connection, creatorKey.publicKey, 1);

//   // Verify the creator once the verify function is done.

//   // Have a different keypair try to unverify it.
//   const newCreators = [];
//   newCreators.push({
//     address: creatorKey.publicKey,
//     verified: false,
//     share: 100,
//   });

//   const updateData2 = new UpdateTestData();
//   updateData2.data = {
//     name: 'new-name',
//     symbol: 'new-symbol',
//     uri: 'new-uri',
//     sellerFeeBasisPoints: 100,
//     creators: newCreators,
//   };

//   const { tx: updateTx2 } = await API.update(
//     t,
//     payer,
//     mint,
//     metadata,
//     masterEdition,
//     updateData2,
//     handler,
//   );

//   await updateTx2.assertError(t, /cannot unilaterally unverify another creator/i);
// });

test('Update: Cannot Verify Another Creator', async (t) => {
  const API = new InitTransactions();
  const { fstTxHandler: handler, payerPair: payer, connection } = await API.payer();

  const daManager = await createDefaultAsset(t, API, handler, payer);
  const { mint, metadata, masterEdition } = daManager;

  const creatorKey = new Keypair();
  await amman.airdrop(connection, creatorKey.publicKey, 1);

  // Start with an unverified creator
  const creators = [];
  creators.push({
    address: creatorKey.publicKey,
    verified: false,
    share: 100,
  });

  const updateData = new UpdateTestData();
  updateData.data = {
    name: 'new-name',
    symbol: 'new-symbol',
    uri: 'new-uri',
    sellerFeeBasisPoints: 100,
    creators,
  };

  const { tx: updateTx } = await API.update(
    t,
    payer,
    mint,
    metadata,
    masterEdition,
    updateData,
    handler,
  );
  await updateTx.assertSuccess(t);

  const updatedMetadata = await Metadata.fromAccountAddress(connection, metadata);

  spok(t, updatedMetadata.data, {
    creators: updateData.data.creators,
  });

  // Have a different keypair try to verify it.
  const newCreators = [];
  newCreators.push({
    address: creatorKey.publicKey,
    verified: true,
    share: 100,
  });

  const updateData2 = new UpdateTestData();
  updateData2.data = {
    name: 'new-name',
    symbol: 'new-symbol',
    uri: 'new-uri',
    sellerFeeBasisPoints: 100,
    creators: newCreators,
  };

  const { tx: updateTx2 } = await API.update(
    t,
    payer,
    mint,
    metadata,
    masterEdition,
    updateData2,
    handler,
  );

  await updateTx2.assertError(t, /cannot unilaterally verify another creator, they must sign/i);
});

test('Update: Update Unverified Collection Key', async (t) => {
  const API = new InitTransactions();
  const { fstTxHandler: handler, payerPair: payer, connection } = await API.payer();

  const name = 'DigitalAsset';
  const symbol = 'DA';
  const uri = 'uri';

  const collectionParent = new Keypair();
  const newCollectionParent = new Keypair();

  // Create the initial asset and ensure it was created successfully
  const assetData: AssetData = {
    name,
    symbol,
    uri,
    sellerFeeBasisPoints: 0,
    updateAuthority: payer.publicKey,
    creators: [
      {
        address: payer.publicKey,
        share: 100,
        verified: false,
      },
    ],
    primarySaleHappened: false,
    isMutable: true,
    editionNonce: null,
    tokenStandard: TokenStandard.NonFungible,
    collection: { key: collectionParent.publicKey, verified: false },
    uses: null,
    collectionDetails: null,
    programmableConfig: null,
    delegateState: null,
  };

  const {
    tx: createTx,
    mint,
    metadata,
    masterEdition,
  } = await API.create(t, payer, assetData, 0, 0, handler);
  await createTx.assertSuccess(t);

  const createdMetadata = await Metadata.fromAccountAddress(connection, metadata);
  spok(t, createdMetadata, {
    collection: {
      key: collectionParent.publicKey,
      verified: false,
    },
  });

  const updateData = new UpdateTestData();
  updateData.collection = { key: newCollectionParent.publicKey, verified: false };

  const { tx: updateTx } = await API.update(
    t,
    payer,
    mint,
    metadata,
    masterEdition,
    updateData,
    handler,
  );
  await updateTx.assertSuccess(t);

  const updatedMetadata = await Metadata.fromAccountAddress(connection, metadata);

  spok(t, updatedMetadata.collection, {
    verified: updateData.collection.verified,
    key: updateData.collection.key,
  });
});

test('Update: Fail to Verify an Unverified Collection', async (t) => {
  const API = new InitTransactions();
  const { fstTxHandler: handler, payerPair: payer, connection } = await API.payer();

  const name = 'DigitalAsset';
  const symbol = 'DA';
  const uri = 'uri';

  const collectionParent = new Keypair();

  // Create the initial asset and ensure it was created successfully
  const assetData: AssetData = {
    name,
    symbol,
    uri,
    sellerFeeBasisPoints: 0,
    updateAuthority: payer.publicKey,
    creators: [
      {
        address: payer.publicKey,
        share: 100,
        verified: false,
      },
    ],
    primarySaleHappened: false,
    isMutable: true,
    editionNonce: null,
    tokenStandard: TokenStandard.NonFungible,
    collection: { key: collectionParent.publicKey, verified: false },
    uses: null,
    collectionDetails: null,
    programmableConfig: null,
    delegateState: null,
  };

  const {
    tx: createTx,
    mint,
    metadata,
    masterEdition,
  } = await API.create(t, payer, assetData, 0, 0, handler);
  await createTx.assertSuccess(t);

  const createdMetadata = await Metadata.fromAccountAddress(connection, metadata);
  spok(t, createdMetadata, {
    collection: {
      key: collectionParent.publicKey,
      verified: false,
    },
  });

  const updateData = new UpdateTestData();
  updateData.collection = { key: collectionParent.publicKey, verified: true };

  const { tx: updateTx } = await API.update(
    t,
    payer,
    mint,
    metadata,
    masterEdition,
    updateData,
    handler,
  );
  await updateTx.assertError(t, /Collection cannot be verified in this instruction/);
});

// test('Update: Fail to Update a Verified Collection', async (t) => {
//   const API = new InitTransactions();
//   const { fstTxHandler: handler, payerPair: payer, connection } = await API.payer();

//   const name = 'DigitalAsset';
//   const symbol = 'DA';
//   const uri = 'uri';

//   const collectionParent = new Keypair();
//   const newCollectionParent = new Keypair();

//   // Create the initial asset and ensure it was created successfully
//   const assetData: AssetData = {
//     name,
//     symbol,
//     uri,
//     sellerFeeBasisPoints: 0,
//     updateAuthority: payer.publicKey,
//     creators: [
//       {
//         address: payer.publicKey,
//         share: 100,
//         verified: false,
//       },
//     ],
//     primarySaleHappened: false,
//     isMutable: true,
//     editionNonce: null,
//     tokenStandard: TokenStandard.NonFungible,
//     collection: { key: collectionParent.publicKey, verified: false },
//     uses: null,
//     collectionDetails: null,
//     programmableConfig: null,
//     delegateState: null,
//   };

//   const {
//     tx: createTx,
//     mint,
//     metadata,
//     masterEdition,
//   } = await API.create(t, payer, assetData, 0, 0, handler);
//   await createTx.assertSuccess(t);

//   // Call VERIFY on the collection

//   const createdMetadata = await Metadata.fromAccountAddress(connection, metadata);
//   spok(t, createdMetadata, {
//     collection: {
//       key: collectionParent.publicKey,
//       verified: true,
//     },
//   });

//   const updateData = new UpdateTestData();
//   updateData.collection = { key: newCollectionParent.publicKey, verified: true };

//   const { tx: updateTx } = await API.update(
//     t,
//     payer,
//     mint,
//     metadata,
//     masterEdition,
//     updateData,
//     handler,
//   );
//   await updateTx.assertError(t, /Collection cannot be verified in this instruction/);
// });

test('Update: Update a ProgrammableNonFungible', async (t) => {
  const API = new InitTransactions();
  const { fstTxHandler: handler, payerPair: payer, connection } = await API.payer();
  const daManager = await createDefaultAsset(
    t,
    API,
    handler,
    payer,
    TokenStandard.ProgrammableNonFungible,
  );
  const { mint, metadata, masterEdition } = daManager;

  const updateData = new UpdateTestData();
  updateData.data = {
    name: 'new-name',
    symbol: 'new-symbol',
    uri: 'new-uri',
    sellerFeeBasisPoints: 500,
    creators: null,
  };

  const { tx: updateTx } = await API.update(
    t,
    payer,
    mint,
    metadata,
    masterEdition,
    updateData,
    handler,
  );
  await updateTx.assertSuccess(t);

  const updatedMetadata = await Metadata.fromAccountAddress(connection, metadata);
  spok(t, updatedMetadata.data, {
    sellerFeeBasisPoints: updateData.data.sellerFeeBasisPoints,
    creators: updateData.data.creators,
  });

  t.equal(updatedMetadata.data.name.replace(/\0+/, ''), updateData.data.name);
  t.equal(updatedMetadata.data.symbol.replace(/\0+/, ''), updateData.data.symbol);
  t.equal(updatedMetadata.data.uri.replace(/\0+/, ''), updateData.data.uri);
});

test('Update: Invalid Update Authority Fails', async (t) => {
  const API = new InitTransactions();
  const { fstTxHandler: handler, payerPair: payer } = await API.payer();

  const daManager = await createDefaultAsset(t, API, handler, payer);
  const { mint, metadata, masterEdition } = daManager;

  const invalidUpdateAuthority = new Keypair();

  // Flip to true
  const updateData = new UpdateTestData();
  updateData.data = {
    name: 'fake name',
    symbol: 'fake',
    uri: 'fake uri',
    sellerFeeBasisPoints: 500,
    creators: null,
  };

  const { tx: updateTx } = await API.update(
    t,
    invalidUpdateAuthority,
    mint,
    metadata,
    masterEdition,
    updateData,
    handler,
  );
  await updateTx.assertError(t, /Update Authority given does not match/);
});
