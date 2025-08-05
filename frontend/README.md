# UniVote Frontend

A modern, professional React-based frontend for the UniVote decentralized university election platform.

## 🚀 Features

### Core Functionality
- **Role-Based Access Control**: Different interfaces for students, candidates, election officers, and administrators
- **Election Management**: Create, manage, and participate in elections
- **University Registration**: Register and manage universities
- **Candidate Management**: Register and verify candidates
- **Secure Voting**: Encrypted voting with zero-knowledge proofs
- **Real-time Updates**: Live election status and results

### User Roles
- **Students**: Vote in elections, view results
- **Candidates**: Register candidacy, view election status
- **Election Officers**: Create and manage elections
- **University Admins**: Manage university settings
- **Registrars**: Register universities and manage system
- **System Admins**: Full system access and monitoring

### Security Features
- **Wallet Integration**: MetaMask and other Web3 wallets
- **Encrypted Voting**: Votes are encrypted and private
- **Zero-Knowledge Proofs**: Vote validity without revealing choices
- **Role Verification**: Blockchain-based role verification
- **Audit Trails**: Complete transaction history

## 🛠️ Technology Stack

- **React 18**: Modern React with hooks
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first styling
- **Ethers.js**: Ethereum interaction
- **React Router**: Client-side routing
- **React Hook Form**: Form management
- **Zod**: Schema validation
- **Lucide React**: Beautiful icons
- **Framer Motion**: Smooth animations

## 📦 Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout.tsx      # Main layout with navigation
│   └── CreateElectionModal.tsx
├── pages/              # Page components
│   ├── Home.tsx        # Landing page
│   ├── Dashboard.tsx   # User dashboard
│   ├── Elections.tsx   # Election management
│   ├── Universities.tsx # University management
│   ├── Candidates.tsx  # Candidate management
│   ├── Voting.tsx      # Voting interface
│   ├── Admin.tsx       # Admin panel
│   └── NotFound.tsx    # 404 page
├── contexts/           # React contexts
│   └── Web3Context.tsx # Web3 and contract management
├── types/              # TypeScript type definitions
│   └── index.ts        # Main type definitions
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
└── contracts/          # Contract ABIs and interfaces
```

## 🎨 Design System

### Color Palette
- **Primary**: Blue gradient (#3B82F6 to #8B5CF6)
- **Secondary**: Gray scale (#F8FAFC to #0F172A)
- **Success**: Green (#10B981)
- **Warning**: Yellow (#F59E0B)
- **Error**: Red (#EF4444)

### Components
- **Cards**: Clean, elevated containers
- **Buttons**: Primary, secondary, and danger variants
- **Forms**: Validated input fields
- **Modals**: Overlay dialogs
- **Navigation**: Responsive header and sidebar

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the frontend directory:

```env
VITE_CONTRACT_ADDRESSES={"universityRegistry":"0x...","electionFactory":"0x..."}
VITE_NETWORK_ID=31337
VITE_RPC_URL=http://localhost:8545
```

### Contract Integration
The frontend integrates with the following smart contracts:
- `UniversityRegistry`: University management
- `ElectionFactory`: Election creation and management
- `CandidateRegistry`: Candidate registration
- `VerificationMerkle`: Student eligibility verification
- `Election`: Individual election contracts

## 🚀 Development

### Available Scripts
- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build
- `npm run lint`: Run ESLint

### Code Style
- **TypeScript**: Strict type checking
- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting
- **Husky**: Git hooks for code quality

## 🔒 Security

### Wallet Integration
- MetaMask and other Web3 wallets
- Secure transaction signing
- Error handling and user feedback

### Data Validation
- Client-side form validation with Zod
- Server-side contract validation
- Input sanitization and validation

### Privacy Protection
- Encrypted vote submission
- Zero-knowledge proof integration
- No personal data storage

## 📱 Responsive Design

The frontend is fully responsive and works on:
- **Desktop**: Full feature set with sidebar navigation
- **Tablet**: Optimized layout with collapsible navigation
- **Mobile**: Touch-friendly interface with bottom navigation

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm test:watch

# Generate coverage report
npm test:coverage
```

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel
```bash
npm install -g vercel
vercel --prod
```

### Deploy to Netlify
```bash
npm run build
# Upload dist/ folder to Netlify
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Join our community Discord

---

Built with ❤️ for decentralized democracy