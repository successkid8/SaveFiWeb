import { FC, useEffect, useState, ChangeEvent, forwardRef } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { AnchorProvider, web3, BN } from '@project-serum/anchor';
import { PublicKey, LAMPORTS_PER_SOL, SystemProgram } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token';
import { IDL } from '../utils/idl';
import { useToast } from './Toast';
import { getProgram, getVaultPDA, getVaultTokenAccount, SAVE_TOKEN_MINT, SAVE_REWARD_MINT, getSaveSOLTokenAccountPDA } from '../utils/program';
import { 
    SAVESOL_MINT, 
    SAVESOL_DECIMALS, 
    formatTokenBalance, 
    convertToTokenAmount,
    getAssociatedTokenAddress,
    isToken2022Mint
} from '../utils/tokens';
import { Toast } from './Toast';
import { ClientOnly } from './ClientOnly';

interface VaultAccount {
  owner: PublicKey;
  saveRate: number;
  balance: number;
  lockUntil: number;
  saveTokenBalance: number;
}

interface VaultInfo {
  owner: PublicKey;
  saveRate: number;
  totalSaved: number;
  lastWithdrawTime: number;
}

interface Transaction {
  type: 'save' | 'withdraw' | 'initialize';
  amount: number;
  timestamp: number;
  signature: string;
}

const VaultStats: FC<{ vaultInfo: VaultInfo }> = ({ vaultInfo }) => {
  const timeUntilUnlock = vaultInfo.lockUntil - Date.now() / 1000;
  const daysRemaining = Math.ceil(timeUntilUnlock / (24 * 60 * 60));
  
  return (
    <div className="grid grid-cols-2 gap-4 mb-4">
      <div className="p-4 bg-gray-100 rounded shadow">
        <h3 className="font-semibold text-gray-700">Total Saved</h3>
        <p className="text-xl font-bold">{(vaultInfo.totalSaved / LAMPORTS_PER_SOL).toFixed(4)} SOL</p>
      </div>
      <div className="p-4 bg-gray-100 rounded shadow">
        <h3 className="font-semibold text-gray-700">Lock Period</h3>
        <p className="text-xl font-bold">{daysRemaining} days remaining</p>
      </div>
      <div className="p-4 bg-gray-100 rounded shadow">
        <h3 className="font-semibold text-gray-700">Save Rate</h3>
        <p className="text-xl font-bold">{vaultInfo.saveRate}%</p>
      </div>
      <div className="p-4 bg-gray-100 rounded shadow">
        <h3 className="font-semibold text-gray-700">Reward Tokens</h3>
        <p className="text-xl font-bold">{vaultInfo.saveTokenBalance} $SAVE</p>
      </div>
    </div>
  );
};

