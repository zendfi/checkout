// Wallet detection utilities matching checkout.rs functionality

export interface DetectedWallet {
  name: string;
  provider: any;
  icon: string;
}

declare global {
  interface Window {
    phantom?: {
      solana?: {
        isPhantom: boolean;
        connect: () => Promise<{ publicKey: any }>;
        disconnect: () => Promise<void>;
        signTransaction: (transaction: any) => Promise<any>;
        signAndSendTransaction: (transaction: any) => Promise<{ signature: string }>;
        publicKey?: any;
      };
    };
    solflare?: {
      isSolflare: boolean;
      connect: () => Promise<{ publicKey: any }>;
      disconnect: () => Promise<void>;
      signTransaction: (transaction: any) => Promise<any>;
      signAndSendTransaction: (transaction: any) => Promise<{ signature: string }>;
      publicKey?: any;
    };
    backpack?: {
      isBackpack: boolean;
      connect: () => Promise<{ publicKey: any }>;
      disconnect: () => Promise<void>;
      signTransaction: (transaction: any) => Promise<any>;
      signAndSendTransaction: (transaction: any) => Promise<{ signature: string }>;
      publicKey?: any;
    };
    glow?: {
      isGlow: boolean;
      connect: () => Promise<{ publicKey: any }>;
      disconnect: () => Promise<void>;
      signTransaction: (transaction: any) => Promise<any>;
      signAndSendTransaction: (transaction: any) => Promise<{ signature: string }>;
      publicKey?: any;
    };
    Slope?: any;
    solana?: any;
  }
}

export function getAvailableWallets(): DetectedWallet[] {
  if (typeof window === 'undefined') return [];
  
  const wallets: DetectedWallet[] = [];

  if (window.phantom?.solana?.isPhantom) {
    wallets.push({
      name: 'Phantom',
      provider: window.phantom.solana,
      icon: 'phantom',
    });
  }

  if (window.solflare?.isSolflare) {
    wallets.push({
      name: 'Solflare',
      provider: window.solflare,
      icon: 'solflare',
    });
  }

  if (window.backpack?.isBackpack) {
    wallets.push({
      name: 'Backpack',
      provider: window.backpack,
      icon: 'backpack',
    });
  }

  if (window.glow?.isGlow) {
    wallets.push({
      name: 'Glow',
      provider: window.glow,
      icon: 'glow',
    });
  }

  if (window.Slope) {
    wallets.push({
      name: 'Slope',
      provider: window.Slope,
      icon: 'slope',
    });
  }

  // Fallback to generic solana provider
  if (!wallets.length && window.solana) {
    wallets.push({
      name: 'Solana Wallet',
      provider: window.solana,
      icon: 'wallet',
    });
  }

  return wallets;
}

export function isMobileDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

export function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export async function connectToWallet(wallet: DetectedWallet): Promise<string> {
  console.log(`Connecting to ${wallet.name}...`);
  
  const resp = await wallet.provider.connect();
  
  console.log('Wallet connection response:', resp);
  console.log('Provider publicKey:', wallet.provider.publicKey);
  
  let extractedKey = null;

  if (resp?.publicKey) {
    extractedKey = resp.publicKey;
  } else if (wallet.provider.publicKey) {
    extractedKey = wallet.provider.publicKey;
  } else if (resp) {
    extractedKey = resp;
  }

  if (!extractedKey) {
    throw new Error('No public key found in wallet response');
  }

  let publicKey: string;

  if (typeof extractedKey === 'string') {
    publicKey = extractedKey;
  } else if (extractedKey.toBase58) {
    publicKey = extractedKey.toBase58();
  } else if (extractedKey.toString) {
    publicKey = extractedKey.toString();
  } else {
    console.error('Unknown public key format:', extractedKey);
    throw new Error('Could not extract public key from wallet');
  }

  if (!publicKey || publicKey.length < 32 || publicKey.length > 44) {
    console.error('Invalid public key format:', publicKey);
    throw new Error('Invalid public key format received from wallet');
  }

  console.log(`${wallet.name} connected successfully`);
  console.log('Public key:', publicKey);

  return publicKey;
}

export function getPhantomDeepLink(currentUrl: string): string {
  const encodedUrl = encodeURIComponent(currentUrl);
  return `phantom://browse/${encodedUrl}`;
}

export function getSolflareDeepLink(currentUrl: string): string {
  const encodedUrl = encodeURIComponent(currentUrl);
  return `solflare://browse/${encodedUrl}`;
}

export function getPhantomAppStoreUrl(): string {
  return isIOS()
    ? 'https://apps.apple.com/app/phantom-solana-wallet/id1598432977'
    : 'https://play.google.com/store/apps/details?id=app.phantom';
}

export function getSolflareAppStoreUrl(): string {
  return isIOS()
    ? 'https://apps.apple.com/app/solflare/id1580902717'
    : 'https://play.google.com/store/apps/details?id=com.solflare.mobile';
}

export function getFundingGuideUrl(token: string): string {
  const guides: Record<string, string> = {
    USDC: 'https://www.google.com/search?q=how+to+send+usdc+to+phantom+wallet&oq=how+to+send+usdc',
    USDT: 'https://www.google.com/search?q=how+to+send+usdt+to+phantom+wallet&oq=how+to+send+usdt',
    SOL: 'https://www.google.com/search?q=how+to+add+funds+to+phantom+wallet&oq=how+to+add+funds+to+phantom+wallet',
  };
  return guides[token] || guides['SOL'];
}
