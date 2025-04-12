'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
            <div className="p-8">
              <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
              
              <div className="prose max-w-none">
                <p className="mb-4">Last Updated: April 9, 2025</p>
                
                <h2 className="text-xl font-bold mt-8 mb-4">1. Introduction</h2>
                <p>Welcome to Veridie&apos;s Privacy Policy. At Veridie, we respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.</p>
                
                <h2 className="text-xl font-bold mt-8 mb-4">2. Information We Collect</h2>
                <p>We collect several types of information from and about users of our website, including:</p>
                <ul className="list-disc pl-6 mb-4">
                  <li><strong>Personal Information:</strong> Name, email address, phone number, and other contact details you provide when creating an account or using our services.</li>
                  <li><strong>Profile Information:</strong> Educational background, test scores, extracurricular activities, and other information you choose to share on your profile.</li>
                  <li><strong>Payment Information:</strong> Credit card details and billing information when you make purchases through our platform.</li>
                  <li><strong>Usage Data:</strong> Information about how you interact with our website, including pages visited, time spent, and features used.</li>
                  <li><strong>Device Information:</strong> IP address, browser type, operating system, and other technical information about the device you use to access our website.</li>
                </ul>
                
                <h2 className="text-xl font-bold mt-8 mb-4">3. How We Use Your Information</h2>
                <p>We use the information we collect for various purposes, including:</p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Providing, maintaining, and improving our services</li>
                  <li>Processing transactions and sending related information</li>
                  <li>Connecting students with consultants</li>
                  <li>Sending administrative messages, updates, and promotional content</li>
                  <li>Analyzing usage patterns to enhance user experience</li>
                  <li>Protecting against fraudulent or unauthorized activity</li>
                </ul>
                
                <h2 className="text-xl font-bold mt-8 mb-4">4. How We Share Your Information</h2>
                <p>We may share your information in the following situations:</p>
                <ul className="list-disc pl-6 mb-4">
                  <li><strong>With Consultants and Students:</strong> When you connect with a consultant or student through our platform, certain profile information is shared to facilitate the relationship.</li>
                  <li><strong>With Service Providers:</strong> We may share your information with third-party vendors who provide services on our behalf, such as payment processing and data analysis.</li>
                  <li><strong>For Legal Purposes:</strong> We may disclose your information if required by law or in response to valid requests by public authorities.</li>
                  <li><strong>Business Transfers:</strong> If we are involved in a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction.</li>
                </ul>
                
                <h2 className="text-xl font-bold mt-8 mb-4">5. Data Security</h2>
                <p>We implement reasonable security measures to protect your personal information from unauthorized access, use, or disclosure. However, no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.</p>
                
                <h2 className="text-xl font-bold mt-8 mb-4">6. Your Privacy Rights</h2>
                <p>Depending on your location, you may have certain rights regarding your personal information, including:</p>
                <ul className="list-disc pl-6 mb-4">
                  <li>The right to access and receive a copy of your personal information</li>
                  <li>The right to correct inaccurate or incomplete information</li>
                  <li>The right to request deletion of your personal information</li>
                  <li>The right to restrict or object to processing of your personal information</li>
                  <li>The right to data portability</li>
                </ul>
                <p>To exercise these rights, please contact us using the information provided in the &quot;Contact Us&quot; section.</p>
                
                <h2 className="text-xl font-bold mt-8 mb-4">7. Cookies and Tracking Technologies</h2>
                <p>We use cookies and similar tracking technologies to enhance your experience on our website. You can set your browser to refuse all or some browser cookies, but this may affect certain features of our website.</p>
                
                <h2 className="text-xl font-bold mt-8 mb-4">8. Third-Party Links</h2>
                <p>Our website may contain links to third-party websites or services that are not owned or controlled by Veridie. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party websites or services.</p>
                
                <h2 className="text-xl font-bold mt-8 mb-4">9. Children&apos;s Privacy</h2>
                <p>Children&apos;s Privacy is important to us. Our services are not intended for individuals under the age of 13. We do not knowingly collect personal information from children under 13. If we learn we have collected personal information from a child under 13, we will delete that information promptly.</p>
                
                <h2 className="text-xl font-bold mt-8 mb-4">10. Changes to This Privacy Policy</h2>
                <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last Updated&quot; date. You are advised to review this Privacy Policy periodically for any changes.</p>
                
                <h2 className="text-xl font-bold mt-8 mb-4">11. Contact Us</h2>
                <p>If you have any questions about this Privacy Policy, please contact us at <a href="mailto:privacy@veridie.com" className="text-main underline">privacy@veridie.com</a>.</p>
              </div>
              
              <div className="mt-8 pt-8 border-t border-gray-200">
                <Link href="/terms" className="text-main hover:underline">
                  View our Terms of Service
                </Link>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
