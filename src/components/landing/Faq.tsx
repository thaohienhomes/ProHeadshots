import Image from "next/image";

const FaqItem = ({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) => (
  <div className="bg-mainWhite p-4 rounded-lg shadow-md">
    <h3 className="text-lg font-semibold text-mainBlack mb-1">{question}</h3>
    <p className="text-sm text-mainBlack">{answer}</p>
  </div>
);

export default function Faq() {
  return (
    <section className="w-full py-8 md:py-16 lg:py-24 bg-mainBlack" id="faq">
      <div className="max-w-section mx-auto px-section">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-3 leading-tight text-mainWhite">
            Frequently Asked Questions
          </h2>
          <div className="flex items-center justify-center">
            <span className="text-mainOrange text-xl mr-2 hidden sm:inline">
              📷
            </span>
            <p className="text-mainWhite text-base">
              Full commercial rights and ownership of your AI-generated
              headshots
            </p>
          </div>
          <p className="text-mainWhite text-base mt-3">
            Get answers to common questions about our professional AI-generated
            headshot service for individuals and remote teams.
          </p>
        </div>

        {/* FAQ Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
            answer="We don't cut corners when it comes to generating photorealistic AI headshots. We're not the fastest, but you'll always get same-day results with CVPHOTO. Our Executive package is delivered in 1 hour or less."
          />
          <FaqItem
            question="What do people misunderstand about AI headshots?"
            answer="Not every photo is perfect. Due to the nature of AI, you might see some strange photos. CVPHOTO tries to make this clear from the start: not every photo is perfect, but we promise you'll find a profile-worthy headshot in every order to make it all worth it."
          />
          <FaqItem
            question="How many good photos can I expect?"
            answer="The amount of keeper headshots you get back will largely depend on the photos you provide us with. Customers who make an effort to follow the instructions closely often walk away with 8-10+ incredible photos. At the very least, we guarantee you'll get a Profile-Worthy headshot back."
          />
          <FaqItem
            question="Is there a free AI headshot generator?"
            answer="Yes, CVPHOTO has a 100% free AI headshot generator for simple photos. No email is required and no credit card is required. It is completely free."
          />
          <FaqItem
            question="What is the most realistic headshot AI?"
            answer="CVPHOTO is the most realistic headshot AI with the most reviews in Sweden. It's the only major AI headshot generator using Flux to generate realistic AI headshots. CVPHOTO is regularly used by professionals, companies and photographers."
          />
          <FaqItem
            question="Can I use AI headshots on LinkedIn?"
            answer="25% of CVPHOTO customers use their AI headshots on LinkedIn. It's totally okay to use AI headshots on LinkedIn."
          />
          <FaqItem
            question="Can ChatGPT generate headshots?"
            answer="Yes, ChatGPT can generate very basic headshots. These headshots aren't realistic enough to use professionally, but they can be fun to play around with. Use CVPHOTO for AI headshots you can use professionally."
          />
          <FaqItem
            question="What AI should I use for headshots?"
            answer="The best AI headshot generators are using Flux to maximize realism. Right now, CVPHOTO is the only major headshot AI powered by Flux. You can get up to 200 professional AI headshots within 2 hours"
          />
        </div>
      </div>
    </section>
  );
}
