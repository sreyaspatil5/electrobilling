import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowOutward, CheckCircleOutline, ElectricBolt, Inventory2Outlined,
  BusinessOutlined, MailOutline, QueryStats, ReceiptLong,
} from '@mui/icons-material';
import './landingPage.css';

const features = [
  {
    icon: <ReceiptLong />,
    number: '01',
    title: 'Bills that add up right',
    copy: 'Build detailed invoices with CGST, SGST or IGST, discounts, due dates and clear payment status. Download a customer-ready PDF when you are done.',
  },
  {
    icon: <Inventory2Outlined />,
    number: '02',
    title: 'Your catalog, in order',
    copy: 'Keep products, prices, GST rates and stock in one searchable catalogue. Add an item to a bill without entering its details all over again.',
  },
  {
    icon: <QueryStats />,
    number: '03',
    title: 'A clearer view of business',
    copy: 'See recent invoices and daily, weekly and monthly sales. Reports make it easier to spot revenue trends, top customers and popular products.',
  },
];

const previewRows = [
  { invoice: 'EB-1048', customer: 'Metro Supplies', amount: '₹18,880', status: 'Paid' },
  { invoice: 'EB-1047', customer: 'Bright Home Supply', amount: '₹7,450', status: 'Pending' },
  { invoice: 'EB-1046', customer: 'Kumar & Sons', amount: '₹12,260', status: 'Paid' },
];