const SaveRateSelector: FC<{ 
  currentRate: number, 
  onRateChange: (rate: number) => void 
}> = ({ currentRate, onRateChange }) => {
  const [previewAmount, setPreviewAmount] = useState(1);
  
  return (
    <div className="mb-6 p-4 bg-white rounded shadow">
      <label className="block text-lg font-semibold mb-2">Save Rate: {currentRate}%</label>
      <input
        type="range"
        min="1"
        max="20"
        value={currentRate}
        onChange={(e) => onRateChange(Number(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
      />
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Preview Amount</label>
        <input
          type="number"
          value={previewAmount}
          onChange={(e) => setPreviewAmount(Number(e.target.value))}
          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
          min="0.1"
          step="0.1"
        />
        <p className="mt-2 text-sm text-gray-600">
          Preview: {(previewAmount * currentRate / 100).toFixed(4)} SOL will be saved
        </p>
      </div>
    </div>
  );
};

export const VaultManager = forwardRef((props, ref) => {
  const { publicKey, signTransaction, signAllTransactions } = useWallet();
  const { connection } = useConnection();
  const [vaultInfo, setVaultInfo] = useState<VaultInfo | null>(null);
  const [saveRate, setSaveRate] = useState(10);
  const [amount, setAmount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initError, setInitError] = useState<string | null>(null);
  const [transactionStatus, setTransactionStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<() => Promise<void>>();
  const { showToast } = useToast();
  const [savesolBalance, setSavesolBalance] = useState<number>(0);

  const handleError = (err: any) => {
    if (err.message.includes('VaultLocked')) {
      return 'Your vault is still locked. Please wait until the lock period ends.';
    }
    if (err.message.includes('InsufficientFunds')) {
      return 'You don\'t have enough SOL to perform this action.';
    }
    if (err.message.includes('Account does not exist')) {
      return 'Vault account not found. Please initialize your vault first.';
    }
    if (err.message.includes('invalid account data for instruction')) {
      if (err.message.includes('save_token_mint')) {
        return 'The wrapped SOL token mint (5gcNeRnVUTtZREhyx9dgqR5y3vdoRebR3DtHEgYDPcba) is not initialized. Please contact the admin to initialize the token mints first.';
      }
      return 'One or more accounts are not properly initialized. Please try again.';
    }
    if (err.message.includes('SendTransactionError')) {
      return 'Transaction failed. Please check your wallet and try again.';
    }
    return err.message || 'An unexpected error occurred';
  };

  const addTransaction = (tx: Transaction) => {
    setTransactions(prev => [tx, ...prev].slice(0, 10));
  };

  const validateAmount = (amount: number) => {
    if (amount <= 0) return 'Amount must be greater than 0';
    if (amount > 1000) return 'Amount cannot exceed 1000 SOL';
    return null;
  };

  const handleAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    const error = validateAmount(value);
    if (!error) {
      setAmount(value);
      setError(null);
    } else {
      setError(error);
    }
  };

  const confirmAction = (action: () => Promise<void>) => {
    setPendingAction(() => action);
    setShowConfirmModal(true);
  };

  const trackTransaction = async (signature: string, type: 'save' | 'withdraw' | 'initialize', amount: number) => {
    setTransactionStatus('pending');
    try {
      const connection = new web3.Connection(web3.clusterApiUrl('devnet'));
      await connection.confirmTransaction(signature);
      setTransactionStatus('success');
      
      addTransaction({
        type,
        amount,
        timestamp: Date.now(),
        signature,
      });
      
      showToast(`Transaction successful: ${type}`, 'success');
    } catch (err) {
      setTransactionStatus('error');
      showToast(`Transaction failed: ${handleError(err)}`, 'error');
    }
  };

  const fetchVaultData = async () => {
    if (!publicKey) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch vault info
      const [vaultPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('vault'), publicKey.toBuffer()],
        getProgram(new AnchorProvider(
          new web3.Connection(web3.clusterApiUrl('devnet')),
          { publicKey, signTransaction, signAllTransactions },
          { commitment: 'confirmed' }
        )).programId
      );

      const vaultAccount = await getProgram(new AnchorProvider(
        new web3.Connection(web3.clusterApiUrl('devnet')),
        { publicKey, signTransaction, signAllTransactions },
        { commitment: 'confirmed' }
      )).account.vault.fetch(vaultPda);
      setVaultInfo({
        owner: vaultAccount.owner,
        saveRate: vaultAccount.saveRate,
        totalSaved: Number(vaultAccount.totalSaved),
        lastWithdrawTime: Number(vaultAccount.lastWithdrawTime),
      });

      // Fetch SaveSOL balance
      const tokenAccount = await getAssociatedTokenAddress(SAVESOL_MINT, publicKey);
      const balance = await connection.getTokenAccountBalance(tokenAccount);
      setSavesolBalance(Number(balance.value.amount));

    } catch (err) {
      console.error('Error fetching vault data:', err);
      setError('Failed to fetch vault data');
    } finally {
      setLoading(false);
    }
  };

  const initializeVault = async (saveRate: number, lockPeriod: number) => {
    if (!publicKey) return;

    try {
      setLoading(true);
      setError(null);

      const [vaultPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('vault'), publicKey.toBuffer()],
        getProgram(new AnchorProvider(
          new web3.Connection(web3.clusterApiUrl('devnet')),
          { publicKey, signTransaction, signAllTransactions },
          { commitment: 'confirmed' }
        )).programId
      );

      const [mintAuthorityPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('mint_authority')],
        getProgram(new AnchorProvider(
          new web3.Connection(web3.clusterApiUrl('devnet')),
          { publicKey, signTransaction, signAllTransactions },
          { commitment: 'confirmed' }
        )).programId
      );

      const tokenAccount = await getAssociatedTokenAddress(SAVESOL_MINT, publicKey);

      await getProgram(new AnchorProvider(
        new web3.Connection(web3.clusterApiUrl('devnet')),
        { publicKey, signTransaction, signAllTransactions },
        { commitment: 'confirmed' }
      )).methods
        .initializeVault(saveRate, lockPeriod)
        .accounts({
          vault: vaultPda,
          owner: publicKey,
          mintAuthority: mintAuthorityPda,
          savesolMint: SAVESOL_MINT,
          userTokenAccount: tokenAccount,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_2022_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        })
        .rpc();

      setError(null);
      showToast('Vault initialized successfully!', 'success');
      await fetchVaultData();

    } catch (err) {
      console.error('Error initializing vault:', err);
      setError('Failed to initialize vault');
    } finally {
      setLoading(false);
    }
  };

  const processTrade = async (amount: number) => {
    if (!publicKey || !vaultInfo) return;

    try {
      setLoading(true);
      setError(null);

      const [vaultPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('vault'), publicKey.toBuffer()],
        getProgram(new AnchorProvider(
          new web3.Connection(web3.clusterApiUrl('devnet')),
          { publicKey, signTransaction, signAllTransactions },
          { commitment: 'confirmed' }
        )).programId
      );

      const [mintAuthorityPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('mint_authority')],
        getProgram(new AnchorProvider(
          new web3.Connection(web3.clusterApiUrl('devnet')),
          { publicKey, signTransaction, signAllTransactions },
          { commitment: 'confirmed' }
        )).programId
      );

      const tokenAccount = await getAssociatedTokenAddress(SAVESOL_MINT, publicKey);

      await getProgram(new AnchorProvider(
        new web3.Connection(web3.clusterApiUrl('devnet')),
        { publicKey, signTransaction, signAllTransactions },
        { commitment: 'confirmed' }
      )).methods
        .processTrade(new BN(convertToTokenAmount(amount)))
        .accounts({
          vault: vaultPda,
          owner: publicKey,
          mintAuthority: mintAuthorityPda,
          savesolMint: SAVESOL_MINT,
          userTokenAccount: tokenAccount,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_2022_PROGRAM_ID,
        })
        .rpc();

      setError(null);
      showToast('Trade processed successfully!', 'success');
      await fetchVaultData();

    } catch (err) {
      console.error('Error processing trade:', err);
      setError('Failed to process trade');
    } finally {
      setLoading(false);
    }
  };

  const withdraw = async () => {
    if (!publicKey || !vaultInfo) return;

    try {
      setLoading(true);
      setError(null);

      const [vaultPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('vault'), publicKey.toBuffer()],
        getProgram(new AnchorProvider(
          new web3.Connection(web3.clusterApiUrl('devnet')),
          { publicKey, signTransaction, signAllTransactions },
          { commitment: 'confirmed' }
        )).programId
      );

      const [mintAuthorityPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('mint_authority')],
        getProgram(new AnchorProvider(
          new web3.Connection(web3.clusterApiUrl('devnet')),
          { publicKey, signTransaction, signAllTransactions },
          { commitment: 'confirmed' }
        )).programId
      );

      const tokenAccount = await getAssociatedTokenAddress(SAVESOL_MINT, publicKey);

      await getProgram(new AnchorProvider(
        new web3.Connection(web3.clusterApiUrl('devnet')),
        { publicKey, signTransaction, signAllTransactions },
        { commitment: 'confirmed' }
      )).methods
        .withdraw()
        .accounts({
          vault: vaultPda,
          owner: publicKey,
          mintAuthority: mintAuthorityPda,
          savesolMint: SAVESOL_MINT,
          userTokenAccount: tokenAccount,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_2022_PROGRAM_ID,
        })
        .rpc();

      setError(null);
      showToast('Withdrawal successful!', 'success');
      await fetchVaultData();

    } catch (err) {
      console.error('Error withdrawing:', err);
      setError('Failed to withdraw');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      if (!publicKey || !signTransaction || !signAllTransactions) return;

      try {
        // Initialize Anchor provider
        const provider = new AnchorProvider(
          new web3.Connection(web3.clusterApiUrl('devnet')),
          { publicKey, signTransaction, signAllTransactions },
          { commitment: 'confirmed' }
        );

        // Initialize program
        const program = getProgram(provider);

        // Fetch vault info if exists
        try {
          const [vaultPDA] = getVaultPDA(publicKey);
          const vault = await program.account.vault.fetch(vaultPDA);
          const v = vault as any;
          setVaultInfo({
            owner: v.owner,
            saveRate: v.save_rate,
            totalSaved: Number(v.totalSaved),
            lastWithdrawTime: Number(v.lastWithdrawTime),
          });
          setInitError(null);
        } catch (err) {
          console.log('No vault found');
          setInitError('No vault found. Please initialize your vault.');
        }
      } catch (err) {
        console.error('Failed to initialize:', err);
        setInitError('Failed to connect to the program. Please try again.');
      }
    };

    init();
  }, [publicKey, signTransaction, signAllTransactions]);

  useEffect(() => {
    fetchVaultData();
  }, [publicKey]);

  if (!publicKey) {
    return (
      <div className="p-8 text-center bg-white rounded shadow">
        <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
        <p className="text-gray-600">Please connect your wallet to manage your vault</p>
      </div>
    );
  }

  return (
    <ClientOnly>
      <div className="max-w-4xl mx-auto p-4">
        <h2 className="text-2xl font-bold mb-4">Vault Manager</h2>
        
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

        {loading ? (
          <div className="text-center p-4">
            <p className="text-gray-600">Loading...</p>
          </div>
        ) : vaultInfo ? (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-lg font-semibold mb-2">Vault Information</h3>
              <p>Total Saved: {formatTokenBalance(vaultInfo.totalSaved, SAVESOL_DECIMALS)} SOL</p>
              <p>Save Rate: {vaultInfo.saveRate}%</p>
              <p>Last Withdraw Time: {new Date(vaultInfo.lastWithdrawTime * 1000).toLocaleString()}</p>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-lg font-semibold mb-2">SaveSOL Balance</h3>
              <p>{formatTokenBalance(savesolBalance)} SaveSOL</p>
            </div>

            {!vaultInfo.isClosed && (
              <div className="space-y-4">
                <button
                  onClick={() => processTrade(1)} // Example amount
                  className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                  disabled={loading}
                >
                  Process Trade
                </button>

                {vaultInfo.lockUntil < Date.now() / 1000 && (
                  <button
                    onClick={withdraw}
                    className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
                    disabled={loading}
                  >
                    Withdraw Savings
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center p-4">
            <p className="text-gray-600">No vault found. Initialize one to start saving.</p>
            <button
              onClick={() => initializeVault(10, 7)} // Example save rate and lock period
              className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
              disabled={loading}
            >
              Initialize Vault
            </button>
          </div>
        )}
      </div>
    </ClientOnly>
  );
}); 