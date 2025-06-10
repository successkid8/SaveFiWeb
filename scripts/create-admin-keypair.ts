import { Keypair } from '@solana/web3.js';
import * as fs from 'fs';

async function main() {
  // Generate a new keypair
  const adminKeypair = Keypair.generate();
  
  // Save the keypair to a file
  fs.writeFileSync(
    './admin-keypair.json',
    JSON.stringify(Array.from(adminKeypair.secretKey))
  );

  console.log('Admin keypair generated and saved to admin-keypair.json');
  console.log('Public Key:', adminKeypair.publicKey.toBase58());
  console.log('Please fund this account with some SOL on devnet');
}

main().then(
  () => process.exit(0),
  (err) => {
    console.error(err);
    process.exit(1);
  }
); 