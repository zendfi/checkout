'use client';

interface TokenIconRowProps {
  tokens?: string[];
  maxVisible?: number;
}

const TOKEN_ICONS: Record<string, { name: string; icon: string; color: string }> = {
  USDC: {
    name: 'USDC',
    icon: '/tokens/usdc.svg',
    color: '#2775CA',
  },
  USDT: {
    name: 'USDT',
    icon: '/tokens/usdt.svg',
    color: '#26A17B',
  },
  SOL: {
    name: 'Solana',
    icon: '/tokens/sol.svg',
    color: '#9945FF',
  },
  ETH: {
    name: 'Ethereum',
    icon: '/tokens/eth.svg',
    color: '#627EEA',
  },
  BTC: {
    name: 'Bitcoin',
    icon: '/tokens/btc.svg',
    color: '#F7931A',
  },
};

// Simple SVG icons as fallback
function TokenFallbackIcon({ token }: { token: string }) {
  const colors: Record<string, string> = {
    USDC: '#2775CA',
    USDT: '#26A17B',
    SOL: '#9945FF',
    ETH: '#627EEA',
    BTC: '#F7931A',
  };

  return (
    <div
      className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
      style={{ backgroundColor: colors[token] || '#6B7280' }}
    >
      {token.charAt(0)}
    </div>
  );
}

export function TokenIconRow({ tokens = ['USDC', 'USDT', 'SOL'], maxVisible = 5 }: TokenIconRowProps) {
  const visibleTokens = tokens.slice(0, maxVisible);
  const hiddenCount = Math.max(0, tokens.length - maxVisible);

  return (
    <div className="token-icons-row">
      {visibleTokens.map((token) => (
        <div key={token} className="token-icon" title={TOKEN_ICONS[token]?.name || token}>
          <TokenFallbackIcon token={token} />
        </div>
      ))}
      {hiddenCount > 0 && (
        <span className="token-more">+{hiddenCount}</span>
      )}
    </div>
  );
}
