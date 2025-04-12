'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

export default function TermsPage() {
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
              <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
              
              <div className="prose max-w-none">
                <p className="mb-4">Last Updated: April 9, 2025</p>
                
                <h2 className="text-xl font-bold mt-8 mb-4">1. Introduction</h2>
                <p>Welcome to Veridie! These Terms of Service (&quot;Terms&quot;) govern your use of the Veridie website, platform, and services (collectively, the &quot;Service&quot;). By accessing or using our Service, you agree to be bound by these Terms. If you disagree with any part of the Terms, you may not access the Service.</p>
                
                <h2 className="text-xl font-bold mt-8 mb-4">2. Definitions</h2>
                <p><strong>&quot;Veridie&quot;</strong> refers to our company, our website, and our platform.</p>
                <p><strong>&quot;Users&quot;</strong> refers to individuals who access or use our Service, including consultants and students.</p>
                <p><strong>&quot;Content&quot;</strong> refers to information, text, graphics, photos, designs, or other materials uploaded, posted, or otherwise made available through our Service.</p>
                
                <h2 className="text-xl font-bold mt-8 mb-4">3. User Accounts</h2>
                <p>When you create an account with us, you must provide accurate and complete information. You are responsible for safeguarding the password you use to access the Service and for any activities or actions under your password. We encourage you to use a strong password unique to our Service.</p>
                
                <h2 className="text-xl font-bold mt-8 mb-4">4. User Content</h2>
                <p>Our Service allows you to post, link, store, share, and otherwise make available certain information, text, graphics, videos, or other material. You retain any rights that you had in your User Content before posting it. By posting User Content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, adapt, publish, translate, and distribute it in any media format.</p>
                
                <h2 className="text-xl font-bold mt-8 mb-4">5. Consultant Services</h2>
                <p>Veridie provides a platform for college consultants to offer their services to students. We do not guarantee the quality, accuracy, or reliability of any consultant's services. Users engage with consultants at their own risk.</p>
                <p>Consultants are independent contractors and not employees of Veridie. We do not control, and are not responsible for, consultants' services, content, communications, or actions.</p>
                
                <h2 className="text-xl font-bold mt-8 mb-4">6. Payments and Fees</h2>
                <p>Certain aspects of our Service may require payment. All payments are processed securely through our payment processors. By making a payment, you agree to provide accurate and complete payment information. We reserve the right to change our prices at any time.</p>
                
                <h2 className="text-xl font-bold mt-8 mb-4">7. Refund Policy</h2>
                <p>Refunds are handled on a case-by-case basis. Please contact our support team if you are unsatisfied with a service you have purchased.</p>
                
                <h2 className="text-xl font-bold mt-8 mb-4">8. Intellectual Property</h2>
                <p>The Service and its original content, features, and functionality are and will remain the exclusive property of Veridie and its licensors. The Service is protected by copyright, trademark, and other laws. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of Veridie.</p>
                
                <h2 className="text-xl font-bold mt-8 mb-4">9. Termination</h2>
                <p>We may terminate or suspend your account immediately, without prior notice or liability, for any reason, including without limitation if you breach the Terms. Upon termination, your right to use the Service will immediately cease.</p>
                
                <h2 className="text-xl font-bold mt-8 mb-4">10. Limitation of Liability</h2>
                <p>In no event shall Veridie, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.</p>
                
                <h2 className="text-xl font-bold mt-8 mb-4">11. Disclaimer</h2>
                <p>Your use of the Service is at your sole risk. The Service is provided on an "AS IS" and "AS AVAILABLE" basis. The Service is provided without warranties of any kind, whether express or implied, including, but not limited to, implied warranties of merchantability, fitness for a particular purpose, non-infringement, or course of performance.</p>
                
                <h2 className="text-xl font-bold mt-8 mb-4">12. Governing Law</h2>
                <p>These Terms shall be governed and construed in accordance with the laws of the United States, without regard to its conflict of law provisions.</p>
                
                <h2 className="text-xl font-bold mt-8 mb-4">13. Changes to Terms</h2>
                <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.</p>
                
                <h2 className="text-xl font-bold mt-8 mb-4">14. Contact Us</h2>
                <p>If you have any questions about these Terms, please contact us at <a href="mailto:support@veridie.com" className="text-main underline">support@veridie.com</a>.</p>
              </div>
              
              <div className="mt-8 pt-8 border-t border-gray-200">
                <Link href="/privacy" className="text-main hover:underline">
                  View our Privacy Policy
                </Link>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
