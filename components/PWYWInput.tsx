'use client';

import { useCheckoutStore } from '@/lib/store';
import { api } from '@/lib/api';

export function PWYWInput() {
  const { 
    amount, 
    setAmount, 
    checkoutData, 
    wallet,
    setBalanceWarning,
    setHasInsufficientBalance
  } = useCheckoutStore();
  
  const minAmount = checkoutData?.minimum_amount || 1;
  const maxAmount = checkoutData?.maximum_amount || 1000000;
  const suggestedAmount = checkoutData?.suggested_amount || minAmount;
  const token = checkoutData?.token || 'USDC';

  const handleAmountChange = async (newAmount: number) => {
    let validAmount = newAmount;
    
    if (isNaN(validAmount) || validAmount < minAmount) {
      validAmount = minAmount;
    }
    if (maxAmount && validAmount > maxAmount) {
      validAmount = maxAmount;
    }

    setAmount(validAmount);
    console.log('Amount updated to:', validAmount);

    if (wallet?.publicKey && checkoutData) {
      try {
        const balance = await api.checkBalance({
          wallet_address: wallet.publicKey,
          token: checkoutData.token,
          network: checkoutData.solana_network,
        });

        if (token !== 'SOL' && balance.token_balance !== null) {
          if (balance.token_balance < validAmount) {
            setHasInsufficientBalance(true);
            setBalanceWarning({
              title: `Insufficient ${token}`,
              message: `You need ${validAmount} ${token} but only have ${balance.token_balance.toFixed(2)} ${token}.`,
              type: 'token',
            });
          } else {
            setHasInsufficientBalance(false);
            setBalanceWarning(null);
          }
        }
      } catch (err) {
        console.error('Error checking balance:', err);
      }
    }
  };

  return (
    <div className="pwyw-container">
      <h3 className="font-semibold text-gray-900 text-base tracking-tight">
        Pay What You Want
      </h3>
      
      <div className="pwyw-input-group">
        <span className="text-2xl font-bold text-gray-400">$</span>
        <input
          type="number"
          className="pwyw-input"
          value={amount}
          min={minAmount}
          max={maxAmount}
          step="0.01"
          onChange={(e) => handleAmountChange(parseFloat(e.target.value))}
        />
      </div>

      <div className="flex items-center justify-between gap-4 mt-3 text-sm text-gray-500 flex-wrap">
        <span className="font-semibold">Min: ${minAmount}</span>
        {maxAmount < 1000000 && (
          <span className="font-semibold">Max: ${maxAmount}</span>
        )}
        <span className="font-semibold">Suggested: ${suggestedAmount}</span>
      </div>
    </div>
  );
}
