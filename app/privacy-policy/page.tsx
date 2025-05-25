"use client"

import { motion } from "framer-motion"

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
}

export default function PrivacyPolicyPage() {
  return (
    <div className="flex flex-col min-h-screen pt-16">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-red-600 to-red-900 text-white py-20 overflow-hidden">
        {/* Background blur elements */}
        <motion.div
          className="absolute top-20 left-20 w-72 h-72 rounded-full bg-red-400 opacity-30 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-80 h-80 rounded-full bg-red-300 opacity-20 blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 6,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 2,
          }}
        />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Privacy Policy</h1>
            <p className="text-xl text-red-100">How we protect and handle your personal information</p>
          </motion.div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto prose prose-lg">
            <motion.div
              className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-red-800 mb-2">
                <strong>Last updated:</strong> {new Date().toLocaleDateString()}
              </p>
              <p className="text-red-700 text-sm mb-0">
                This Privacy Policy describes how G Album collects, uses, and protects your personal information when
                you use our services.
              </p>
            </motion.div>

            <motion.div className="space-y-8 text-slate-700" variants={fadeInUp} initial="initial" animate="animate">
              <section>
                <h2 className="text-2xl font-bold text-red-900 mb-4">Information We Collect</h2>
                <h3 className="text-xl font-semibold text-red-800 mb-3">Personal Information</h3>
                <p className="mb-4">When you use our services, we may collect the following personal information:</p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li>Name and contact information (email address, phone number, mailing address)</li>
                  <li>Payment information (processed securely through our payment providers)</li>
                  <li>Photos and images you upload for album creation</li>
                  <li>Order history and preferences</li>
                  <li>Communication records with our customer service team</li>
                </ul>

                <h3 className="text-xl font-semibold text-red-800 mb-3">Automatically Collected Information</h3>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li>Device information (IP address, browser type, operating system)</li>
                  <li>Usage data (pages visited, time spent on site, click patterns)</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-red-900 mb-4">How We Use Your Information</h2>
                <p className="mb-4">We use your personal information for the following purposes:</p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li>Processing and fulfilling your photo album orders</li>
                  <li>Communicating with you about your orders and our services</li>
                  <li>Providing customer support and responding to inquiries</li>
                  <li>Improving our website and services</li>
                  <li>Sending promotional emails (with your consent)</li>
                  <li>Complying with legal obligations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-red-900 mb-4">Information Sharing and Disclosure</h2>
                <p className="mb-4">
                  We do not sell, trade, or rent your personal information to third parties. We may share your
                  information in the following circumstances:
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li>
                    <strong>Service Providers:</strong> With trusted third-party vendors who help us operate our
                    business (payment processors, shipping companies, printing services)
                  </li>
                  <li>
                    <strong>Legal Requirements:</strong> When required by law or to protect our rights and safety
                  </li>
                  <li>
                    <strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-red-900 mb-4">Data Security</h2>
                <p className="mb-4">
                  We implement appropriate technical and organizational measures to protect your personal information
                  against unauthorized access, alteration, disclosure, or destruction. This includes:
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li>SSL encryption for data transmission</li>
                  <li>Secure servers and databases</li>
                  <li>Regular security audits and updates</li>
                  <li>Limited access to personal information on a need-to-know basis</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-red-900 mb-4">Your Rights</h2>
                <p className="mb-4">You have the following rights regarding your personal information:</p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li>
                    <strong>Access:</strong> Request a copy of the personal information we hold about you
                  </li>
                  <li>
                    <strong>Correction:</strong> Request correction of inaccurate or incomplete information
                  </li>
                  <li>
                    <strong>Deletion:</strong> Request deletion of your personal information (subject to legal
                    requirements)
                  </li>
                  <li>
                    <strong>Opt-out:</strong> Unsubscribe from marketing communications at any time
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-red-900 mb-4">Cookies and Tracking</h2>
                <p className="mb-4">
                  We use cookies and similar technologies to enhance your browsing experience, analyze website traffic,
                  and personalize content. You can control cookie settings through your browser preferences.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-red-900 mb-4">Children's Privacy</h2>
                <p className="mb-4">
                  Our services are not intended for children under 13 years of age. We do not knowingly collect personal
                  information from children under 13.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-red-900 mb-4">Changes to This Policy</h2>
                <p className="mb-4">
                  We may update this Privacy Policy from time to time. We will notify you of any material changes by
                  posting the new policy on our website and updating the "Last updated" date.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-red-900 mb-4">Contact Us</h2>
                <p className="mb-4">
                  If you have any questions about this Privacy Policy or our data practices, please contact us:
                </p>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="mb-2">
                    <strong>G Album</strong>
                  </p>
                  <p className="mb-2">Email: privacy@galbum.com</p>
                  <p className="mb-2">Phone: +91 1234567890</p>
                  <p className="mb-0">Address: 123 Album Street, Mumbai, Maharashtra, India</p>
                </div>
              </section>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
