import Image from "next/image";

const FaqItem = ({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) => (
  <div className="group relative">
    <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/5 to-primary-500/5 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    <div className="relative bg-navy-800/50 backdrop-blur-sm border border-cyan-400/20 p-6 rounded-xl shadow-md hover:border-cyan-400/40 transition-all duration-300">
      <h3 className="text-lg font-semibold text-white mb-3">{question}</h3>
      <p className="text-navy-300 text-sm leading-relaxed">{answer}</p>
    </div>
  </div>
);

export default function Faq() {
  return (
    <section className="relative w-full py-16 md:py-24 lg:py-32 bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 overflow-hidden" id="faq">
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-cyan-400/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-tl from-primary-500/5 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-section mx-auto px-section">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-white via-cyan-100 to-primary-200 bg-clip-text text-transparent">
              Frequently Asked Questions
            </span>
          </h2>
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center gap-3 bg-navy-800/50 backdrop-blur-sm border border-cyan-400/20 rounded-full px-6 py-3">
              <span className="text-cyan-400 text-xl">📷</span>
              <p className="text-white text-base font-medium">
                Full commercial rights and ownership of your AI-generated headshots
              </p>
            </div>
          </div>
          <p className="text-navy-300 text-lg max-w-3xl mx-auto">
            Get answers to common questions about our professional AI-generated
            headshot service powered by Flux Pro Ultra, Imagen4, and Recraft V3.
          </p>
        </div>

        {/* FAQ Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <FaqItem
            question="What kind of photos do I need to upload?"
            answer="Make variety a priority. Varied facial expressions and varied backgrounds, taken at various times of the day, are the keys to high quality input photos. Oh, and minimal makeup and accessories, please!"
          />
          <FaqItem
            question="What do you do with my uploaded photos?"
            answer="The photos you upload are used to train our AI model so it can create realistic AI headshots. These input photos are deleted within 7 days, but you can instantly delete them at any time with our 'Delete' button."
          />
          <FaqItem
            question="Who owns my AI photos?"
            answer="You do. We grant you full commercial license and ownership over your photos."
          />
          <FaqItem
            question="What if I don't like my photos?"
            answer="No problem. We promise 3-6 keepers in every order. If you don't find at least 3 incredible headshots, just don't download any of your results and we'll refund you in full."
          />
          <FaqItem
            question="How long does an AI headshot take?"
            answer="We don't cut corners when it comes to generating photorealistic AI headshots. We're not the fastest, but you'll always get same-day results with CoolPix. Our Executive package is delivered in 1 hour or less."
          />
          <FaqItem
            question="What do people misunderstand about AI headshots?"
            answer="Not every photo is perfect. Due to the nature of AI, you might see some strange photos. CoolPix tries to make this clear from the start: not every photo is perfect, but we promise you'll find a profile-worthy headshot in every order to make it all worth it."
          />
          <FaqItem
            question="How many good photos can I expect?"
            answer="The amount of keeper headshots you get back will largely depend on the photos you provide us with. Customers who make an effort to follow the instructions closely often walk away with 8-10+ incredible photos. At the very least, we guarantee you'll get a Profile-Worthy headshot back."
          />
          <FaqItem
            question="Is there a free AI headshot generator?"
            answer="Yes, CoolPix has a 100% free AI headshot generator for simple photos. No email is required and no credit card is required. It is completely free."
          />
          <FaqItem
            question="What is the most realistic headshot AI?"
            answer="CoolPix is the most realistic headshot AI with excellent reviews. It's the only major AI headshot generator using Flux to generate realistic AI headshots. CoolPix is regularly used by professionals, companies and photographers."
          />
          <FaqItem
            question="Can I use AI headshots on LinkedIn?"
            answer="25% of CoolPix customers use their AI headshots on LinkedIn. It's totally okay to use AI headshots on LinkedIn."
          />
          <FaqItem
            question="Can ChatGPT generate headshots?"
            answer="Yes, ChatGPT can generate very basic headshots. These headshots aren't realistic enough to use professionally, but they can be fun to play around with. Use CoolPix for AI headshots you can use professionally."
          />
          <FaqItem
            question="What AI should I use for headshots?"
            answer="The best AI headshot generators are using Flux to maximize realism. Right now, CoolPix is the only major headshot AI powered by Flux. You can get up to 200 professional AI headshots within 2 hours"
          />
        </div>
      </div>
    </section>
  );
}
