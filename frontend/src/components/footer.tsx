import { Link } from "wouter";
import { ArrowRightLeft, Twitter, Github, MessageCircle, Send } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: "Protocol",
      links: [
        { label: "Swap", href: "/swap" },
        { label: "Pools", href: "/pools" },
        { label: "Analytics", href: "/analytics" },
        { label: "Docs", href: "/docs" },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "Documentation", href: "/docs" },
        { label: "API Reference", href: "/docs#api" },
        { label: "Brand Kit", href: "#" },
        { label: "Bug Bounty", href: "#" },
      ],
    },
    {
      title: "Community",
      links: [
        { label: "Governance", href: "#" },
        { label: "Forum", href: "#" },
        { label: "Blog", href: "#" },
        { label: "Newsletter", href: "#" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Terms of Service", href: "#" },
        { label: "Privacy Policy", href: "#" },
        { label: "Cookie Policy", href: "#" },
        { label: "Risk Disclosure", href: "#" },
      ],
    },
  ];

  const socialLinks = [
    { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
    { icon: MessageCircle, href: "https://discord.com", label: "Discord" },
    { icon: Send, href: "https://telegram.org", label: "Telegram" },
    { icon: Github, href: "https://github.com", label: "GitHub" },
  ];

  return (
    <footer className="border-t border-gray-200 bg-gray-50/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
            {/* Logo and Description */}
            <div className="col-span-2 md:col-span-2">
              <Link href="/">
                <a className="flex items-center space-x-2 mb-4">
                  <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
                    <ArrowRightLeft className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xl font-bold gradient-text">NexSwap</span>
                </a>
              </Link>
              <p className="text-gray-600 text-sm mb-6 max-w-sm">
                The next generation decentralized exchange with advanced liquidity pools and maximum earning potential.
              </p>
              <div className="flex space-x-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-gradient-middle transition-colors duration-200"
                    aria-label={social.label}
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Footer Links */}
            {footerSections.map((section) => (
              <div key={section.title} className="col-span-1">
                <h3 className="font-semibold text-gray-900 mb-4">{section.title}</h3>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      {link.href.startsWith('/') ? (
                        <Link href={link.href}>
                          <a className="text-gray-600 hover:text-gradient-middle transition-colors duration-200 text-sm">
                            {link.label}
                          </a>
                        </Link>
                      ) : (
                        <a
                          href={link.href}
                          className="text-gray-600 hover:text-gradient-middle transition-colors duration-200 text-sm"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {link.label}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-200 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-gray-500">
              © {currentYear} NexSwap. All rights reserved.
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <span>Built on Ethereum</span>
              <span className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>All systems operational</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}