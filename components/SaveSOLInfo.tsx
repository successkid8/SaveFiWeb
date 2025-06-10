import { FC } from 'react';
import { SAVESOL_MINT, SAVESOL_DECIMALS } from '../utils/tokens';

export const SaveSOLInfo: FC = () => {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold mb-4">SaveSOL Token</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold mb-2">Token Information</h3>
                        <div className="space-y-2">
                            <p><span className="text-gray-600">Name:</span> SaveSOL</p>
                            <p><span className="text-gray-600">Symbol:</span> SaveSOL</p>
                            <p><span className="text-gray-600">Decimals:</span> {SAVESOL_DECIMALS}</p>
                            <p><span className="text-gray-600">Token Program:</span> Token-2022</p>
                            <p><span className="text-gray-600">Mint Address:</span> {SAVESOL_MINT.toString()}</p>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold mb-2">Key Features</h3>
                        <ul className="list-disc list-inside space-y-2">
                            <li>1:1 ratio with SOL</li>
                            <li>Non-transferable tokens</li>
                            <li>Lock period for savings</li>
                            <li>Automated savings from trades</li>
                            <li>Secure Token-2022 implementation</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">How SaveSOL Works</h3>
                <div className="space-y-4">
                    <p>
                        SaveSOL is a non-transferable token that represents your saved SOL. When you trade SOL,
                        a portion of your trade (based on your save rate) is automatically converted to SaveSOL tokens.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-4 rounded-lg shadow">
                            <h4 className="font-semibold mb-2">1. Trade</h4>
                            <p className="text-sm text-gray-600">
                                Make a trade with SOL. A portion of your trade is automatically saved.
                            </p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow">
                            <h4 className="font-semibold mb-2">2. Save</h4>
                            <p className="text-sm text-gray-600">
                                Receive SaveSOL tokens representing your saved amount. These tokens are locked for the specified period.
                            </p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow">
                            <h4 className="font-semibold mb-2">3. Withdraw</h4>
                            <p className="text-sm text-gray-600">
                                After the lock period, burn your SaveSOL tokens to withdraw your saved SOL.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Security Features</h3>
                <ul className="list-disc list-inside space-y-2">
                    <li>Built on Solana's Token-2022 program</li>
                    <li>Non-transferable tokens prevent unauthorized transfers</li>
                    <li>Lock period ensures commitment to savings</li>
                    <li>Automated savings process reduces human error</li>
                    <li>Transparent and verifiable on-chain</li>
                </ul>
            </div>
        </div>
    );
}; 