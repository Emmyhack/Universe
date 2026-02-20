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
      <section className="text-center space-y-10 py-16 md:py-24">
        <div className="space-y-8">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 font-display">
            Decentralized
            <span className="text-primary-700 block"> University Elections</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Secure, transparent, and privacy-preserving voting platform for university elections. 
            Built on blockchain technology with zero-knowledge proofs.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center pt-4">
            <Link
              to="/dashboard"
              className="btn-primary text-lg px-8 py-4 inline-flex items-center space-x-2 shadow-lg hover:shadow-xl"
            >
              <Vote className="w-5 h-5" />
              <span>Get Started</span>
            </Link>
            <Link
              to="/elections"
              className="btn-secondary text-lg px-8 py-4 inline-flex items-center space-x-2"
            >
              <Users className="w-5 h-5" />
              <span>View Elections</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="space-y-16 py-20">
        <div className="text-center space-y-6">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 font-display">
            Why Choose UniVote?
          </h2>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
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
                className="card space-y-5"
              >
                <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center">
                  <Icon className="w-7 h-7 text-primary-700" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-600 rounded-2xl p-12 md:p-20 text-white my-20">
        <div className="text-center space-y-8 max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold font-display">
            Ready to Transform University Elections?
          </h2>
          <p className="text-xl opacity-95 leading-relaxed">
            Join the future of democratic voting with blockchain technology. 
            Secure, transparent, and accessible to all.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center pt-4">
            <Link
              to="/universities"
              className="bg-white text-primary-700 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-all duration-200 inline-flex items-center space-x-2 shadow-lg"
            >
              <Globe className="w-5 h-5" />
              <span>Register University</span>
            </Link>
            <Link
              to="/admin"
              className="border-2 border-white text-white hover:bg-white hover:text-primary-700 font-semibold py-3 px-8 rounded-lg transition-all duration-200 inline-flex items-center space-x-2"
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