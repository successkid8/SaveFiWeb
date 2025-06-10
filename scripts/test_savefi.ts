import { Program, AnchorProvider, web3, BN, Idl } from "@project-serum/anchor";
import { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from "@solana/spl-token";
import idl from "../idl/savefi.json";

const programId = new PublicKey("32AnNoCjBdwxXNCqfJGCiCzoMJkBMLjSGHN63GNa348L");
const provider = AnchorProvider.env();
const program = new Program(idl as Idl, programId, provider);

async function testInitializeVault() {
  try {
    const user = new PublicKey("3tiC8HXUKeCQVZiuvGVDfjr5FiQkANzN8Gz2xA5cNzST"); // ANCHOR_WALLET pubkey
    const saveSolMint = new PublicKey("EECHHUd7SVjLsuFztRC33pEhGKjw261iiy9ZMCavSmJt");

    // Check user wallet balance
    const balance = await provider.connection.getBalance(user);
    console.log("User wallet:", user.toBase58(), "Balance:", balance / 1_000_000_000, "SOL");
    if (balance < 1_000_000_000) throw new Error("Insufficient SOL in wallet");

    // Derive PDAs
    const [vault] = await PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), user.toBuffer()],
      programId
    );
    const [proxyAccount] = await PublicKey.findProgramAddressSync(
      [Buffer.from("proxy"), user.toBuffer()],
      programId
    );

    // Get vault’s SaveSOL ATA
    const vaultSaveSolATA = await getAssociatedTokenAddress(saveSolMint, vault, true);

    // Test: Initialize Vault (10% savings, 14-day lock)
    console.log("Initializing vault...");
    const discriminator = Buffer.from([48, 191, 163, 44, 71, 129, 63, 164]);
    const data = Buffer.concat([
      discriminator,
      Buffer.from([10]), // save_rate (u8)
      Buffer.from([14]), // lock_days (u8)
    ]);

    const instruction = new web3.TransactionInstruction({
      keys: [
        { pubkey: vault, isSigner: false, isWritable: true },
        { pubkey: proxyAccount, isSigner: false, isWritable: true },
        { pubkey: vaultSaveSolATA, isSigner: false, isWritable: true },
        { pubkey: saveSolMint, isSigner: false, isWritable: true },
        { pubkey: user, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      ],
      programId,
      data,
    });

    const transaction = new web3.Transaction().add(instruction);
    await provider.sendAndConfirm(transaction, []);

    console.log("Vault initialized:", vault.toBase58());
    console.log("Test passed!");
  } catch (error) {
    console.error("Test failed:", error);
  }
}

testInitializeVault();