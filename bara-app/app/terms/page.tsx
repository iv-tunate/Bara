"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronDown,
  ChevronUp,
  FileText,
  HelpCircle,
  ArrowLeft,
} from "lucide-react";

const termsSections = [
  {
    title: "1. Ownership Model — Corrected (Critical)",
    content: `Ownership of a script on Bara is not assumed.
Ownership is explicitly defined by the writer at the point of upload, where the writer must select one of the following:

- Full Transfer on Confirmation: Ownership transfers to the buyer once the transaction is confirmed.
- License-Based Ownership: The writer retains ownership and grants the buyer a defined usage license.

This selection:
- Is binding
- Is visible to buyers before payment
- Governs all rights after confirmation

Bara enforces ownership strictly according to the option selected during upload.`,
  },
  {
    title: "2. Platform Role & Disclaimer",
    content: `Bara operates solely as a digital marketplace and transaction facilitator.
Bara does not create, verify, or guarantee originality of scripts.
Bara does not act as a legal representative for buyers or writers.
Bara does not arbitrate creative quality or commercial success.
All transactions occur between users, governed by the rules of the platform.`,
  },
  {
    title: "3. Content Responsibility",
    content: `Writers affirm that any uploaded script:
- Is original or
- Is lawfully owned or licensed by them

Buyers acknowledge that Bara:
- Does not independently verify copyright ownership
- Is not responsible for third-party claims

Any copyright dispute is solely between the involved parties.`,
  },
  {
    title: "4. Transaction Lifecycle (Authoritative)",
    content: `Each transaction follows this lifecycle:
1. Payment Initiated
2. 14-Day Transaction Window Begins
3. Script View Access Granted
4. Revisions / Discussions Occur
5. Buyer Confirms or Cancels
6. Funds Released or Refunded

Any deviation outside this flow is unsupported and unprotected.`,
  },
  {
    title: "5. Script Access Controls",
    content: `Viewing access is granted immediately after payment.
Downloading is disabled until confirmation.
Any attempt to bypass download restrictions, screen capture protections, or technical safeguards is considered content theft.
Bara logs access attempts and may audit suspicious behavior.`,
  },
  {
    title: "6. Confirmation Effects",
    content: `Once confirmed:
- Ownership or license transfers according to upload selection
- Buyer gains permanent access
- Bara deducts 10% platform service fee
- Remaining funds are released to the writer

Confirmation is final and irreversible.`,
  },
  {
    title: "7. Cancellation Rules",
    content: `Cancellations are allowed only within the 14-day window.
On cancellation:
- Bara deducts a 5% processing fee
- Remaining balance is refunded

Buyer must immediately:
- Delete all copies
- Cease usage
- Acknowledge content removal

Violation results in permanent suspension.`,
  },
  {
    title: "8. Communication & Circumvention Policy",
    content: `Bara provides an in-platform chat system for all transaction-related communication.
Users must not:
- Move negotiations outside Bara
- Exchange private payment details
- Finalize agreements externally

If users choose to communicate off-platform:
- Bara bears no responsibility
- No dispute protection applies
- No refunds are guaranteed

Any attempt to bypass platform fees or protections may result in account termination.`,
  },
  {
    title: "9. Fraud, Misrepresentation & Abuse",
    content: `Bara maintains zero tolerance for:
- Script theft
- False ownership claims
- Payment manipulation
- Re-uploading purchased scripts
- Identity misrepresentation

Accounts engaging in such behavior may be:
- Permanently banned
- Reported to authorities
- Blocked from future access`,
  },
  {
    title: "10. Limitation of Liability",
    content: `To the maximum extent permitted by law, Bara is not liable for:
- Lost profits
- Creative disputes
- Unauthorized usage
- External agreements
- User misconduct

Use of Bara is at your own risk.`,
  },
  {
    title: "11. Account Security",
    content: `Users are responsible for:
- Protecting login credentials
- All activity on their account

Bara is not liable for losses caused by compromised accounts.`,
  },
  {
    title: "12. Marketplace Commissions & Refund Deductions",
    content: `Bara maintains the following fee structure to support platform operations:

- Sales Commission: Bara deducts a 10% platform service fee from every successful script sale made by a writer.
- Refund Deductions: In the event of a canceled script transaction within the 14-day window, Bara deducts a 5% processing fee from the total transaction amount before issuing the refund to the buyer.
- Secure Escrow: All funds are held in a secure escrow account during the 14-day transaction window to protect both parties.

These fees are non-negotiable and are automatically applied by the platform.`,
  },
  {
    title: "13. Platform Modifications & Governing Law",
    content: `Bara reserves the right to:
- Modify fees with notice
- Update features
- Enforce new policies
- Suspend accounts for risk prevention

These terms are governed by the applicable laws of Bara's operating jurisdiction.
Continued use implies acceptance of updated terms.`,
  },
];

