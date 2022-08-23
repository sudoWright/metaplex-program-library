/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as splToken from '@solana/spl-token';
import * as beet from '@metaplex-foundation/beet';
import * as web3 from '@solana/web3.js';

/**
 * @category Instructions
 * @category AuctioneerPublicBuy
 * @category generated
 */
export type AuctioneerPublicBuyInstructionArgs = {
  tradeStateBump: number;
  escrowPaymentBump: number;
  buyerPrice: beet.bignum;
  tokenSize: beet.bignum;
};
/**
 * @category Instructions
 * @category AuctioneerPublicBuy
 * @category generated
 */
const auctioneerPublicBuyStruct = new beet.BeetArgsStruct<
  AuctioneerPublicBuyInstructionArgs & {
    instructionDiscriminator: number[] /* size: 8 */;
  }
>(
  [
    ['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['tradeStateBump', beet.u8],
    ['escrowPaymentBump', beet.u8],
    ['buyerPrice', beet.u64],
    ['tokenSize', beet.u64],
  ],
  'AuctioneerPublicBuyInstructionArgs',
);
/**
 * Accounts required by the _auctioneerPublicBuy_ instruction
 *
 * @property [**signer**] wallet
 * @property [_writable_] paymentAccount
 * @property [] transferAuthority
 * @property [] treasuryMint
 * @property [] tokenAccount
 * @property [] metadata
 * @property [_writable_] escrowPaymentAccount
 * @property [] authority
 * @property [**signer**] auctioneerAuthority
 * @property [] auctionHouse
 * @property [_writable_] auctionHouseFeeAccount
 * @property [_writable_] buyerTradeState
 * @property [] ahAuctioneerPda
 * @category Instructions
 * @category AuctioneerPublicBuy
 * @category generated
 */
export type AuctioneerPublicBuyInstructionAccounts = {
  wallet: web3.PublicKey;
  paymentAccount: web3.PublicKey;
  transferAuthority: web3.PublicKey;
  treasuryMint: web3.PublicKey;
  tokenAccount: web3.PublicKey;
  metadata: web3.PublicKey;
  escrowPaymentAccount: web3.PublicKey;
  authority: web3.PublicKey;
  auctioneerAuthority: web3.PublicKey;
  auctionHouse: web3.PublicKey;
  auctionHouseFeeAccount: web3.PublicKey;
  buyerTradeState: web3.PublicKey;
  ahAuctioneerPda: web3.PublicKey;
};

const auctioneerPublicBuyInstructionDiscriminator = [221, 239, 99, 240, 86, 46, 213, 126];

/**
 * Creates a _AuctioneerPublicBuy_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @param args to provide as instruction data to the program
 *
 * @category Instructions
 * @category AuctioneerPublicBuy
 * @category generated
 */
export function createAuctioneerPublicBuyInstruction(
  accounts: AuctioneerPublicBuyInstructionAccounts,
  args: AuctioneerPublicBuyInstructionArgs,
) {
  const {
    wallet,
    paymentAccount,
    transferAuthority,
    treasuryMint,
    tokenAccount,
    metadata,
    escrowPaymentAccount,
    authority,
    auctioneerAuthority,
    auctionHouse,
    auctionHouseFeeAccount,
    buyerTradeState,
    ahAuctioneerPda,
  } = accounts;

  const [data] = auctioneerPublicBuyStruct.serialize({
    instructionDiscriminator: auctioneerPublicBuyInstructionDiscriminator,
    ...args,
  });
  const keys: web3.AccountMeta[] = [
    {
      pubkey: wallet,
      isWritable: false,
      isSigner: true,
    },
    {
      pubkey: paymentAccount,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: transferAuthority,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: treasuryMint,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: tokenAccount,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: metadata,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: escrowPaymentAccount,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: authority,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: auctioneerAuthority,
      isWritable: false,
      isSigner: true,
    },
    {
      pubkey: auctionHouse,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: auctionHouseFeeAccount,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: buyerTradeState,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: ahAuctioneerPda,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: splToken.TOKEN_PROGRAM_ID,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: web3.SystemProgram.programId,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: web3.SYSVAR_RENT_PUBKEY,
      isWritable: false,
      isSigner: false,
    },
  ];

  const ix = new web3.TransactionInstruction({
    programId: new web3.PublicKey('hausS13jsjafwWwGqZTUQRmWyvyxn9EQpqMwV1PBBmk'),
    keys,
    data,
  });
  return ix;
}