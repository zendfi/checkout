'use client';

import { useEffect, useState } from 'react';
import { ChevronDown, Wallet } from 'lucide-react';
import { getAvailableWallets, DetectedWallet } from '@/lib/wallet';

interface WalletIconGridProps {
  onWalletClick: (wallet: DetectedWallet | null) => void;
  showMore?: boolean;
}

// Official wallet brand icons (high-quality SVGs)
const WALLET_ICONS: Record<string, React.ReactNode> = {
  phantom: (
    <svg width="36" height="36" viewBox="0 0 128 128" fill="none">
      <rect width="128" height="128" rx="26" fill="#AB9FF2"/>
      <path d="M110.584 64.9142H99.142C99.142 41.7651 80.173 23 56.7724 23C33.6612 23 14.8716 41.3057 14.4118 64.0583C13.936 87.5898 33.5984 107.529 57.1333 108H62.2274C83.0038 108 110.584 89.1969 110.584 64.9142Z" fill="url(#paint0_phantom)"/>
      <path d="M86.7048 64.9142C86.7048 60.0017 82.7011 56.0195 77.7619 56.0195C72.8227 56.0195 68.8191 60.0017 68.8191 64.9142C68.8191 69.8267 72.8227 73.8089 77.7619 73.8089C82.7011 73.8089 86.7048 69.8267 86.7048 64.9142Z" fill="white"/>
      <path d="M60.5238 64.9142C60.5238 60.0017 56.5202 56.0195 51.581 56.0195C46.6418 56.0195 42.6381 60.0017 42.6381 64.9142C42.6381 69.8267 46.6418 73.8089 51.581 73.8089C56.5202 73.8089 60.5238 69.8267 60.5238 64.9142Z" fill="white"/>
      <defs>
        <linearGradient id="paint0_phantom" x1="62.7" y1="23" x2="62.7" y2="108" gradientUnits="userSpaceOnUse">
          <stop stopColor="white"/>
          <stop offset="1" stopColor="white" stopOpacity="0.82"/>
        </linearGradient>
      </defs>
    </svg>
  ),
  solflare: (
    <svg width="36" height="36" viewBox="0 0 128 128" fill="none">
      <rect width="128" height="128" rx="26" fill="#1B1B1B"/>
      <g transform="translate(14, 28) scale(0.78)">
        <path d="M100.48 69.3817L83.8068 86.8015C83.4444 87.1799 83.0058 87.4816 82.5185 87.6878C82.0312 87.894 81.5055 88.0003 80.9743 88H1.93563C1.55849 88 1.18957 87.8926 0.874202 87.6912C0.558829 87.4897 0.310523 87.2029 0.160082 86.8659C0.00964039 86.5289 -0.0359048 86.1562 0.0294104 85.7945C0.0947257 85.4328 0.267982 85.0981 0.527423 84.8335L17.2004 67.4138C17.5628 67.0354 18.0014 66.7336 18.4887 66.5274C18.976 66.3212 19.5017 66.215 20.0329 66.2153H99.0715C99.4486 66.2153 99.8176 66.3226 100.133 66.5241C100.448 66.7256 100.696 67.0124 100.847 67.3494C100.997 67.6864 101.043 68.0591 100.978 68.4208C100.912 68.7825 100.739 69.1171 100.48 69.3817Z" fill="url(#solflare0)"/>
        <path d="M100.48 1.1989C100.117 0.820586 99.6787 0.518906 99.1914 0.312735C98.7041 0.106564 98.1784 0.000305961 97.6472 0H18.6086C18.2315 7.13797e-05 17.8625 0.107426 17.5472 0.308877C17.2318 0.510329 16.9835 0.797096 16.833 1.13411C16.6826 1.47113 16.6369 1.8438 16.7023 2.20551C16.7676 2.56722 16.9408 2.90191 17.2003 3.16649L33.8733 20.5862C34.2357 20.9646 34.6743 21.2663 35.1616 21.4725C35.6489 21.6787 36.1746 21.7849 36.7058 21.7847H115.744C116.122 21.7847 116.491 21.6773 116.806 21.4759C117.121 21.2744 117.37 20.9876 117.52 20.6506C117.671 20.3136 117.716 19.9409 117.651 19.5792C117.586 19.2175 117.413 18.8828 117.153 18.6183L100.48 1.1989Z" fill="url(#solflare1)"/>
        <path d="M17.2003 35.2183C16.9408 35.4828 16.7676 35.8175 16.7023 36.1792C16.6369 36.541 16.6826 36.9136 16.833 37.2506C16.9835 37.5877 17.2318 37.8744 17.5472 38.0759C17.8625 38.2773 18.2315 38.3847 18.6086 38.3847H97.6472C98.1784 38.385 98.7041 38.2787 99.1914 38.0726C99.6787 37.8664 100.117 37.5647 100.48 37.1863L117.153 19.7666C117.413 19.502 117.586 19.1673 117.651 18.8056C117.716 18.4439 117.671 18.0712 117.52 17.7342C117.37 17.3972 117.121 17.1104 116.806 16.909C116.491 16.7075 116.122 16.6001 115.744 16.6001H36.7058C36.1746 16.5999 35.6489 16.7061 35.1616 16.9123C34.6743 17.1184 34.2357 17.4202 33.8733 17.7985L17.2003 35.2183Z" fill="url(#solflare2)"/>
        <defs>
          <linearGradient id="solflare0" x1="8.5263" y1="90.0029" x2="88.9933" y2="64.5766" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FCC00A"/>
            <stop offset="1" stopColor="#FC7B0A"/>
          </linearGradient>
          <linearGradient id="solflare1" x1="25.156" y1="23.789" x2="105.623" y2="-1.63731" gradientUnits="userSpaceOnUse">
            <stop stopColor="#00FFA3"/>
            <stop offset="1" stopColor="#DC1FFF"/>
          </linearGradient>
          <linearGradient id="solflare2" x1="16.8382" y1="39.8884" x2="97.3052" y2="14.4621" gradientUnits="userSpaceOnUse">
            <stop stopColor="#00FFA3"/>
            <stop offset="1" stopColor="#DC1FFF"/>
          </linearGradient>
        </defs>
      </g>
    </svg>
  ),
  backpack: (
    <svg width="36" height="36" viewBox="0 0 128 128" fill="none">
      <rect width="128" height="128" rx="26" fill="#E33E3F"/>
      <path d="M88 44H40C35.5817 44 32 47.5817 32 52V88C32 92.4183 35.5817 96 40 96H88C92.4183 96 96 92.4183 96 88V52C96 47.5817 92.4183 44 88 44Z" stroke="white" strokeWidth="5"/>
      <path d="M48 44V38C48 32.4772 52.4772 28 58 28H70C75.5228 28 80 32.4772 80 38V44" stroke="white" strokeWidth="5"/>
      <rect x="54" y="64" width="20" height="14" rx="3" fill="white"/>
    </svg>
  ),
  coinbase: (
    <svg width="36" height="36" viewBox="0 0 128 128" fill="none">
      <rect width="128" height="128" rx="26" fill="#0052FF"/>
      <path d="M64 24C41.9086 24 24 41.9086 24 64C24 86.0914 41.9086 104 64 104C86.0914 104 104 86.0914 104 64C104 41.9086 86.0914 24 64 24ZM53.6 74.4C49.0295 74.4 45.3 70.6705 45.3 66.1C45.3 61.5295 49.0295 57.8 53.6 57.8H74.4C78.9705 57.8 82.7 61.5295 82.7 66.1C82.7 70.6705 78.9705 74.4 74.4 74.4H53.6Z" fill="white"/>
    </svg>
  ),
  trust: (
    <svg width="36" height="36" viewBox="0 0 128 128" fill="none">
      <rect width="128" height="128" rx="26" fill="#0500FF"/>
      <path d="M64 28L32 40V60C32 81.2 46.33 100.5 64 104C81.67 100.5 96 81.2 96 60V40L64 28Z" stroke="white" strokeWidth="5" fill="none"/>
      <path d="M54 64L60 70L74 56" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  walletconnect: (
    <svg width="36" height="36" viewBox="0 0 128 128" fill="none">
      <rect width="128" height="128" rx="26" fill="#3B99FC"/>
      <path d="M40 52C54.36 37.64 77.64 37.64 92 52L94 54C95 55 95 56.6 94 57.6L89 62.6C88.5 63.1 87.7 63.1 87.2 62.6L84.8 60.2C75 50.4 59 50.4 49.2 60.2L46.6 62.8C46.1 63.3 45.3 63.3 44.8 62.8L39.8 57.8C38.8 56.8 38.8 55.2 39.8 54.2L40 52ZM103.6 63.6L108 68C109 69 109 70.6 108 71.6L86 93.6C85 94.6 83.4 94.6 82.4 93.6L67.6 78.8C67.35 78.55 66.95 78.55 66.7 78.8L51.9 93.6C50.9 94.6 49.3 94.6 48.3 93.6L26 71.6C25 70.6 25 69 26 68L30.4 63.6C31.4 62.6 33 62.6 34 63.6L48.8 78.4C49.05 78.65 49.45 78.65 49.7 78.4L64.5 63.6C65.5 62.6 67.1 62.6 68.1 63.6L82.9 78.4C83.15 78.65 83.55 78.65 83.8 78.4L98.6 63.6C99.6 62.6 101.2 62.6 102.2 63.6H103.6Z" fill="white"/>
    </svg>
  ),
  glow: (
    <svg width="36" height="36" viewBox="0 0 128 128" fill="none">
      <rect width="128" height="128" rx="26" fill="#0D1117"/>
      <circle cx="64" cy="64" r="36" fill="url(#glow_grad)"/>
      <defs>
        <radialGradient id="glow_grad" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(64 64) rotate(90) scale(36)">
          <stop stopColor="#FFD700"/>
          <stop offset="1" stopColor="#FF6B00"/>
        </radialGradient>
      </defs>
    </svg>
  ),
  metamask: (
    <svg width="36" height="36" viewBox="0 0 128 128" fill="none">
      <rect width="128" height="128" rx="26" fill="#F6851B"/>
      <path d="M97.2 30L66.4 52.4L72.4 38.8L97.2 30Z" fill="#E2761B" stroke="#E2761B"/>
      <path d="M30.8 30L61.3 52.6L55.6 38.8L30.8 30Z" fill="#E4761B" stroke="#E4761B"/>
      <path d="M85 82.4L77 94.8L95.6 99.6L100.8 82.8L85 82.4Z" fill="#E4761B" stroke="#E4761B"/>
      <path d="M27.3 82.8L32.4 99.6L51 94.8L43 82.4L27.3 82.8Z" fill="#E4761B" stroke="#E4761B"/>
      <path d="M49.8 56.8L44.8 64.4L63.2 65.2L62.4 45.2L49.8 56.8Z" fill="#E4761B" stroke="#E4761B"/>
      <path d="M78.2 56.8L65.4 44.8L64.8 65.2L83.2 64.4L78.2 56.8Z" fill="#E4761B" stroke="#E4761B"/>
      <path d="M51 94.8L62 89.6L52.4 83L51 94.8Z" fill="#E4761B" stroke="#E4761B"/>
      <path d="M66 89.6L77 94.8L75.6 83L66 89.6Z" fill="#E4761B" stroke="#E4761B"/>
    </svg>
  ),
  rainbow: (
    <svg width="36" height="36" viewBox="0 0 128 128" fill="none">
      <rect width="128" height="128" rx="26" fill="#001A35"/>
      <path d="M32 84C32 55.28 55.28 32 84 32V44C61.9 44 44 61.9 44 84H32Z" fill="#FF4000"/>
      <path d="M44 84C44 61.9 61.9 44 84 44V56C68.54 56 56 68.54 56 84H44Z" fill="#FF8500"/>
      <path d="M56 84C56 68.54 68.54 56 84 56V68C75.16 68 68 75.16 68 84H56Z" fill="#FFDE00"/>
      <path d="M68 84C68 75.16 75.16 68 84 68V84H68Z" fill="#00D700"/>
      <circle cx="84" cy="84" r="12" fill="#00D700"/>
    </svg>
  ),
  // Additional wallets for "Other Wallets"
  exodus: (
    <svg width="36" height="36" viewBox="0 0 128 128" fill="none">
      <rect width="128" height="128" rx="26" fill="#1F1B4D"/>
      <path d="M96 42L64 32L32 42V86L64 96L96 86V42Z" fill="url(#exodus_grad)"/>
      <defs>
        <linearGradient id="exodus_grad" x1="32" y1="32" x2="96" y2="96" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8B5CF6"/>
          <stop offset="1" stopColor="#6366F1"/>
        </linearGradient>
      </defs>
    </svg>
  ),
  brave: (
    <svg width="36" height="36" viewBox="0 0 128 128" fill="none">
      <rect width="128" height="128" rx="26" fill="#FB542B"/>
      <path d="M64 28L44 38L34 54L44 84L64 100L84 84L94 54L84 38L64 28Z" fill="white"/>
      <path d="M64 38L54 44L48 56L54 76L64 88L74 76L80 56L74 44L64 38Z" fill="#FB542B"/>
    </svg>
  ),
  ledger: (
    <svg width="36" height="36" viewBox="0 0 128 128" fill="none">
      <rect width="128" height="128" rx="26" fill="#000000"/>
      <rect x="32" y="44" width="28" height="40" rx="2" fill="white"/>
      <rect x="68" y="64" width="28" height="20" rx="2" fill="white"/>
      <rect x="68" y="44" width="28" height="12" rx="2" fill="white"/>
    </svg>
  ),
};

// Primary wallets shown in main grid (6 wallets, clean layout)
const PRIMARY_WALLETS = [
  { id: 'phantom', name: 'Phantom', priority: 1 },
  { id: 'solflare', name: 'Solflare', priority: 2 },
  { id: 'backpack', name: 'Backpack', priority: 3 },
  { id: 'coinbase', name: 'Coinbase', priority: 4 },
  { id: 'trust', name: 'Trust', priority: 5 },
  { id: 'walletconnect', name: 'WalletConnect', priority: 6 },
];

// Secondary wallets shown in expandable section
const OTHER_WALLETS = [
  { id: 'glow', name: 'Glow' },
  { id: 'metamask', name: 'MetaMask' },
  { id: 'rainbow', name: 'Rainbow' },
  { id: 'exodus', name: 'Exodus' },
  { id: 'brave', name: 'Brave' },
  { id: 'ledger', name: 'Ledger' },
];

export function WalletIconGrid({ onWalletClick, showMore = false }: WalletIconGridProps) {
  const [detectedWallets, setDetectedWallets] = useState<DetectedWallet[]>([]);
  const [showOtherWallets, setShowOtherWallets] = useState(false);

  useEffect(() => {
    const wallets = getAvailableWallets();
    setDetectedWallets(wallets);
  }, []);

  const isWalletInstalled = (walletId: string) => {
    return detectedWallets.some(
      (w) => w.name.toLowerCase().includes(walletId.toLowerCase()) ||
             walletId.toLowerCase().includes(w.name.toLowerCase())
    );
  };

  const getDetectedWallet = (walletId: string) => {
    return detectedWallets.find(
      (w) => w.name.toLowerCase().includes(walletId.toLowerCase()) ||
             walletId.toLowerCase().includes(w.name.toLowerCase())
    );
  };

  const installedCount = PRIMARY_WALLETS.filter(w => isWalletInstalled(w.id)).length;

  const renderWalletButton = (wallet: { id: string; name: string }, index: number) => {
    const isInstalled = isWalletInstalled(wallet.id);
    const detectedWallet = getDetectedWallet(wallet.id);
    const icon = WALLET_ICONS[wallet.id];

    return (
      <button
        key={wallet.id}
        className="wallet-btn"
        onClick={() => onWalletClick(detectedWallet || null)}
        aria-label={`Connect with ${wallet.name}${isInstalled ? ' (Installed)' : ''}`}
        title={wallet.name}
      >
        <div className="wallet-btn-icon">
          {icon}
        </div>
        {isInstalled && (
          <span 
            className="wallet-installed-dot" 
            aria-label="Installed"
          />
        )}
        <span className="wallet-btn-name">{wallet.name}</span>
      </button>
    );
  };

  return (
    <div className="wallet-section">
      {/* Accessibility announcement */}
      <span className="sr-only">
        {PRIMARY_WALLETS.length} wallets available, {installedCount} installed
      </span>

      {/* Primary Wallet Grid - 6 columns on desktop */}
      <div className="wallet-grid-pro">
        {PRIMARY_WALLETS.map((wallet, index) => renderWalletButton(wallet, index))}
      </div>

      {/* Other Wallets Expandable Section */}
      {showMore && OTHER_WALLETS.length > 0 && (
        <div className="other-wallets-section">
          <button
            onClick={() => setShowOtherWallets(!showOtherWallets)}
            className="other-wallets-toggle"
            aria-expanded={showOtherWallets}
          >
            <div className="other-wallets-toggle-left">
              <Wallet className="w-5 h-5 text-gray-400" />
              <span>Other Wallets</span>
            </div>
            <div className="other-wallets-toggle-right">
              <span className="other-wallets-badge">+{OTHER_WALLETS.length}</span>
              <ChevronDown 
                className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                  showOtherWallets ? 'rotate-180' : ''
                }`} 
              />
            </div>
          </button>

          {showOtherWallets && (
            <div className="wallet-grid-pro mt-4 animate-slide-down">
              {OTHER_WALLETS.map((wallet, index) => renderWalletButton(wallet, index))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
