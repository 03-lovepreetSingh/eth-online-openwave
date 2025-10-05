import React from 'react';
import './globals.css';

export const metadata = {
  title: 'U2U Subnet Dashboard',
  description: 'A dashboard for managing and interacting with U2U subnets and blockchains.',
};

const RootLayout = ({ children }) => {
  return (
    <html lang="en">
      <body>
        <header>
          <h1>U2U Subnet Dashboard</h1>
        </header>
        <main>{children}</main>
        <footer>
          <p>&copy; {new Date().getFullYear()} U2U Subnet Project</p>
        </footer>
      </body>
    </html>
  );
};

export default RootLayout;