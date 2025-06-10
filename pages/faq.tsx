import { motion } from 'framer-motion';
import Link from 'next/link';
import { PROGRAM_CONSTANTS } from '../utils/constants';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function FAQ() {
    return (
        <div className="min-h-screen bg-gray-900">
            <Navbar />
            
            <main className="pt-20">
                {/* FAQ Header */}
                <section className="max-w-4xl mx-auto px-4 py-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-center mb-12"
                    >
                        <h1 className="text-4xl font-bold text-white mb-4">Frequently Asked Questions</h1>
                        <p className="text-gray-300">Everything you need to know about SaveFi</p>
                    </motion.div>

                    {/* FAQ Categories */}
                    <div className="space-y-12">
                        {/* Vault & Core Features */}
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-6">Vault & Core Features</h2>
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-xl font-semibold text-white mb-3">What is a SaveFi Vault?</h3>
                                    <p className="text-gray-300 mb-3">
                                        A SaveFi Vault is your personal savings account on Solana. It's a unique PDA (Program Derived Address) that lets you:
                                    </p>
                                    <ul className="list-disc list-inside space-y-2 text-gray-300">
                                        <li>Set your save rate ({PROGRAM_CONSTANTS.MIN_SAVE_RATE}%-{PROGRAM_CONSTANTS.MAX_SAVE_RATE}%)</li>
                                        <li>Choose your lock period ({PROGRAM_CONSTANTS.MIN_LOCK_DAYS}-{PROGRAM_CONSTANTS.MAX_LOCK_DAYS} days)</li>
                                        <li>Delegate funds for automatic savings</li>
                                        <li>Track your SaveSOL tokens</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="text-xl font-semibold text-white mb-3">How do I manage my Vault?</h3>
                                    <ul className="list-disc list-inside space-y-2 text-gray-300">
                                        <li>Create vault with your desired settings</li>
                                        <li>Delegate funds to enable savings</li>
                                        <li>View balance and lock period in vault</li>
                                        <li>Update save rate and lock period anytime</li>
                                        <li>Withdraw after lock period ends</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Delegation & Trading */}
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-6">Delegation & Trading</h2>
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-xl font-semibold text-white mb-3">How does delegation work?</h3>
                                    <p className="text-gray-300 mb-3">
                                        Delegation enables automatic savings from your trades. Here's how it works:
                                    </p>
                                    <ul className="list-disc list-inside space-y-2 text-gray-300">
                                        <li>Delegate up to {PROGRAM_CONSTANTS.MAX_DELEGATION_SOL} SOL per transaction</li>
                                        <li>Minimum {PROGRAM_CONSTANTS.MIN_DELEGATION_SOL} SOL per transaction</li>
                                        <li>Daily limit of {PROGRAM_CONSTANTS.DAILY_LIMIT_SOL} SOL</li>
                                        <li>{PROGRAM_CONSTANTS.DELEGATION_COOLDOWN_HOURS} hour cooldown between delegations</li>
                                        <li>Revoke anytime from your vault</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="text-xl font-semibold text-white mb-3">What happens during trading?</h3>
                                    <ul className="list-disc list-inside space-y-2 text-gray-300">
                                        <li>Each trade saves based on your rate</li>
                                        <li>Platform fee ({PROGRAM_CONSTANTS.MIN_FEE_RATE}%-{PROGRAM_CONSTANTS.MAX_FEE_RATE}%) deducted</li>
                                        <li>Savings automatically converted to SaveSOL</li>
                                        <li>Lock period extends with each trade</li>
                                        <li>View savings in real-time</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Subscription & Fees */}
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-6">Subscription & Fees</h2>
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-xl font-semibold text-white mb-3">Vault Subscription</h3>
                                    <ul className="list-disc list-inside space-y-2 text-gray-300">
                                        <li>{PROGRAM_CONSTANTS.SUBSCRIPTION_PERIOD_DAYS}-day subscription period</li>
                                        <li>{PROGRAM_CONSTANTS.SUBSCRIPTION_FEE_SOL} SOL subscription fee</li>
                                        <li>Auto-renewal available</li>
                                        <li>Inactive vaults can't trade or withdraw</li>
                                        <li>Manage subscription in vault settings</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="text-xl font-semibold text-white mb-3">Fee Structure</h3>
                                    <ul className="list-disc list-inside space-y-2 text-gray-300">
                                        <li>Platform fee per trade: {PROGRAM_CONSTANTS.MIN_FEE_RATE}%-{PROGRAM_CONSTANTS.MAX_FEE_RATE}%</li>
                                        <li>Subscription: {PROGRAM_CONSTANTS.SUBSCRIPTION_FEE_SOL} SOL every {PROGRAM_CONSTANTS.SUBSCRIPTION_PERIOD_DAYS} days</li>
                                        <li>No withdrawal fees</li>
                                        <li>No lock period extension fees</li>
                                        <li>No delegation revocation fees</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Security & Safety */}
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-6">Security & Safety</h2>
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-xl font-semibold text-white mb-3">Vault Security</h3>
                                    <ul className="list-disc list-inside space-y-2 text-gray-300">
                                        <li>Unique PDA for each vault</li>
                                        <li>Only vault owner can access funds</li>
                                        <li>All transactions require wallet signature</li>
                                        <li>Reentrancy protection implemented</li>
                                        <li>Emergency pause capability</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="text-xl font-semibold text-white mb-3">Important Security Notes</h3>
                                    <ul className="list-disc list-inside space-y-2 text-gray-300">
                                        <li>Keep your wallet seed phrase secure</li>
                                        <li>Use hardware wallet for maximum security</li>
                                        <li>No recovery for lost wallet access</li>
                                        <li>Monitor vault activity regularly</li>
                                        <li>Contact support for assistance</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Back to Home */}
                    <div className="mt-12 text-center">
                        <Link 
                            href="/"
                            className="inline-block bg-gray-800 hover:bg-gray-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors duration-200"
                        >
                            Back to Home
                        </Link>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
} 