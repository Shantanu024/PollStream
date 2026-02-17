import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Poll from './pages/Poll';
import NotFound from './pages/NotFound';
import { initSocket } from './services/socket';

function App() {
  useEffect(() => {
    // Initialize socket connection on app mount
    initSocket();
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Header />
        <main className="pb-12">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/poll/:id" element={<Poll />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        
        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 py-6 mt-12">
          <div className="container mx-auto px-4 text-center text-gray-600">
            <p className="text-sm">
              Simple • Fast • Smooth
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
