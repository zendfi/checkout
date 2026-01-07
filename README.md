# ZendFi Checkout

A modern Next.js checkout application for ZendFi crypto payments, powered by Solana.

## Features

- **Wallet Connection**: Supports Phantom, Solflare, Backpack, Glow, and other Solana wallets
- **QR Code Payments**: Scan with any Solana wallet app
- **Pay What You Want**: Flexible amount support for donations/tips
- **Gasless Transactions**: Backend pays fees when customers have low SOL balance
- **Bank/Onramp Support**: Pay with bank transfer (NGN → USDC)
- **Mobile Deep Links**: Open directly in Phantom/Solflare mobile apps
- **Customer Info Collection**: Optional receipt email capture
- **Real-time Status**: Live payment status polling
- **Test/Live Modes**: Supports both devnet and mainnet

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
```

### Environment Variables

```env
NEXT_PUBLIC_API_URL=https://api.zendfi.tech
```

### Development

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) to view the checkout.

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
checkout/
├── app/                    # Next.js App Router
│   ├── checkout/[code]/    # Payment link checkout page
│   ├── payment/[id]/       # Direct payment page
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Home page
├── components/             # React components
│   ├── modals/             # Modal components
│   │   ├── ErrorModal.tsx
│   │   ├── SuccessModal.tsx
│   │   ├── CopySuccessModal.tsx
│   │   └── WalletSelectorModal.tsx
│   ├── AmountDisplay.tsx
│   ├── BankTab.tsx
│   ├── CheckoutHeader.tsx
│   ├── CustomerInfoForm.tsx
│   ├── ErrorState.tsx
│   ├── Footer.tsx
│   ├── icons.tsx
│   ├── LoadingState.tsx
│   ├── PWYWInput.tsx
│   ├── QRTab.tsx
│   ├── TabNavigation.tsx
│   ├── Timer.tsx
│   └── WalletTab.tsx
├── lib/                    # Utilities and state
│   ├── api.ts              # API client
│   ├── store.ts            # Zustand state store
│   ├── types.ts            # TypeScript types
│   └── wallet.ts           # Wallet detection/connection
├── public/                 # Static assets
├── next.config.mjs         # Next.js configuration
├── tailwind.config.ts      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
└── package.json
```

## Routes

| Route | Description |
|-------|-------------|
| `/` | Home page |
| `/checkout/:code` | Payment link checkout |
| `/payment/:id` | Direct payment page |
| `/pay/link/:code` | Alias for checkout (Solana Pay compatible) |

## API Integration

The checkout integrates with the ZendFi backend API:

- `POST /api/v1/pay/link/:code` - Create payment from link
- `GET /api/v1/payments/:id/checkout-data` - Get payment data
- `POST /api/v1/payments/:id/build-transaction` - Build transaction
- `POST /api/v1/payments/:id/submit-transaction` - Submit signed transaction
- `POST /api/v1/payments/:id/submit-gasless-transaction` - Submit gasless transaction
- `GET /api/v1/payments/:id/status` - Get payment status
- `POST /api/v1/payments/:id/customer-info` - Save customer info
- `POST /api/v1/wallet/check-balance` - Check wallet balance
- `POST /api/v1/onramp/initiate` - Initiate bank payment
- `POST /api/v1/onramp/create-order` - Create bank order
- `GET /api/v1/onramp/orders/:id` - Get bank order status

## Deployment

### Vercel (Recommended)

```bash
vercel deploy
```

### Docker

```bash
docker build -t zendfi-checkout .
docker run -p 3001:3001 zendfi-checkout
```

### Railway/Render

Deploy directly from the repository with automatic builds.

## License

MIT License - see LICENSE file for details.

## Related

- [ZendFi API](https://api.zendfi.tech) - Backend API
- [ZendFi Dashboard](https://dashboard.zendfi.tech) - Merchant dashboard
- [Solana Pay](https://solanapay.com) - Payment protocol
