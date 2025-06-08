"use client";

import PageHero from "@/components/page-hero";

export default function TermsOfServicePage() {
  return (
    <div className="flex flex-col min-h-screen pt-16">
      <PageHero
        title="Terms of Service"
        subtitle="The terms and conditions for using our services"
        className="py-20"
      />

      {/* Content Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto prose prose-lg">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
              <p className="text-red-800 mb-2">
                <strong>Last updated:</strong> {new Date().toLocaleDateString()}
              </p>
              <p className="text-red-700 text-sm mb-0">
                By using G Album&apos;s services, you agree to be bound by these
                Terms of Service. Please read them carefully.
              </p>
            </div>

            <div className="space-y-8 text-slate-700">
              <section>
                <h2 className="text-2xl font-bold text-red-900 mb-4">
                  1. Acceptance of Terms
                </h2>
                <p className="mb-4">
                  By accessing and using G Album&apos;s website and services,
                  you accept and agree to be bound by the terms and provision of
                  this agreement. If you do not agree to abide by the above,
                  please do not use this service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-red-900 mb-4">
                  2. Description of Service
                </h2>
                <p className="mb-4">
                  G Album provides professional photo album creation services,
                  including:
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li>Custom photo album design and printing</li>
                  <li>Digital photo processing and enhancement</li>
                  <li>Album binding and finishing services</li>
                  <li>Delivery services across India</li>
                  <li>Customer support and consultation</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-red-900 mb-4">
                  3. User Responsibilities
                </h2>
                <h3 className="text-xl font-semibold text-red-800 mb-3">
                  Content Ownership
                </h3>
                <p className="mb-4">
                  You represent and warrant that you own or have the necessary
                  rights to all photos and content you submit to us for album
                  creation.
                </p>

                <h3 className="text-xl font-semibold text-red-800 mb-3">
                  Prohibited Content
                </h3>
                <p className="mb-4">You agree not to submit content that is:</p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li>Illegal, harmful, or offensive</li>
                  <li>Infringing on intellectual property rights</li>
                  <li>
                    Containing personal information of others without consent
                  </li>
                  <li>Violating any applicable laws or regulations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-red-900 mb-4">
                  4. Orders and Payment
                </h2>
                <h3 className="text-xl font-semibold text-red-800 mb-3">
                  Order Process
                </h3>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li>All orders are subject to acceptance by G Album</li>
                  <li>
                    We reserve the right to refuse or cancel orders at our
                    discretion
                  </li>
                  <li>Order confirmation will be sent via email</li>
                  <li>
                    Changes to orders may be possible before production begins
                  </li>
                </ul>

                <h3 className="text-xl font-semibold text-red-800 mb-3">
                  Payment Terms
                </h3>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li>Payment is required before production begins</li>
                  <li>
                    We accept various payment methods as displayed on our
                    website
                  </li>
                  <li>
                    All prices are in Indian Rupees (INR) and include applicable
                    taxes
                  </li>
                  <li>Prices are subject to change without notice</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-red-900 mb-4">
                  5. Production and Delivery
                </h2>
                <h3 className="text-xl font-semibold text-red-800 mb-3">
                  Production Timeline
                </h3>
                <p className="mb-4">
                  Production times are estimates and may vary based on order
                  complexity, seasonal demand, and other factors. We will
                  provide estimated delivery dates but cannot guarantee specific
                  delivery times.
                </p>

                <h3 className="text-xl font-semibold text-red-800 mb-3">
                  Delivery
                </h3>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li>
                    We deliver across India through reliable courier services
                  </li>
                  <li>
                    Delivery charges may apply based on location and order value
                  </li>
                  <li>Risk of loss transfers to you upon delivery</li>
                  <li>
                    You must inspect items upon delivery and report any issues
                    immediately
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-red-900 mb-4">
                  6. Intellectual Property
                </h2>
                <p className="mb-4">
                  You retain ownership of your photos and content. By using our
                  services, you grant G Album a limited license to use your
                  content solely for the purpose of creating your album and
                  providing our services.
                </p>
                <p className="mb-4">
                  All G Album branding, website content, and proprietary
                  processes remain the intellectual property of G Album.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-red-900 mb-4">
                  7. Quality and Satisfaction
                </h2>
                <p className="mb-4">
                  We strive to deliver high-quality products that meet your
                  expectations. However, slight variations in color, texture,
                  and finish may occur due to the nature of printing and
                  materials used.
                </p>
                <p className="mb-4">
                  If you are not satisfied with your order, please refer to our
                  Refund Policy for information about returns and refunds.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-red-900 mb-4">
                  8. Limitation of Liability
                </h2>
                <p className="mb-4">
                  G Album&apos;s liability is limited to the cost of the product
                  purchased. We are not liable for any indirect, incidental,
                  special, or consequential damages arising from the use of our
                  services.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-red-900 mb-4">
                  9. Privacy
                </h2>
                <p className="mb-4">
                  Your privacy is important to us. Please review our Privacy
                  Policy to understand how we collect, use, and protect your
                  personal information.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-red-900 mb-4">
                  10. Modifications
                </h2>
                <p className="mb-4">
                  G Album reserves the right to modify these Terms of Service at
                  any time. Changes will be effective immediately upon posting
                  on our website. Your continued use of our services constitutes
                  acceptance of the modified terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-red-900 mb-4">
                  11. Governing Law
                </h2>
                <p className="mb-4">
                  These Terms of Service are governed by the laws of India. Any
                  disputes arising from these terms or our services will be
                  subject to the jurisdiction of the courts in Mumbai,
                  Maharashtra.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-red-900 mb-4">
                  12. Contact Information
                </h2>
                <p className="mb-4">
                  If you have any questions about these Terms of Service, please
                  contact us:
                </p>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="mb-2">
                    <strong>G Album</strong>
                  </p>
                  <p className="mb-2">Email: kumaranmadras@gmail.com</p>
                  <p className="mb-2">Phone: +91 9444639912</p>
                  <p className="mb-0">
                    Address: 123A Triplicane High Road, Chennai, Tamil Nadu,
                    India
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