const LandingPage = () => (
  <main className="landing-page">
    <header className="landing-header">
      <div className="header-brand-group">
        <a className="brand-lockup" href="#top" aria-label="ElectroBill home">
          <span className="brand-mark"><ElectricBolt fontSize="small" /></span><span>ElectroBill</span>
        </a>
        <a className="brand-credit" href="https://vops.digital/" target="_blank" rel="noreferrer">A product by VardhamanOps</a>
      </div>
      <nav className="landing-nav" aria-label="Main navigation">
        <a href="#features">What you can do</a>
        <a href="#how-it-works">How it works</a>
        <a className="nav-signin" href="/login">Sign in</a>
        <Link className="button button-small button-dark" to="/login?mode=register">Get started <ArrowOutward fontSize="small" /></Link>
      </nav>
    </header>

    <section className="hero-section" id="top">
      <div className="hero-copy">
        <div className="eyebrow"><span className="eyebrow-dot" /> Made for businesses across industries <span className="eyebrow-divider">·</span> Free to use</div>
        <h1>Good business.<br /><span>Less busywork.</span></h1>
        <p className="hero-description">Billing, products and customers, together at last. ElectroBill helps businesses keep sales moving and paperwork in order.</p>
        <div className="hero-actions">
          <Link className="button button-orange" to="/login?mode=register">Apply for free access <ArrowOutward fontSize="small" /></Link>
          <a className="text-link" href="#features">Take a closer look <span>↓</span></a>
        </div>
        <p className="approval-note"><CheckCircleOutline fontSize="small" /> Free to use. New accounts are approved by an administrator.</p>
      </div>

      <div className="workspace-preview" aria-label="Preview of the ElectroBill billing workspace">
        <aside className="preview-sidebar">
          <div className="preview-brand"><span className="preview-mark"><ElectricBolt fontSize="small" /></span><b>ElectroBill</b></div>
          <div className="preview-nav-item is-current"><span className="preview-nav-icon">▦</span> Overview</div>
          <div className="preview-nav-item"><span className="preview-nav-icon">＋</span> Create bill</div>
          <div className="preview-nav-item"><span className="preview-nav-icon">▤</span> Invoices</div>
          <div className="preview-nav-item"><span className="preview-nav-icon">⌂</span> Customers</div>
          <div className="preview-nav-item"><span className="preview-nav-icon">▧</span> Products</div>
          <div className="preview-sidebar-bottom"><span className="preview-avatar">AS</span><span><b>Account admin</b><small>Your workspace</small></span></div>
        </aside>
        <div className="preview-main">
          <div className="preview-topline"><div><span className="preview-kicker">SAMPLE WORKSPACE</span><h2>Good morning, Anil</h2></div><span className="preview-business"><BusinessOutlined fontSize="small" /> Northstar Trading</span></div>
          <div className="preview-stat-grid">
            <div className="preview-stat"><span>Sales today</span><b>₹38,590</b><small className="stat-positive">↑ 12% <i>vs last week</i></small></div>
            <div className="preview-stat"><span>This week</span><b>₹1,84,260</b><small>Across 42 invoices</small></div>
            <div className="preview-stat"><span>Invoices</span><b>1,284</b><small>All time</small></div>
          </div>
          <div className="preview-table-wrap">
            <div className="preview-table-heading"><b>Recent invoices</b><span>View all <ArrowOutward fontSize="inherit" /></span></div>
            <div className="preview-table-labels"><span>INVOICE</span><span>CUSTOMER</span><span>AMOUNT</span><span>STATUS</span></div>
            {previewRows.map((row) => <div className="preview-row" key={row.invoice}><b>{row.invoice}</b><span>{row.customer}</span><strong>{row.amount}</strong><span className={`preview-status ${row.status === 'Paid' ? 'status-paid' : 'status-pending'}`}>{row.status}</span></div>)}
          </div>
          <div className="preview-footnote"><span className="preview-online-dot" /> Your business at a glance</div>
        </div>
      </div>
      <div className="preview-caption"><span>THE DAILY VIEW</span> Less hunting for numbers. More time for the next customer.</div>
    </section>

    <section className="feature-section" id="features">
      <div className="section-heading"><span className="section-label">A better rhythm in the workday</span><h2>From first item to final invoice.</h2><p>One practical workspace for the everyday details of running a business.</p></div>
      <div className="feature-grid">
        {features.map((feature) => <article className="feature-item" key={feature.number}>
          <div className="feature-topline"><span className="feature-icon">{feature.icon}</span><span className="feature-number">{feature.number}</span></div>
          <h3>{feature.title}</h3><p>{feature.copy}</p>
        </article>)}
      </div>
    </section>

    <section className="workflow-section" id="how-it-works">
      <div className="workflow-intro"><span className="section-label">A straightforward setup</span><h2>Start with the way your business already works.</h2><p>Add your business details, save the products or services you offer, then make a bill whenever an order comes in.</p><Link className="button button-light" to="/login?mode=register">Apply for a free account <ArrowOutward fontSize="small" /></Link></div>
      <div className="workflow-list">
        <div className="workflow-step"><span>01</span><div><h3>Set up your business</h3><p>Add your business details and preferences.</p></div></div>
        <div className="workflow-step"><span>02</span><div><h3>Bring your catalogue together</h3><p>Keep item names, prices, tax rates, units and stock handy.</p></div></div>
        <div className="workflow-step"><span>03</span><div><h3>Bill, share and track</h3><p>Create an invoice, download its PDF or email it to your customer.</p></div></div>
      </div>
    </section>

    <section className="details-band">
      <div className="details-title"><MailOutline /><span>Made to be useful<br />on a busy day.</span></div>
      <div className="details-point"><b>GST-ready billing</b><span>CGST + SGST or IGST, plus discounts and due dates.</span></div>
      <div className="details-point"><b>PDFs and email</b><span>Download invoices or send them directly to customers.</span></div>
      <div className="details-point"><b>No software fee</b><span>ElectroBill is free to use, with no subscription charge.</span></div>
    </section>

    <section className="closing-section"><span className="section-label">Keep the day moving</span><h2>Make room for the work<br />that matters.</h2><p>Get your billing and business records into one simple workspace.</p><Link className="button button-orange" to="/login?mode=register">Apply for free access <ArrowOutward fontSize="small" /></Link><span className="closing-note">Account applications are reviewed by an administrator.</span></section>

    <footer className="landing-footer">
      <a className="brand-lockup footer-brand" href="#top"><span className="brand-mark"><ElectricBolt fontSize="small" /></span><span>ElectroBill</span></a>
      <span className="footer-copy">A product by <a href="https://vops.digital/" target="_blank" rel="noreferrer">VardhamanOps <ArrowOutward fontSize="inherit" /></a></span>
      <a className="footer-email" href="mailto:hello@vops.digital">hello@vops.digital</a>
    </footer>
  </main>
);

export default LandingPage;