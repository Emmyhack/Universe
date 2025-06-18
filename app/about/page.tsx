'use client'

import Navigation from '@/components/layout/Navigation'
import Logo from '@/components/layout/Logo'
import { 
  AcademicCapIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  ChartBarIcon,
  GlobeAltIcon,
  CogIcon,
  BeakerIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'

export default function AboutPage() {
  const features = [
    {
      icon: ShieldCheckIcon,
      title: 'Zero-Knowledge Proofs',
      description: 'Privacy-preserving voting with cryptographic proofs that ensure vote integrity without revealing individual choices.'
    },
    {
      icon: AcademicCapIcon,
      title: 'University Focused',
      description: 'Designed specifically for academic institutions with role-based access control and student verification systems.'
    },
    {
      icon: UserGroupIcon,
      title: 'Decentralized Governance',
      description: 'Transparent and tamper-proof voting mechanisms powered by blockchain technology.'
    },
    {
      icon: ChartBarIcon,
      title: 'Real-time Results',
      description: 'Instant vote counting and result verification with immutable audit trails.'
    },
    {
      icon: GlobeAltIcon,
      title: 'Cross-Chain Ready',
      description: 'Built to support multiple blockchain networks, starting with KaiChain and expanding to other networks.'
    },
    {
      icon: CogIcon,
      title: 'Smart Contract Integration',
      description: 'Automated election management with programmable governance rules and automated execution.'
    }
  ]

  const technologyStack = [
    { name: 'Next.js', description: 'React framework for production' },
    { name: 'TypeScript', description: 'Type-safe JavaScript development' },
    { name: 'Tailwind CSS', description: 'Utility-first CSS framework' },
    { name: 'Ethers.js', description: 'Ethereum library for dApp development' },
    { name: 'Hardhat', description: 'Ethereum development environment' },
    { name: 'Circom', description: 'Zero-knowledge proof circuit compiler' },
    { name: 'SnarkJS', description: 'Zero-knowledge proof toolkit' },
    { name: 'Solidity', description: 'Smart contract programming language' }
  ]

  const roles = [
    {
      title: 'Registrar',
      description: 'Can register and manage universities in the system',
      permissions: ['Register universities', 'Update university status', 'Manage university admins']
    },
    {
      title: 'DAO',
      description: 'Decentralized governance body with highest privileges',
      permissions: ['Approve election proposals', 'Revoke elections', 'System governance']
    },
    {
      title: 'Election Officer',
      description: 'Can propose and manage elections',
      permissions: ['Propose elections', 'Manage election parameters', 'Monitor voting process']
    },
    {
      title: 'Candidate Manager',
      description: 'Manages candidate registration and verification',
      permissions: ['Register candidates', 'Verify eligibility', 'Update candidate info']
    },
    {
      title: 'Candidate',
      description: 'Registered candidates in elections',
      permissions: ['Update personal info', 'View election details', 'Participate in voting']
    }
  ]

  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="lg:pl-64">
        <main className="py-10 px-4 max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <Logo size="lg" className="mr-3" />
              <span className="text-3xl font-bold text-gray-900">Universe</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Decentralized University Voting System
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A secure, transparent, and privacy-preserving voting platform built on blockchain technology, 
              specifically designed for academic institutions and university governance.
            </p>
          </div>

          {/* Mission Statement */}
          <div className="card mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-gray-700 mb-4">
              Universe aims to revolutionize university governance by providing a decentralized, 
              secure, and transparent voting system that ensures the integrity of academic elections 
              while preserving voter privacy through cutting-edge zero-knowledge cryptography.
            </p>
            <p className="text-gray-700">
              We believe that academic institutions deserve the same level of security and transparency 
              that blockchain technology provides, while maintaining the privacy and confidentiality 
              that is essential in educational environments.
            </p>
          </div>

          {/* Key Features */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Key Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <div key={index} className="card text-center">
                  <feature.icon className="h-12 w-12 text-primary-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Technology Stack */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Technology Stack</h2>
            <div className="card">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {technologyStack.map((tech, index) => (
                  <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-1">{tech.name}</h3>
                    <p className="text-sm text-gray-600">{tech.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* System Roles */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">System Roles & Permissions</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {roles.map((role, index) => (
                <div key={index} className="card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{role.title}</h3>
                  <p className="text-gray-600 mb-3">{role.description}</p>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Permissions:</h4>
                    <ul className="space-y-1">
                      {role.permissions.map((permission, permIndex) => (
                        <li key={permIndex} className="text-sm text-gray-600 flex items-center">
                          <div className="w-1.5 h-1.5 bg-primary-600 rounded-full mr-2"></div>
                          {permission}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Architecture Overview */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">System Architecture</h2>
            <div className="card">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <BeakerIcon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Contracts</h3>
                  <p className="text-sm text-gray-600">
                    Deployed on KaiChain with role-based access control, election management, 
                    and candidate verification systems.
                  </p>
                </div>
                <div className="text-center">
                  <DocumentTextIcon className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Zero-Knowledge Proofs</h3>
                  <p className="text-sm text-gray-600">
                    Privacy-preserving vote verification using Circom circuits and Groth16 
                    proving system for secure voting.
                  </p>
                </div>
                <div className="text-center">
                  <GlobeAltIcon className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Frontend Interface</h3>
                  <p className="text-sm text-gray-600">
                    Modern React-based UI with real-time updates, wallet integration, 
                    and cross-chain compatibility.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Roadmap */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Development Roadmap</h2>
            <div className="card">
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">1</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">Phase 1: Core Platform</h3>
                    <p className="text-gray-600">Basic voting functionality, university registration, and candidate management</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">2</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">Phase 2: Zero-Knowledge Integration</h3>
                    <p className="text-gray-600">Privacy-preserving voting with ZK proofs and advanced security features</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">3</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">Phase 3: Cross-Chain Support</h3>
                    <p className="text-gray-600">Multi-chain compatibility and cross-chain vote aggregation</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">4</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">Phase 4: Advanced Features</h3>
                    <p className="text-gray-600">Mobile apps, advanced analytics, and institutional integrations</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact & Support */}
          <div className="card text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Get Involved</h2>
            <p className="text-gray-600 mb-6">
              Universe is an open-source project. We welcome contributions from developers, 
              researchers, and academic institutions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://github.com/univote"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary inline-flex items-center"
              >
                View on GitHub
              </a>
              <a
                href="mailto:contact@univote.org"
                className="btn-secondary inline-flex items-center"
              >
                Contact Us
              </a>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
} 