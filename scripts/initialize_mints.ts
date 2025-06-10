import { Program, AnchorProvider, web3, BN, Idl } from "@project-serum/anchor";
import { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import idl from "../idl/savefi.json";

const programId = new PublicKey("32AnNoCjBdwxXNCqfJGCiCzoMJkBMLjSGHN63GNa348L");
const provider = AnchorProvider.env();
const program = new Program(idl as Idl, programId, provider);

async function initializeMints() {
  try {
    const saveSolTokenAccount = new PublicKey("6jeeCrTq1iNZaKQ4nU6YG6zHtH5WwNrAYQDk2VAinTvx"); // Replace with new ATA
    const admin = new PublicKey("3tiC8HXUKeCQVZiuvGVDfjr5FiQkANzN8Gz2xA5cNzST");

    const [mintAuthority] = await PublicKey.findProgramAddressSync(
      [Buffer.from("mint_authority")],
      programId
    );
    const [feeAccount] = await PublicKey.findProgramAddressSync(
      [Buffer.from("fee_account")],
      programId
    );

    const discriminator = Buffer.from([189, 84, 85, 142, 177, 200, 57, 22]);
    const data = Buffer.concat([discriminator, Buffer.from([1])]);

    const instruction = new web3.TransactionInstruction({
      keys: [
        { pubkey: mintAuthority, isSigner: false, isWritable: true },
        { pubkey: feeAccount, isSigner: false, isWritable: true },
        { pubkey: saveSolTokenAccount, isSigner: false, isWritable: true },
        { pubkey: admin, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
      ],
      programId,
      data,
    });

    const transaction = new web3.Transaction().add(instruction);
    await provider.sendAndConfirm(transaction, []);

    console.log("initialize_mints executed successfully!");
    console.log(`Mint Authority PDA: ${mintAuthority.toBase58()}`);
    console.log(`Fee Account PDA: ${feeAccount.toBase58()}`);
  } catch (error) {
    console.error("Error executing initialize_mints:", error);
  }
}

initializeMints();