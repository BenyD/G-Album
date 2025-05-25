export default function RefundPolicyPage() {
  return (
    <div className="flex flex-col min-h-screen pt-16">
      {/* Hero Section */}
      <section className="relative bg-linear-to-br from-red-600 to-red-900 text-white py-20 overflow-hidden">
        {/* Background blur elements */}
        <div className="absolute top-20 left-20 w-72 h-72 rounded-full bg-red-400 opacity-30 blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 rounded-full bg-red-300 opacity-20 blur-3xl"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Refund Policy</h1>
            <p className="text-xl text-red-100">Our commitment to your satisfaction and return process</p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto prose prose-lg">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
              <p className="text-red-800 mb-2">
                <strong>Last updated:</strong> {new Date().toLocaleDateString()}
              </p>
              <p className="text-red-700 text-sm mb-0">
                At G Album, your satisfaction is our priority. This policy outlines our refund and return procedures.
              </p>
            </div>

            <div className="space-y-8 text-slate-700">
              <section>
                <h2 className="text-2xl font-bold text-red-900 mb-4">1. Our Satisfaction Guarantee</h2>
                <p className="mb-4">
                  We stand behind the quality of our photo albums and are committed to ensuring your complete
                  satisfaction. If you're not happy with your order, we're here to help make it right.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-red-900 mb-4">2. Return Eligibility</h2>
                <h3 className="text-xl font-semibold text-red-800 mb-3">Eligible Returns</h3>
                <p className="mb-4">You may return your album for a full refund if:</p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li>The album arrives damaged or defective</li>
                  <li>We made an error in production (wrong photos, incorrect layout, etc.)</li>
                  <li>The album quality does not meet our published standards</li>
                  <li>You received the wrong product</li>
                </ul>

                <h3 className="text-xl font-semibold text-red-800 mb-3">Non-Eligible Returns</h3>
                <p className="mb-4">We cannot accept returns for:</p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li>Change of mind or buyer's remorse</li>
                  <li>Albums that have been used, damaged, or altered after delivery</li>
                  <li>Custom orders that were produced according to your specifications</li>
                  <li>Albums returned after the 30-day return window</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-red-900 mb-4">3. Return Process</h2>
                <h3 className="text-xl font-semibold text-red-800 mb-3">Step 1: Contact Us</h3>
                <p className="mb-4">
                  Contact our customer service team within 30 days of delivery to initiate a return. Please provide:
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li>Your order number</li>
                  <li>Photos of the issue (if applicable)</li>
                  <li>Detailed description of the problem</li>
                  <li>Your preferred resolution (refund, replacement, or store credit)</li>
                </ul>

                <h3 className="text-xl font-semibold text-red-800 mb-3">Step 2: Return Authorization</h3>
                <p className="mb-4">
                  Once we review your request, we'll provide a Return Authorization (RA) number and return instructions.
                  Do not return items without an RA number.
                </p>

                <h3 className="text-xl font-semibold text-red-800 mb-3">Step 3: Ship the Item</h3>
                <p className="mb-4">
                  Package the album securely and ship it to the address provided. For eligible returns, we'll cover
                  return shipping costs.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-red-900 mb-4">4. Refund Timeline</h2>
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-4">
                  <h3 className="text-lg font-semibold text-red-800 mb-3">Processing Times</h3>
                  <ul className="list-disc pl-6 space-y-2 text-red-700">
                    <li>
                      <strong>Inspection:</strong> 2-3 business days after we receive your return
                    </li>
                    <li>
                      <strong>Refund Processing:</strong> 3-5 business days after approval
                    </li>
                    <li>
                      <strong>Bank Processing:</strong> 5-10 business days (varies by bank)
                    </li>
                  </ul>
                </div>
                <p className="mb-4">Refunds will be processed to the original payment method used for the purchase.</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-red-900 mb-4">5. Replacement Policy</h2>
                <p className="mb-4">
                  If your album arrives damaged or defective, we'll gladly provide a replacement at no additional cost.
                  Replacement orders are prioritized and typically ship within 5-7 business days.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-red-900 mb-4">6. Partial Refunds</h2>
                <p className="mb-4">Partial refunds may be offered in the following situations:</p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li>Minor quality issues that don't significantly impact the album</li>
                  <li>Slight color variations within acceptable printing standards</li>
                  <li>Albums returned in less than perfect condition</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-red-900 mb-4">7. Cancellation Policy</h2>
                <h3 className="text-xl font-semibold text-red-800 mb-3">Before Production</h3>
                <p className="mb-4">
                  Orders can be cancelled for a full refund before production begins. Once production starts,
                  cancellation may not be possible.
                </p>

                <h3 className="text-xl font-semibold text-red-800 mb-3">During Production</h3>
                <p className="mb-4">
                  If you need to cancel during production, please contact us immediately. Depending on the production
                  stage, partial refunds may be available.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-red-900 mb-4">8. Quality Assurance</h2>
                <p className="mb-4">
                  Every album undergoes quality inspection before shipping. However, if you notice any issues upon
                  delivery, please contact us within 48 hours for the fastest resolution.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-red-900 mb-4">9. Store Credit</h2>
                <p className="mb-4">
                  In some cases, we may offer store credit as an alternative to refunds. Store credit:
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li>Never expires</li>
                  <li>Can be used for any future purchase</li>
                  <li>Is transferable to family members</li>
                  <li>May include bonus credit for the inconvenience</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-red-900 mb-4">10. Contact Information</h2>
                <p className="mb-4">For returns, refunds, or any questions about this policy, please contact us:</p>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="mb-2">
                    <strong>G Album Customer Service</strong>
                  </p>
                  <p className="mb-2">Email: returns@galbum.com</p>
                  <p className="mb-2">Phone: +91 1234567890</p>
                  <p className="mb-2">WhatsApp: +91 9876543210</p>
                  <p className="mb-0">Hours: Monday-Saturday, 9:00 AM - 6:00 PM IST</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-red-900 mb-4">11. Policy Updates</h2>
                <p className="mb-4">
                  We may update this Refund Policy from time to time. Any changes will be posted on our website with an
                  updated "Last updated" date. Continued use of our services constitutes acceptance of the updated
                  policy.
                </p>
              </section>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
