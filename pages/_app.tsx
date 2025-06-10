import type { AppProps } from 'next/app';
import { WalletProvider } from '../components/WalletProvider';
import { ToastProvider } from '../components/Toast';
import '../styles/globals.css';

function App({ Component, pageProps }: AppProps) {
    return (
        <WalletProvider>
            <ToastProvider>
                <Component {...pageProps} />
            </ToastProvider>
        </WalletProvider>
    );
}

export default App; 