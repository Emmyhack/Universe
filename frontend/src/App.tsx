import { Routes, Route } from 'react-router-dom';
import { Web3Provider } from '@/contexts/Web3Context';
import ErrorBoundary from '@/components/ErrorBoundary';
import Layout from '@/components/Layout';
import Home from '@/pages/Home';
import Dashboard from '@/pages/Dashboard';
import Elections from '@/pages/Elections';
import Universities from '@/pages/Universities';
import Candidates from '@/pages/Candidates';
import Voting from '@/pages/Voting';
import Admin from '@/pages/Admin';
import NotFound from '@/pages/NotFound';

function App() {
  return (
    <ErrorBoundary>
      <Web3Provider>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/elections" element={<Elections />} />
            <Route path="/universities" element={<Universities />} />
            <Route path="/candidates" element={<Candidates />} />
            <Route path="/voting/:electionId" element={<Voting />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </Web3Provider>
    </ErrorBoundary>
  );
}

export default App;