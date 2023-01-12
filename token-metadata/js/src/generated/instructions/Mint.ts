/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as beet from '@metaplex-foundation/beet';
import * as web3 from '@solana/web3.js';
import { MintArgs, mintArgsBeet } from '../types/MintArgs';

/**
 * @category Instructions
 * @category Mint
 * @category generated
 */
export type MintInstructionArgs = {
  mintArgs: MintArgs;
};
/**
 * @category Instructions
 * @category Mint
 * @category generated
 */
export const MintStruct = new beet.FixableBeetArgsStruct<
  MintInstructionArgs & {
    instructionDiscriminator: number;
  }
>(
  [
    ['instructionDiscriminator', beet.u8],
    ['mintArgs', mintArgsBeet],
  ],
  'MintInstructionArgs',
);
/**
 * Accounts required by the _Mint_ instruction
 *
 * @property [_writable_] token Token or Associated Token account
 * @property [] tokenOwner (optional) Owner of the token account
 * @property [] metadata Metadata account (pda of ['metadata', program id, mint id])
 * @property [] masterEdition (optional) Master Edition account
 * @property [_writable_] tokenRecord (optional) Token record account
 * @property [_writable_] mint Mint of token asset
 * @property [**signer**] authority (Mint or Update) authority
 * @property [] delegateRecord (optional) Metadata delegate record
 * @property [_writable_, **signer**] payer Payer
 * @property [] sysvarInstructions Instructions sysvar account
 * @property [] splTokenProgram SPL Token program
 * @property [] splAtaProgram SPL Associated Token Account program
 * @property [] authorizationRulesProgram (optional) Token Authorization Rules program
 * @property [] authorizationRules (optional) Token Authorization Rules account
 * @category Instructions
 * @category Mint
 * @category generated
 */
export type MintInstructionAccounts = {
  token: web3.PublicKey;
  tokenOwner?: web3.PublicKey;
  metadata: web3.PublicKey;
  masterEdition?: web3.PublicKey;
  tokenRecord?: web3.PublicKey;
  mint: web3.PublicKey;
  authority: web3.PublicKey;
  delegateRecord?: web3.PublicKey;
  payer: web3.PublicKey;
  systemProgram?: web3.PublicKey;
  sysvarInstructions: web3.PublicKey;
  splTokenProgram: web3.PublicKey;
  splAtaProgram: web3.PublicKey;
  authorizationRulesProgram?: web3.PublicKey;
  authorizationRules?: web3.PublicKey;
};

export const mintInstructionDiscriminator = 43;

/**
 * Creates a _Mint_ instruction.
 *
 * Optional accounts that are not provided default to the program ID since
 * this was indicated in the IDL from which this instruction was generated.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @param args to provide as instruction data to the program
 *
 * @category Instructions
 * @category Mint
 * @category generated
 */
export function createMintInstruction(
  accounts: MintInstructionAccounts,
  args: MintInstructionArgs,
  programId = new web3.PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'),
) {
  const [data] = MintStruct.serialize({
    instructionDiscriminator: mintInstructionDiscriminator,
    ...args,
  });
  const keys: web3.AccountMeta[] = [
    {
      pubkey: accounts.token,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.tokenOwner ?? programId,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.metadata,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.masterEdition ?? programId,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.tokenRecord ?? programId,
      isWritable: accounts.tokenRecord != null,
      isSigner: false,
    },
    {
      pubkey: accounts.mint,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.authority,
      isWritable: false,
      isSigner: true,
    },
    {
      pubkey: accounts.delegateRecord ?? programId,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.payer,
      isWritable: true,
      isSigner: true,
    },
    {
      pubkey: accounts.systemProgram ?? web3.SystemProgram.programId,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.sysvarInstructions,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.splTokenProgram,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.splAtaProgram,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.authorizationRulesProgram ?? programId,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.authorizationRules ?? programId,
      isWritable: false,
      isSigner: false,
    },
  ];

  const ix = new web3.TransactionInstruction({
    programId,
    keys,
    data,
  });
  return ix;
}
