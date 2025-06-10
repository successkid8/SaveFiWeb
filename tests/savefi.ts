import * as anchor from "@project-serum/anchor";
import { Program, Idl } from "@project-serum/anchor";
import { Savefi } from "../target/types/savefi";
import { PublicKey, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { expect } from "chai";

describe("savefi", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Savefi as Program<Idl>;
  const wallet = provider.wallet as anchor.Wallet;

  // Generate keypairs for our accounts
  const mintAuthority = anchor.web3.Keypair.generate();
  const feeAccount = anchor.web3.Keypair.generate();
  const saveTokenMint = anchor.web3.Keypair.generate();
  const saveRewardMint = anchor.web3.Keypair.generate();

  // PDA for vault
  const [vaultPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("vault"), wallet.publicKey.toBuffer()],
    program.programId
  );

  // Associated token accounts
  let vaultTokenAccount: PublicKey;
  let userSaveTokenAccount: PublicKey;

  before(async () => {
    // Initialize mints
    const tx = await program.methods
      .initializeMints()
      .accounts({
        mintAuthority: mintAuthority.publicKey,
        feeAccount: feeAccount.publicKey,
        saveTokenMint: saveTokenMint.publicKey,
        saveRewardMint: saveRewardMint.publicKey,
        admin: wallet.publicKey,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([mintAuthority, feeAccount, saveTokenMint, saveRewardMint])
      .rpc();

    // Get associated token accounts
    vaultTokenAccount = await anchor.utils.token.associatedAddress({
      mint: saveTokenMint.publicKey,
      owner: vaultPda,
    });

    userSaveTokenAccount = await anchor.utils.token.associatedAddress({
      mint: saveRewardMint.publicKey,
      owner: wallet.publicKey,
    });
  });

  it("Initializes a vault", async () => {
    const saveRate = 10; // 10%

    const tx = await program.methods
      .initializeVault(saveRate)
      .accounts({
        vault: vaultPda,
        vaultTokenAccount,
        saveTokenMint: saveTokenMint.publicKey,
        user: wallet.publicKey,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      })
      .rpc();

    const vaultAccount = await program.account.vault.fetch(vaultPda);
    expect(vaultAccount.owner.toString()).to.equal(wallet.publicKey.toString());
    expect(vaultAccount.saveRate).to.equal(saveRate);
    expect(vaultAccount.balance.toString()).to.equal("0");
    expect(vaultAccount.saveTokenBalance.toString()).to.equal("0");
  });

  it("Saves funds to the vault", async () => {
    const tradeAmount = new anchor.BN(1 * LAMPORTS_PER_SOL); // 1 SOL

    const tx = await program.methods
      .save(tradeAmount)
      .accounts({
        vault: vaultPda,
        user: wallet.publicKey,
        vaultTokenAccount,
        userSaveTokenAccount,
        saveTokenMint: saveTokenMint.publicKey,
        saveRewardMint: saveRewardMint.publicKey,
        mintAuthority: mintAuthority.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

    const vaultAccount = await program.account.vault.fetch(vaultPda);
    expect(vaultAccount.balance.toString()).to.equal("100000000"); // 0.1 SOL (10% of 1 SOL)
    expect(vaultAccount.saveTokenBalance.toString()).to.equal("0"); // No save tokens for small amounts
  });

  it("Fails to withdraw before lock period", async () => {
    try {
      await program.methods
        .withdraw()
        .accounts({
          vault: vaultPda,
          user: wallet.publicKey,
          vaultTokenAccount,
          saveTokenMint: saveTokenMint.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      expect.fail("Should have thrown an error");
    } catch (err) {
      expect(err.toString()).to.include("VaultLocked");
    }
  });

  // Note: Testing the transfer hook would require additional setup with SPL Token 2022
  // and is more complex to test in this environment
}); 