const faqs = [
  {
    question: "Is my script safe on Bara?",
    answer:
      "Yes. Bara does not claim ownership of your work. You decide the ownership model (Full Transfer or License) upon upload. We just facilitate the secure transaction.",
  },
  {
    question: "When do I get paid?",
    answer:
      "Funds are released to your wallet immediately after the buyer confirms the transaction, or automatically if the 14-day window closes without a dispute (subject to review).",
  },
  {
    question: "Can I communicate outside of Bara?",
    answer:
      "We strongly discourage off-platform communication. Transactions or agreements made outside the app are not protected by our dispute resolution or refund policies.",
  },
  {
    question: "What happens if a buyer requests a refund?",
    answer:
      "Refunds are processed if requested within the 14-day window. A 5% processing fee is deducted from the refund amount. Once refunded, the buyer loses all access rights.",
  },
  {
    question: "Who owns the rights to a purchased script?",
    answer:
      "It depends on the writer's listing choice. 'Full Transfer' means you (the buyer) own it entirely. 'License-Based' means you have specific usage rights but the writer retains ownership.",
  },
];

export default function Terms() {
  const [openSection, setOpenSection] = useState<number | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleSection = (index: number) => {
    setOpenSection(openSection === index ? null : index);
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#810306] text-white py-12 px-6 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft size={18} className="mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Terms & Conditions
          </h1>
          <p className="text-white/80 text-lg leading-relaxed max-w-2xl">
            Please read these terms carefully. They govern your use of the Bara
            marketplace, ensuring a safe and fair environment for all creators
            and buyers.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">
        {/* Terms Section */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <FileText className="text-[#810306]" size={24} />
            <h2 className="text-2xl font-bold text-gray-900">Platform Terms</h2>
          </div>

          <div className="space-y-4">
            {termsSections.map((section, index) => (
              <div
                key={index}
                className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <button
                  onClick={() => toggleSection(index)}
                  className="w-full text-left px-5 py-4 bg-white flex justify-between items-center focus:outline-none"
                >
                  <span className="font-semibold text-gray-800 text-[15px]">
                    {section.title}
                  </span>
                  <span className="text-gray-400">
                    {openSection === index ? (
                      <ChevronUp size={20} className="text-[#810306]" />
                    ) : (
                      <ChevronDown size={20} />
                    )}
                  </span>
                </button>
                <div
                  className={`px-5 text-sm text-gray-600 leading-relaxed bg-gray-50/50 transition-all duration-300 ease-in-out border-t border-gray-100 ${
                    openSection === index
                      ? "max-h-[500px] opacity-100 py-4"
                      : "max-h-0 opacity-0 overflow-hidden"
                  }`}
                >
                  <div className="space-y-2">
                    {section.content.split("\n").map((line, i) =>
                      line.trim().startsWith("-") ? (
                        <li
                          key={i}
                          className="ml-4 list-disc marker:text-[#810306]"
                        >
                          {line.replace("-", "").trim()}
                        </li>
                      ) : (
                        <p
                          key={i}
                          className={`${line.trim() === "" ? "h-2" : ""}`}
                        >
                          {line}
                        </p>
                      ),
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Divider */}
        <hr className="border-gray-200" />

        {/* FAQs Section */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <HelpCircle className="text-[#810306]" size={24} />
            <h2 className="text-2xl font-bold text-gray-900">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full text-left px-5 py-4 flex justify-between items-start gap-4 focus:outline-none h-full"
                >
                  <span className="font-semibold text-gray-800 text-[15px]">
                    {faq.question}
                  </span>
                  <div className="mt-0.5 shrink-0">
                    {openFaq === index ? (
                      <ChevronUp size={18} className="text-[#810306]" />
                    ) : (
                      <ChevronDown size={18} className="text-gray-400" />
                    )}
                  </div>
                </button>
                <div
                  className={`px-5 text-sm text-gray-600 leading-relaxed bg-gray-50/50 transition-all duration-300 ease-in-out border-t border-gray-100 ${
                    openFaq === index
                      ? "max-h-40 opacity-100 py-4"
                      : "max-h-0 opacity-0 overflow-hidden"
                  }`}
                >
                  {faq.answer}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer Note */}
        <div className="text-center pt-8 text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} Bara. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
