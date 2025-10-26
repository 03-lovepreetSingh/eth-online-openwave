import React from 'react';
import './globals.css';

export const metadata = {
  title: 'HBAR Subnet Dashboard',
  description: 'A dashboard for managing and interacting with HBAR subnets and blockchains.',
};

const RootLayout = ({ children }) => {
  return (
    <html lang="en">
      <body>
        <header>
          <h1>HBAR Subnet Dashboard</h1>
        </header>
        <main>{children}</main>
        <footer>
          <p>&copy; {new Date().getFullYear()} HBAR Subnet Project</p>
        </footer>
      </body>
    </html>
  );
};

export default RootLayout;