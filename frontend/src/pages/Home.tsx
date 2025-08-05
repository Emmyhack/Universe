import { Link } from 'react-router-dom';
import { Vote, Shield, Users, Zap, Lock, Globe, Settings } from 'lucide-react';

const Home = () => {
  const features = [
    {
      icon: Shield,
      title: 'Secure & Transparent',
      description: 'Blockchain-based voting ensures transparency and prevents tampering with election results.',
    },
    {
      icon: Lock,
      title: 'Privacy Preserved',
      description: 'Zero-knowledge proofs maintain voter privacy while ensuring vote validity.',
    },
    {
      icon: Users,
      title: 'Role-Based Access',
      description: 'Comprehensive role management for universities, officers, candidates, and students.',
    },
    {
      icon: Zap,
      title: 'Real-Time Results',
      description: 'Instant vote counting and result verification with cryptographic proofs.',
    },
    {
      icon: Globe,
      title: 'University Integration',
      description: 'Seamless integration with university systems and student verification.',
    },
    {
      icon: Vote,
      title: 'Easy Voting',
      description: 'Simple and intuitive voting interface for all eligible students.',
    },
  ];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-8">
        <div className="space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900">
            Decentralized
            <span className="text-gradient block">University Elections</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Secure, transparent, and privacy-preserving voting platform for university elections. 
            Built on blockchain technology with zero-knowledge proofs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/dashboard"
              className="btn-primary text-lg px-8 py-3 inline-flex items-center space-x-2"
            >
              <Vote className="w-5 h-5" />
              <span>Get Started</span>
            </Link>
            <Link
              to="/elections"
              className="btn-secondary text-lg px-8 py-3 inline-flex items-center space-x-2"
            >
              <Users className="w-5 h-5" />
              <span>View Elections</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-gray-900">
            Why Choose UniVote?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Our platform combines cutting-edge blockchain technology with user-friendly design 
            to create the most secure and accessible voting experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="card space-y-4 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Icon className="w-6 h-6 text-primary-600" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary-600 to-purple-600 rounded-2xl p-8 md:p-12 text-white">
        <div className="text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold">
            Ready to Transform University Elections?
          </h2>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Join the future of democratic voting with blockchain technology. 
            Secure, transparent, and accessible to all.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/universities"
              className="bg-white text-primary-600 hover:bg-gray-50 font-medium py-3 px-8 rounded-lg transition-colors duration-200 inline-flex items-center space-x-2"
            >
              <Globe className="w-5 h-5" />
              <span>Register University</span>
            </Link>
            <Link
              to="/admin"
              className="border border-white text-white hover:bg-white hover:text-primary-600 font-medium py-3 px-8 rounded-lg transition-colors duration-200 inline-flex items-center space-x-2"
            >
              <Settings className="w-5 h-5" />
              <span>Admin Panel</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;