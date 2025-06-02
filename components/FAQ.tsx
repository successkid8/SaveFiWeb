import React, { useState } from 'react';

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: 'How does SaveFi work?',
      answer: 'SaveFi automatically saves a percentage of your trades into a time-locked vault. You can set your preferred savings rate, and the platform will handle the rest. Your savings are secured in a vault that unlocks after a set period.'
    },
    {
      question: 'What is the minimum lock period?',
      answer: 'Currently, the minimum lock period is 1 month. We plan to introduce more flexible options in the future.'
    },
    {
      question: 'How are rewards calculated?',
      answer: 'Rewards are calculated based on your total savings amount and the duration of your vault lock. The longer you keep your savings locked, the higher your rewards will be.'
    },
    {
      question: 'Can I withdraw my savings early?',
      answer: 'No, savings in the vault cannot be withdrawn before the lock period ends. This is to ensure the security of your funds and maintain the integrity of the platform.'
    },
    {
      question: 'What happens if I miss a trade?',
      answer: 'No worries! SaveFi only saves when you trade. If you don\'t trade, no savings are deducted. You can continue trading normally whenever you want.'
    },
    {
      question: 'How do I get started?',
      answer: 'Simply connect your Solana wallet, set your preferred savings rate, and start trading. SaveFi will automatically handle the rest.'
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-black/50">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-300">
            Everything you need to know about SaveFi
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 overflow-hidden"
            >
              <button
                className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-white/5 transition-colors duration-200"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="text-lg font-semibold">{faq.question}</span>
                <span className="text-2xl text-purple-400">
                  {openIndex === index ? '−' : '+'}
                </span>
              </button>
              
              {openIndex === index && (
                <div className="px-6 py-4 border-t border-white/10">
                  <p className="text-gray-300">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-300 mb-4">
            Still have questions?
          </p>
          <button className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-8 py-3 text-lg transition-all duration-200">
            Contact Support
          </button>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
