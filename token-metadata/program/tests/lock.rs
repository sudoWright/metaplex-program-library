#![cfg(feature = "test-bpf")]
pub mod utils;

use num_traits::FromPrimitive;
use solana_program_test::*;
use utils::*;

mod lock {

    use mpl_token_metadata::{
        error::MetadataError,
        instruction::DelegateArgs,
        pda::find_token_record_account,
        state::{TokenRecord, TokenStandard, TokenState},
    };
    use solana_program::{
        borsh::try_from_slice_unchecked, native_token::LAMPORTS_PER_SOL, program_option::COption,
        program_pack::Pack,
    };
    use solana_sdk::signature::{Keypair, Signer};
    use solana_sdk::{instruction::InstructionError, transaction::TransactionError};
    use spl_token::state::Account;

    use super::*;

    #[tokio::test]
    async fn fail_owner_lock_programmable_nonfungible() {
        let mut context = program_test().start_with_context().await;

        // asset

        let mut asset = DigitalAsset::default();
        asset
            .create_and_mint(
                &mut context,
                TokenStandard::ProgrammableNonFungible,
                None,
                None,
                1,
            )
            .await
            .unwrap();

        // asserts

        let (pda_key, _) = find_token_record_account(&asset.mint.pubkey(), &context.payer.pubkey());

        let pda = get_account(&mut context, &pda_key).await;
        let token_record: TokenRecord = try_from_slice_unchecked(&pda.data).unwrap();

        assert_eq!(token_record.state, TokenState::Unlocked);

        // locks

        let approver = Keypair::from_bytes(&context.payer.to_bytes()).unwrap();
        let payer = Keypair::from_bytes(&context.payer.to_bytes()).unwrap();

        let error = asset
            .lock(&mut context, approver, Some(pda_key), payer)
            .await
            .unwrap_err();

        // asserts

        assert_custom_error!(error, MetadataError::InvalidAuthorityType);
    }

    #[tokio::test]
    async fn fail_owner_lock_nonfungible() {
        let mut context = program_test().start_with_context().await;

        // asset

        let mut asset = DigitalAsset::default();
        asset
            .create_and_mint(&mut context, TokenStandard::NonFungible, None, None, 1)
            .await
            .unwrap();

        // asserts

        let token_account = get_account(&mut context, &asset.token.unwrap()).await;
        let token = Account::unpack(&token_account.data).unwrap();
        // should not be frozen
        assert!(!token.is_frozen());

        // lock the token

        let approver = Keypair::from_bytes(&context.payer.to_bytes()).unwrap();
        let payer = Keypair::from_bytes(&context.payer.to_bytes()).unwrap();

        let error = asset
            .lock(&mut context, approver, None, payer)
            .await
            .unwrap_err();

        assert_custom_error!(error, MetadataError::InvalidAuthorityType);
    }

    #[tokio::test]
    async fn delegate_lock_programmable_nonfungible() {
        let mut context = program_test().start_with_context().await;

        // asset

        let mut asset = DigitalAsset::default();
        asset
            .create_and_mint(
                &mut context,
                TokenStandard::ProgrammableNonFungible,
                None,
                None,
                1,
            )
            .await
            .unwrap();

        // asserts

        let (pda_key, _) = find_token_record_account(&asset.mint.pubkey(), &context.payer.pubkey());

        let pda = get_account(&mut context, &pda_key).await;
        let token_record: TokenRecord = try_from_slice_unchecked(&pda.data).unwrap();

        assert_eq!(token_record.state, TokenState::Unlocked);

        // set a utility delegate

        let delegate = Keypair::new();
        let delegate_pubkey = delegate.pubkey();
        let payer = Keypair::from_bytes(&context.payer.to_bytes()).unwrap();

        asset
            .delegate(
                &mut context,
                payer,
                delegate_pubkey,
                DelegateArgs::UtilityV1 {
                    amount: 1,
                    authorization_data: None,
                },
            )
            .await
            .unwrap();

        // locks

        let payer = Keypair::from_bytes(&context.payer.to_bytes()).unwrap();

        asset
            .lock(&mut context, delegate, Some(pda_key), payer)
            .await
            .unwrap();

        // asserts

        let token_account = get_account(&mut context, &asset.token.unwrap()).await;
        let token = Account::unpack(&token_account.data).unwrap();
        // should not be frozen
        assert!(token.is_frozen());
    }

