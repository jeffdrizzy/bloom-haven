import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);
  const [activeCrypto, setActiveCrypto] = useState('BTC');
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  // Brand Config
  const brand = {
    name: 'Bloom Haven',
    tagline: 'Where Your Wealth Blossoms',
    description: 'Modern banking and cryptocurrency management in one secure sanctuary.'
  };

  // Crypto data
  const cryptos = [
    { symbol: 'BTC', name: 'Bitcoin', icon: '₿', color: '#F7931A' },
    { symbol: 'ETH', name: 'Ethereum', icon: 'Ξ', color: '#627EEA' },
    { symbol: 'USDT', name: 'Tether', icon: '₮', color: '#26A17B' }
  ];

  const [prices] = useState({
    BTC: { price: 65420, change: 2.4, volume: '24.5B' },
    ETH: { price: 3480, change: 5.1, volume: '12.8B' },
    USDT: { price: 1.00, change: 0.01, volume: '45.2B' }
  });

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Stats observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  const navLinks = [
    { label: 'Home', href: '#home' },
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Crypto', href: '#crypto' },
    { label: 'FAQ', href: '#faq' }
  ];

  const features = [
    { icon: '🏦', title: 'Smart Banking', description: 'Manage your finances with intelligent tools designed for modern living.', color: 'feature-blue' },
    { icon: '₿', title: 'Crypto Integration', description: 'Buy, sell, and hold Bitcoin, Ethereum, and USDT seamlessly.', color: 'feature-orange' },
    { icon: '🔒', title: 'Bank-Level Security', description: 'Your assets are protected with military-grade encryption and 2FA.', color: 'feature-green' },
    { icon: '🎁', title: 'Gift Card Exchange', description: 'Convert your gift cards to cash instantly with our verification system.', color: 'feature-purple' },
    { icon: '📊', title: 'Portfolio Tracking', description: 'Monitor your investments and track performance in real-time.', color: 'feature-pink' },
    { icon: '🌍', title: 'Global Access', description: 'Access your account from anywhere in the world, 24/7.', color: 'feature-teal' }
  ];

  const stats = [
    { value: 100000, suffix: '+', label: 'Active Users' },
    { value: 250000000, prefix: '$', suffix: '+', label: 'Assets Managed' },
    { value: 150, suffix: '+', label: 'Countries Served' },
    { value: 99.9, suffix: '%', label: 'Uptime' }
  ];

  const steps = [
    { number: '01', icon: '📝', title: 'Create Your Account', description: 'Sign up in minutes with just your email. No paperwork, no hassle.' },
    { number: '02', icon: '💳', title: 'Fund Your Wallet', description: 'Deposit via bank transfer, crypto, or gift cards.' },
    { number: '03', icon: '🚀', title: 'Start Growing', description: 'Trade, invest, and manage your portfolio with confidence.' }
  ];

  const faqs = [
    { question: 'Is Bloom Haven safe and secure?', answer: 'Yes! We use bank-level 256-bit encryption, two-factor authentication, and cold storage for crypto assets. Your security is our top priority.' },
    { question: 'How do I deposit funds into my account?', answer: 'You can deposit funds via bank transfer, cryptocurrency (BTC, ETH, USDT), or by exchanging gift cards. All deposits are processed securely and efficiently.' },
    { question: 'What cryptocurrencies do you support?', answer: 'We currently support Bitcoin (BTC), Ethereum (ETH), and Tether (USDT). We\'re constantly evaluating new cryptocurrencies to add based on community demand.' },
    { question: 'How does the gift card exchange work?', answer: 'Submit your gift card details through our platform. Our team verifies the card, and once approved, the value is instantly credited to your account balance.' }
  ];

  const testimonials = [
    { name: 'Sarah Johnson', role: 'Small Business Owner', avatar: 'SJ', content: 'Bloom Haven has completely transformed how I manage my business finances. The crypto integration is seamless!', rating: 5 },
    { name: 'Michael Chen', role: 'Crypto Investor', avatar: 'MC', content: 'Finally, a platform that combines traditional banking with crypto. The security features give me peace of mind.', rating: 5 },
    { name: 'Emily Rodriguez', role: 'Freelancer', avatar: 'ER', content: 'The gift card exchange feature is a game-changer. I can convert my gift cards to cash instantly!', rating: 5 }
  ];

  return (
    <div className="landing-page">
      {/* Navbar */}
      <nav className={`navbar ${isScrolled ? 'navbar-scrolled' : ''}`}>
        <div className="navbar-container">
          <a href="#home" className="navbar-logo">
            <span className="logo-flower">🌸</span>
            <span className="logo-text">{brand.name}</span>
          </a>

          <div className="navbar-links">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="navbar-link">
                {link.label}
              </a>
            ))}
          </div>

          <div className="navbar-actions">
            <button onClick={() => navigate('/login')} className="btn btn-outline">Sign In</button>
            <button onClick={() => navigate('/register')} className="btn btn-primary">Get Started</button>
          </div>

          <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            <span className={`hamburger ${isMobileMenuOpen ? 'active' : ''}`}>
              <span></span><span></span><span></span>
            </span>
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="mobile-menu">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>
                {link.label}
              </a>
            ))}
            <div className="mobile-actions">
              <button onClick={() => navigate('/login')} className="btn btn-outline btn-block">Sign In</button>
              <button onClick={() => navigate('/register')} className="btn btn-primary btn-block">Get Started</button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="hero" id="home">
        <div className="hero-background">
          <div className="hero-blob hero-blob-1"></div>
          <div className="hero-blob hero-blob-2"></div>
        </div>
        <div className="hero-container">
          <div className="hero-content">
            {/* Bloom Haven Heading */}
            <h1 className="hero-brand-heading">
              Bloom Haven
            </h1>
            <div className="hero-badge">
              <span className="badge-dot"></span>
              Trusted by 100,000+ users worldwide
            </div>
            <h1 className="hero-title">
              Where Your Wealth <span className="gradient-text">Blossoms</span>
            </h1>
            <p className="hero-subtitle">
              Experience modern banking and cryptocurrency management in one secure sanctuary.
              Grow your assets with confidence and peace of mind.
            </p>
            <div className="hero-actions">
              <button onClick={() => navigate('/register')} className="btn btn-primary btn-lg">
                Start Growing Today <span className="btn-arrow">→</span>
              </button>
              <a href="#how-it-works" className="btn btn-ghost btn-lg">
                <span className="play-icon">▶</span> Watch How It Works
              </a>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-card">
              <div className="hero-card-header">
                <div className="card-brand"><span>🌸</span> {brand.name}</div>
                <span className="card-status">● Live</span>
              </div>
              <div className="hero-card-body">
                <div className="balance-section">
                  <span className="balance-label">Total Balance</span>
                  <span className="balance-amount">$24,562.00</span>
                  <span className="balance-change positive">+12.5% this month</span>
                </div>
                <div className="crypto-grid">
                  {cryptos.map((crypto) => (
                    <div key={crypto.symbol} className="crypto-item">
                      <div className="crypto-icon" style={{ color: crypto.color }}>{crypto.icon}</div>
                      <div className="crypto-info">
                        <span className="crypto-name">{crypto.name}</span>
                        <span className="crypto-value">${prices[crypto.symbol].price.toLocaleString()}</span>
                      </div>
                      <span className={`crypto-change ${prices[crypto.symbol].change >= 0 ? 'positive' : 'negative'}`}>
                        {prices[crypto.symbol].change >= 0 ? '+' : ''}{prices[crypto.symbol].change}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats" ref={sectionRef}>
        <div className="container">
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-item">
                <div className="stat-value">
                  {stat.prefix || ''}
                  {isVisible ? stat.value.toLocaleString() : '0'}
                  {stat.suffix || ''}
                </div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features" id="features">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Features</span>
            <h2 className="section-title">Everything You Need to <span className="gradient-text">Thrive</span></h2>
            <p className="section-subtitle">Powerful tools and features designed to help you manage, grow, and protect your wealth.</p>
          </div>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className={`feature-card ${feature.color}`}>
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works" id="how-it-works">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Getting Started</span>
            <h2 className="section-title">Three Simple Steps to <span className="gradient-text">Financial Freedom</span></h2>
            <p className="section-subtitle">Start your journey with Bloom Haven in just a few minutes.</p>
          </div>
          <div className="steps-grid">
            {steps.map((step, index) => (
              <div key={index} className="step-card">
                <div className="step-number">{step.number}</div>
                <div className="step-icon">{step.icon}</div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-description">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Crypto Showcase */}
      <section className="crypto-showcase" id="crypto">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Cryptocurrency</span>
            <h2 className="section-title">Trade Popular <span className="gradient-text">Cryptocurrencies</span></h2>
            <p className="section-subtitle">Access the most popular digital assets with real-time market data.</p>
          </div>
          <div className="crypto-showcase-grid">
            <div className="crypto-list">
              {cryptos.map((crypto) => (
                <button key={crypto.symbol} className={`crypto-list-item ${activeCrypto === crypto.symbol ? 'active' : ''}`} onClick={() => setActiveCrypto(crypto.symbol)}>
                  <div className="crypto-list-icon" style={{ background: `${crypto.color}20`, color: crypto.color }}>{crypto.icon}</div>
                  <div className="crypto-list-info">
                    <span className="crypto-list-name">{crypto.name}</span>
                    <span className="crypto-list-symbol">{crypto.symbol}</span>
                  </div>
                  <div className="crypto-list-price">
                    <span className="crypto-list-value">${prices[crypto.symbol].price.toLocaleString()}</span>
                    <span className={`crypto-list-change ${prices[crypto.symbol].change >= 0 ? 'positive' : 'negative'}`}>
                      {prices[crypto.symbol].change >= 0 ? '+' : ''}{prices[crypto.symbol].change}%
                    </span>
                  </div>
                </button>
              ))}
            </div>
            <div className="crypto-chart-card">
              <div className="chart-header">
                <div className="chart-info">
                  <div className="chart-crypto-icon" style={{ background: `${cryptos.find(c => c.symbol === activeCrypto).color}20`, color: cryptos.find(c => c.symbol === activeCrypto).color }}>
                    {cryptos.find(c => c.symbol === activeCrypto).icon}
                  </div>
                  <div>
                    <h3 className="chart-title">{cryptos.find(c => c.symbol === activeCrypto).name}</h3>
                    <span className="chart-symbol">{activeCrypto}/USD</span>
                  </div>
                </div>
                <div className="chart-price">
                  <span className="chart-price-value">${prices[activeCrypto].price.toLocaleString()}</span>
                  <span className={`chart-price-change ${prices[activeCrypto].change >= 0 ? 'positive' : 'negative'}`}>
                    {prices[activeCrypto].change >= 0 ? '▲' : '▼'} {Math.abs(prices[activeCrypto].change)}%
                  </span>
                </div>
              </div>
              <div className="chart-area">
                <svg viewBox="0 0 400 200" className="chart-svg">
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4CAF50" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#4CAF50" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {[0, 1, 2, 3, 4].map((i) => (
                    <line key={i} x1="0" y1={i * 50} x2="400" y2={i * 50} stroke="#E9ECEF" strokeWidth="1" />
                  ))}
                  <path d="M0,150 C50,120 75,160 100,140 C150,100 175,130 200,110 C250,70 275,100 300,80 C325,60 350,90 400,50 L400,200 L0,200 Z" fill="url(#chartGradient)" />
                  <path d="M0,150 C50,120 75,160 100,140 C150,100 175,130 200,110 C250,70 275,100 300,80 C325,60 350,90 400,50" fill="none" stroke="#4CAF50" strokeWidth="3" strokeLinecap="round" />
                  {[[0, 150], [50, 120], [100, 140], [150, 100], [200, 110], [250, 70], [300, 80], [350, 90], [400, 50]].map(([x, y], i) => (
                    <circle key={i} cx={x} cy={y} r="4" fill="#4CAF50" stroke="white" strokeWidth="2" />
                  ))}
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Testimonials</span>
            <h2 className="section-title">What Our <span className="gradient-text">Community Says</span></h2>
            <p className="section-subtitle">Join thousands of satisfied users who trust Bloom Haven with their wealth.</p>
          </div>
          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-card">
                <div className="testimonial-header">
                  <div className="testimonial-avatar">{testimonial.avatar}</div>
                  <div className="testimonial-info">
                    <h4 className="testimonial-name">{testimonial.name}</h4>
                    <span className="testimonial-role">{testimonial.role}</span>
                  </div>
                </div>
                <div className="testimonial-rating">{'★'.repeat(testimonial.rating)}</div>
                <p className="testimonial-content">"{testimonial.content}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="faq" id="faq">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">FAQ</span>
            <h2 className="section-title">Frequently Asked <span className="gradient-text">Questions</span></h2>
            <p className="section-subtitle">Got questions? We've got answers.</p>
          </div>
          <div className="faq-list">
            {faqs.map((faq, index) => (
              <div key={index} className={`faq-item ${openFaqIndex === index ? 'open' : ''}`}>
                <button className="faq-question" onClick={() => setOpenFaqIndex(openFaqIndex === index ? -1 : index)}>
                  <span>{faq.question}</span>
                  <span className="faq-icon">{openFaqIndex === index ? '−' : '+'}</span>
                </button>
                <div className="faq-answer"><p>{faq.answer}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <div className="container">
          <div className="cta-card">
            <div className="cta-content">
              <span className="cta-flower">🌸</span>
              <h2 className="cta-title">Ready to Start Your Journey?</h2>
              <p className="cta-subtitle">Join thousands of users who are growing their wealth with Bloom Haven. Create your free account today!</p>
              <div className="cta-actions">
                <button onClick={() => navigate('/register')} className="btn btn-white btn-lg">
                  Get Started Free <span className="btn-arrow">→</span>
                </button>
                <button onClick={() => navigate('/login')} className="btn btn-outline-white btn-lg">Sign In</button>
              </div>
              <div className="cta-benefits">
                <span>✓ No hidden fees</span>
                <span>✓ 2-minute setup</span>
                <span>✓ 24/7 support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <a href="#home" className="footer-logo">
                <span className="logo-flower">🌸</span>
                <span className="logo-text">{brand.name}</span>
              </a>
              <p className="footer-description">Where your wealth blossoms. Modern banking and cryptocurrency management in one secure sanctuary.</p>
            </div>
            <div className="footer-links">
              <h4>Product</h4>
              <a href="#">Features</a>
              <a href="#">Security</a>
              <a href="#">Pricing</a>
            </div>
            <div className="footer-links">
              <h4>Company</h4>
              <a href="#">About Us</a>
              <a href="#">Careers</a>
              <a href="#">Blog</a>
            </div>
            <div className="footer-links">
              <h4>Support</h4>
              <a href="#">Help Center</a>
              <a href="#">Contact</a>
              <a href="#">Community</a>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} {brand.name}. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <style>{`
        /* ===== RESET & BASE ===== */
        .landing-page {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          color: #2C3E50;
          background: #FAFAF8;
          overflow-x: hidden;
        }
        .landing-page * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
        }

        /* ===== TYPOGRAPHY ===== */
        .gradient-text {
          background: linear-gradient(135deg, #4CAF50 0%, #2196F3 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .section-header {
          text-align: center;
          margin-bottom: 60px;
        }
        .section-tag {
          display: inline-block;
          background: #E8F5E9;
          color: #4CAF50;
          padding: 4px 16px;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
          letter-spacing: 0.5px;
          margin-bottom: 12px;
        }
        .section-title {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 12px;
        }
        .section-subtitle {
          font-size: 1.1rem;
          color: #6c757d;
          max-width: 600px;
          margin: 0 auto;
        }

        /* ===== HERO BRAND HEADING ===== */
        .hero-brand-heading {
          font-size: 4rem;
          font-weight: 800;
          margin: 0 0 8px 0;
          line-height: 1.1;
          background: linear-gradient(135deg, #4CAF50 0%, #2196F3 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        @media (max-width: 768px) {
          .hero-brand-heading {
            font-size: 2.8rem;
          }
        }
        @media (max-width: 480px) {
          .hero-brand-heading {
            font-size: 2.2rem;
          }
        }

        /* ===== BUTTONS ===== */
        .btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 28px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 1rem;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
          font-family: inherit;
        }
        .btn-primary {
          background: linear-gradient(135deg, #4CAF50 0%, #388E3C 100%);
          color: white;
          box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(76, 175, 80, 0.4);
        }
        .btn-outline {
          background: transparent;
          color: #2C3E50;
          border: 2px solid #E9ECEF;
        }
        .btn-outline:hover {
          border-color: #4CAF50;
          color: #4CAF50;
        }
        .btn-ghost {
          background: transparent;
          color: #2C3E50;
        }
        .btn-ghost:hover {
          background: rgba(0,0,0,0.05);
        }
        .btn-white {
          background: white;
          color: #4CAF50;
        }
        .btn-white:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(255,255,255,0.3);
        }
        .btn-outline-white {
          background: transparent;
          color: white;
          border: 2px solid rgba(255,255,255,0.3);
        }
        .btn-outline-white:hover {
          background: rgba(255,255,255,0.1);
          border-color: white;
        }
        .btn-lg { padding: 16px 36px; font-size: 1.1rem; }
        .btn-block { width: 100%; justify-content: center; }
        .btn-arrow { transition: transform 0.3s ease; display: inline-block; }
        .btn:hover .btn-arrow { transform: translateX(4px); }
        .play-icon {
          display: inline-block;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(76, 175, 80, 0.15);
          color: #4CAF50;
          text-align: center;
          line-height: 32px;
          font-size: 12px;
        }

        /* ===== NAVBAR ===== */
        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          padding: 16px 0;
          transition: all 0.3s ease;
          background: transparent;
        }
        .navbar-scrolled {
          background: rgba(255,255,255,0.95);
          backdrop-filter: blur(12px);
          box-shadow: 0 1px 20px rgba(0,0,0,0.08);
          padding: 10px 0;
        }
        .navbar-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .navbar-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          font-weight: 700;
          font-size: 1.4rem;
          color: #2C3E50;
        }
        .logo-flower { font-size: 1.6rem; }
        .logo-text { background: linear-gradient(135deg, #4CAF50, #2196F3); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .navbar-links { display: flex; gap: 32px; align-items: center; }
        .navbar-link {
          text-decoration: none;
          color: #2C3E50;
          font-weight: 500;
          transition: color 0.3s;
          font-size: 0.95rem;
        }
        .navbar-link:hover { color: #4CAF50; }
        .navbar-actions { display: flex; gap: 12px; align-items: center; }
        .mobile-menu-btn { display: none; background: none; border: none; cursor: pointer; padding: 4px; }
        .hamburger { display: flex; flex-direction: column; gap: 4px; width: 24px; }
        .hamburger span {
          display: block;
          height: 2.5px;
          background: #2C3E50;
          border-radius: 4px;
          transition: all 0.3s ease;
        }
        .hamburger.active span:nth-child(1) { transform: rotate(45deg) translate(4px, 4px); }
        .hamburger.active span:nth-child(2) { opacity: 0; }
        .hamburger.active span:nth-child(3) { transform: rotate(-45deg) translate(4px, -4px); }

        .mobile-menu {
          display: none;
          padding: 20px 24px 30px;
          background: white;
          border-top: 1px solid #E9ECEF;
          flex-direction: column;
          gap: 16px;
        }
        .mobile-menu.open { display: flex; }
        .mobile-link {
          text-decoration: none;
          color: #2C3E50;
          font-weight: 500;
          padding: 8px 0;
          border-bottom: 1px solid #F1F3F5;
        }
        .mobile-actions { display: flex; flex-direction: column; gap: 10px; padding-top: 8px; }

        @media (max-width: 768px) {
          .navbar-links, .navbar-actions { display: none; }
          .mobile-menu-btn { display: block; }
          .mobile-menu { display: flex; }
        }

        /* ===== HERO ===== */
        .hero {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          padding: 120px 0 80px;
          overflow: hidden;
          background: linear-gradient(180deg, #F0FDF4 0%, #FAFAF8 100%);
        }
        .hero-background { position: absolute; inset: 0; z-index: 0; overflow: hidden; pointer-events: none; }
        .hero-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.4;
          animation: blobFloat 15s ease-in-out infinite alternate;
        }
        .hero-blob-1 {
          width: 500px; height: 500px;
          background: linear-gradient(135deg, #4CAF50, #81C784);
          top: -100px; right: -100px;
        }
        .hero-blob-2 {
          width: 400px; height: 400px;
          background: linear-gradient(135deg, #2196F3, #64B5F6);
          bottom: -100px; left: -100px;
          animation-delay: -5s;
        }
        @keyframes blobFloat {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(30px, -30px) scale(1.1); }
        }
        .hero-container {
          position: relative;
          z-index: 1;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
          width: 100%;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
        }
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(76, 175, 80, 0.1);
          padding: 6px 16px 6px 8px;
          border-radius: 20px;
          font-size: 0.85rem;
          color: #4CAF50;
          font-weight: 500;
          margin-bottom: 20px;
        }
        .badge-dot {
          width: 8px;
          height: 8px;
          background: #4CAF50;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        .hero-title { font-size: 3.5rem; font-weight: 800; line-height: 1.1; margin-bottom: 20px; }
        .hero-subtitle { font-size: 1.15rem; color: #6c757d; line-height: 1.7; max-width: 500px; margin-bottom: 32px; }
        .hero-actions { display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 40px; }

        .hero-card {
          background: rgba(255,255,255,0.95);
          backdrop-filter: blur(12px);
          border-radius: 24px;
          padding: 28px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.08);
          border: 1px solid rgba(255,255,255,0.5);
        }
        .hero-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 16px;
          border-bottom: 1px solid #E9ECEF;
        }
        .card-brand { font-weight: 600; color: #2C3E50; }
        .card-status { font-size: 0.8rem; color: #4CAF50; }
        .hero-card-body { padding-top: 16px; }
        .balance-section { margin-bottom: 20px; }
        .balance-label { display: block; font-size: 0.85rem; color: #6c757d; }
        .balance-amount { font-size: 2rem; font-weight: 700; color: #2C3E50; }
        .balance-change { font-size: 0.85rem; font-weight: 500; }
        .balance-change.positive { color: #4CAF50; }
        .balance-change.negative { color: #dc3545; }

        .crypto-grid { display: flex; flex-direction: column; gap: 10px; }
        .crypto-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          background: #F8FAFB;
          border-radius: 12px;
        }
        .crypto-icon { font-size: 1.2rem; font-weight: 700; width: 28px; text-align: center; }
        .crypto-info { flex: 1; }
        .crypto-name { display: block; font-size: 0.85rem; font-weight: 600; color: #2C3E50; }
        .crypto-value { font-size: 0.8rem; color: #6c757d; }
        .crypto-change { font-size: 0.8rem; font-weight: 600; }
        .crypto-change.positive { color: #4CAF50; }
        .crypto-change.negative { color: #dc3545; }

        @media (max-width: 992px) {
          .hero-container { grid-template-columns: 1fr; text-align: center; gap: 40px; }
          .hero-title { font-size: 2.8rem; }
          .hero-subtitle { margin: 0 auto 32px; }
          .hero-actions { justify-content: center; }
        }
        @media (max-width: 576px) {
          .hero-title { font-size: 2rem; }
          .hero-card { padding: 16px; }
          .balance-amount { font-size: 1.5rem; }
        }

        /* ===== STATS ===== */
        .stats {
          padding: 60px 0;
          background: white;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 30px;
          text-align: center;
        }
        .stat-value {
          font-size: 2.8rem;
          font-weight: 700;
          color: #2C3E50;
          background: linear-gradient(135deg, #4CAF50, #2196F3);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .stat-label { font-size: 1rem; color: #6c757d; margin-top: 4px; }
        @media (max-width: 768px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 480px) { .stats-grid { grid-template-columns: 1fr; } }

        /* ===== FEATURES ===== */
        .features { padding: 80px 0; }
        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        .feature-card {
          background: white;
          padding: 32px 24px;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.04);
          transition: all 0.3s ease;
          border: 1px solid #F1F3F5;
        }
        .feature-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,0.08); }
        .feature-icon { font-size: 2.4rem; margin-bottom: 16px; }
        .feature-title { font-size: 1.2rem; font-weight: 600; margin-bottom: 8px; }
        .feature-description { color: #6c757d; line-height: 1.6; font-size: 0.95rem; }
        .feature-card.feature-blue .feature-icon { color: #2196F3; }
        .feature-card.feature-orange .feature-icon { color: #F7931A; }
        .feature-card.feature-green .feature-icon { color: #4CAF50; }
        .feature-card.feature-purple .feature-icon { color: #9C27B0; }
        .feature-card.feature-pink .feature-icon { color: #E91E63; }
        .feature-card.feature-teal .feature-icon { color: #009688; }
        @media (max-width: 992px) { .features-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 576px) { .features-grid { grid-template-columns: 1fr; } }

        /* ===== HOW IT WORKS ===== */
        .how-it-works { padding: 80px 0; background: #F8FAFB; }
        .steps-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 30px;
        }
        .step-card {
          text-align: center;
          padding: 32px 24px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.04);
          position: relative;
        }
        .step-number {
          font-size: 3rem;
          font-weight: 800;
          color: #E9ECEF;
          position: absolute;
          top: 12px;
          right: 20px;
        }
        .step-icon { font-size: 2.8rem; margin-bottom: 12px; }
        .step-title { font-size: 1.2rem; font-weight: 600; margin-bottom: 8px; }
        .step-description { color: #6c757d; line-height: 1.6; }
        @media (max-width: 768px) { .steps-grid { grid-template-columns: 1fr; } }

        /* ===== CRYPTO SHOWCASE ===== */
        .crypto-showcase { padding: 80px 0; }
        .crypto-showcase-grid {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 30px;
          align-items: start;
        }
        .crypto-list {
          background: white;
          border-radius: 16px;
          padding: 8px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.04);
          border: 1px solid #F1F3F5;
        }
        .crypto-list-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          width: 100%;
          border: none;
          background: transparent;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s;
          font-family: inherit;
          text-align: left;
        }
        .crypto-list-item:hover { background: #F8FAFB; }
        .crypto-list-item.active { background: #E8F5E9; }
        .crypto-list-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          font-weight: 700;
        }
        .crypto-list-info { flex: 1; }
        .crypto-list-name { display: block; font-weight: 600; font-size: 0.95rem; color: #2C3E50; }
        .crypto-list-symbol { font-size: 0.8rem; color: #6c757d; }
        .crypto-list-price { text-align: right; }
        .crypto-list-value { display: block; font-weight: 600; color: #2C3E50; }
        .crypto-list-change { font-size: 0.8rem; font-weight: 500; }
        .crypto-list-change.positive { color: #4CAF50; }
        .crypto-list-change.negative { color: #dc3545; }

        .crypto-chart-card {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.04);
          border: 1px solid #F1F3F5;
        }
        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .chart-info { display: flex; align-items: center; gap: 14px; }
        .chart-crypto-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.4rem;
          font-weight: 700;
        }
        .chart-title { font-size: 1.1rem; font-weight: 600; color: #2C3E50; margin: 0; }
        .chart-symbol { font-size: 0.8rem; color: #6c757d; }
        .chart-price { text-align: right; }
        .chart-price-value { display: block; font-size: 1.4rem; font-weight: 700; color: #2C3E50; }
        .chart-price-change { font-size: 0.85rem; font-weight: 500; }
        .chart-price-change.positive { color: #4CAF50; }
        .chart-price-change.negative { color: #dc3545; }
        .chart-area { margin: 16px 0; }
        .chart-svg { width: 100%; height: auto; }
        @media (max-width: 992px) { .crypto-showcase-grid { grid-template-columns: 1fr; } }
        @media (max-width: 576px) { .chart-header { flex-direction: column; align-items: flex-start; gap: 12px; } }

        /* ===== TESTIMONIALS ===== */
        .testimonials { padding: 80px 0; background: #F8FAFB; }
        .testimonials-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        .testimonial-card {
          background: white;
          padding: 28px 24px;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.04);
        }
        .testimonial-header { display: flex; align-items: center; gap: 14px; margin-bottom: 12px; }
        .testimonial-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: #E8F5E9;
          color: #4CAF50;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1rem;
        }
        .testimonial-name { font-weight: 600; color: #2C3E50; margin: 0; }
        .testimonial-role { font-size: 0.85rem; color: #6c757d; }
        .testimonial-rating { color: #F4B400; font-size: 0.9rem; margin-bottom: 8px; }
        .testimonial-content { color: #2C3E50; line-height: 1.7; font-style: italic; }
        @media (max-width: 992px) { .testimonials-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 576px) { .testimonials-grid { grid-template-columns: 1fr; } }

        /* ===== FAQ ===== */
        .faq { padding: 80px 0; }
        .faq-list { max-width: 800px; margin: 0 auto; }
        .faq-item {
          border-bottom: 1px solid #E9ECEF;
          padding: 8px 0;
        }
        .faq-question {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          padding: 16px 0;
          border: none;
          background: none;
          font-size: 1.05rem;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
          color: #2C3E50;
          text-align: left;
        }
        .faq-question:hover { color: #4CAF50; }
        .faq-icon { font-size: 1.4rem; color: #6c757d; transition: transform 0.3s; }
        .faq-item.open .faq-icon { transform: rotate(180deg); }
        .faq-answer {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.4s ease, padding 0.3s ease;
        }
        .faq-item.open .faq-answer {
          max-height: 200px;
          padding-bottom: 16px;
        }
        .faq-answer p { color: #6c757d; line-height: 1.7; margin: 0; }

        /* ===== CTA ===== */
        .cta { padding: 80px 0; }
        .cta-card {
          background: linear-gradient(135deg, #4CAF50 0%, #2196F3 100%);
          border-radius: 24px;
          padding: 60px 48px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .cta-content { position: relative; z-index: 1; }
        .cta-flower { font-size: 3rem; display: block; margin-bottom: 16px; }
        .cta-title { font-size: 2.4rem; font-weight: 700; color: white; margin-bottom: 12px; }
        .cta-subtitle { font-size: 1.1rem; color: rgba(255,255,255,0.85); max-width: 600px; margin: 0 auto 32px; line-height: 1.6; }
        .cta-actions { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; margin-bottom: 24px; }
        .cta-benefits {
          display: flex;
          gap: 24px;
          justify-content: center;
          flex-wrap: wrap;
          color: rgba(255,255,255,0.85);
          font-size: 0.95rem;
        }
        .cta-benefits span { display: flex; align-items: center; gap: 6px; }
        @media (max-width: 576px) {
          .cta-card { padding: 40px 24px; }
          .cta-title { font-size: 1.8rem; }
          .cta-actions { flex-direction: column; align-items: center; }
          .cta-benefits { flex-direction: column; align-items: center; gap: 8px; }
        }

        /* ===== FOOTER ===== */
        .footer {
          background: #1a1a2e;
          color: rgba(255,255,255,0.7);
          padding: 60px 0 30px;
        }
        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 40px;
          margin-bottom: 40px;
        }
        .footer-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          font-weight: 700;
          font-size: 1.4rem;
          color: white;
        }
        .footer-logo .logo-text { background: linear-gradient(135deg, #4CAF50, #2196F3); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .footer-description { font-size: 0.95rem; line-height: 1.7; margin-top: 12px; max-width: 320px; }
        .footer-links h4 { color: white; font-size: 1rem; font-weight: 600; margin-bottom: 16px; }
        .footer-links a {
          display: block;
          color: rgba(255,255,255,0.6);
          text-decoration: none;
          padding: 4px 0;
          transition: color 0.3s;
          font-size: 0.9rem;
        }
        .footer-links a:hover { color: white; }
        .footer-bottom {
          border-top: 1px solid rgba(255,255,255,0.08);
          padding-top: 20px;
          text-align: center;
          font-size: 0.9rem;
          color: rgba(255,255,255,0.4);
        }
        @media (max-width: 992px) { .footer-grid { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 576px) { .footer-grid { grid-template-columns: 1fr; text-align: center; } .footer-description { margin: 12px auto; } }
      `}</style>
    </div>
  );
};

export default LandingPage;