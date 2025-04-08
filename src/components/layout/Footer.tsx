import Link from "next/link";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background border-t-2 border-black py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <h2 className="text-2xl font-bold mb-4">Veridie</h2>
            <p className="text-foreground/80 max-w-md">
              Connect with elite college consultants who are current students at top universities. Get personalized guidance from mentors who've been there.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-foreground/80 hover:text-main transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/mentors" className="text-foreground/80 hover:text-main transition-colors">
                  Mentors
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-foreground/80 hover:text-main transition-colors">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-bold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/terms" className="text-foreground/80 hover:text-main transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-foreground/80 hover:text-main transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-foreground/80 hover:text-main transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t-2 border-black mt-8 pt-8 text-center">
          <p className="text-foreground/80">
            © {currentYear} Veridie. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