    #[tokio::test]
    async fn delegate_lock_nonfungible() {
        let mut context = program_test().start_with_context().await;

        // asset

        let mut asset = DigitalAsset::default();
        asset
            .create_and_mint(&mut context, TokenStandard::NonFungible, None, None, 1)
            .await
            .unwrap();

        // asserts

        let token_account = get_account(&mut context, &asset.token.unwrap()).await;
        let token = Account::unpack(&token_account.data).unwrap();
        // should not be frozen
        assert!(!token.is_frozen());

        // set a utility delegate

        let delegate = Keypair::new();
        let delegate_pubkey = delegate.pubkey();
        let payer = Keypair::from_bytes(&context.payer.to_bytes()).unwrap();

        asset
            .delegate(
                &mut context,
                payer,
                delegate_pubkey,
                DelegateArgs::UtilityV1 {
                    amount: 1,
                    authorization_data: None,
                },
            )
            .await
            .unwrap();

        // lock the token

        let payer = Keypair::from_bytes(&context.payer.to_bytes()).unwrap();

        asset
            .lock(&mut context, delegate, None, payer)
            .await
            .unwrap();

        // asserts

        let token_account = get_account(&mut context, &asset.token.unwrap()).await;
        let token = Account::unpack(&token_account.data).unwrap();
        // should not be frozen
        assert!(token.is_frozen());
    }

    #[tokio::test]
    async fn locked_programmable_nonfungible_delegate_fails() {
        let mut context = program_test().start_with_context().await;

        // asset

        let mut asset = DigitalAsset::default();
        asset
            .create_and_mint(
                &mut context,
                TokenStandard::ProgrammableNonFungible,
                None,
                None,
                1,
            )
            .await
            .unwrap();

        // asserts

        let (pda_key, _) = find_token_record_account(&asset.mint.pubkey(), &context.payer.pubkey());

        let pda = get_account(&mut context, &pda_key).await;
        let token_record: TokenRecord = try_from_slice_unchecked(&pda.data).unwrap();

        assert_eq!(token_record.state, TokenState::Unlocked);

        // set a utility delegate

        let delegate = Keypair::new();
        let delegate_pubkey = delegate.pubkey();
        let payer = Keypair::from_bytes(&context.payer.to_bytes()).unwrap();

        asset
            .delegate(
                &mut context,
                payer,
                delegate_pubkey,
                DelegateArgs::UtilityV1 {
                    amount: 1,
                    authorization_data: None,
                },
            )
            .await
            .unwrap();

        // locks

        let payer = Keypair::from_bytes(&context.payer.to_bytes()).unwrap();

        asset
            .lock(&mut context, delegate, Some(pda_key), payer)
            .await
            .unwrap();

        // asserts

        let pda = get_account(&mut context, &pda_key).await;
        let token_record: TokenRecord = try_from_slice_unchecked(&pda.data).unwrap();

        assert_eq!(token_record.state, TokenState::Locked);

        // delegates the asset for transfer (this should fail since the token is locked)

        let another_delegate = Keypair::new();
        let delegate_pubkey = another_delegate.pubkey();
        let payer = Keypair::from_bytes(&context.payer.to_bytes()).unwrap();

        let error = asset
            .delegate(
                &mut context,
                payer,
                delegate_pubkey,
                DelegateArgs::TransferV1 {
                    amount: 1,
                    authorization_data: None,
                },
            )
            .await
            .unwrap_err();

        assert_custom_error!(error, MetadataError::LockedToken);
    }
}