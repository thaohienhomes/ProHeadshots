import { User, Twitter, Users, Camera } from "lucide-react";

const LinkedInIcon = () => (
  <svg
    className="w-8 h-8 text-mainOrange mr-3"
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M20.47,2H3.53A1.45,1.45,0,0,0,2.06,3.43V20.57A1.45,1.45,0,0,0,3.53,22H20.47a1.45,1.45,0,0,0,1.47-1.43V3.43A1.45,1.45,0,0,0,20.47,2ZM8.09,18.74h-3v-9h3ZM6.59,8.48A1.56,1.56,0,1,1,8.15,6.92,1.57,1.57,0,0,1,6.59,8.48ZM18.91,18.74h-3V13.91c0-1.21-.43-2-1.52-2A1.65,1.65,0,0,0,12.85,13a2,2,0,0,0-.1.73v5h-3s0-8.18,0-9h3V11A3,3,0,0,1,15.46,9.5c2,0,3.45,1.29,3.45,4.06Z" />
  </svg>
);

const FeatureCard = ({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
}) => (
  <div className="bg-mainWhite p-6 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg hover:scale-105">
    <div className="flex items-center mb-4">
      <Icon className="w-8 h-8 text-mainOrange mr-3" />
      <h3 className="text-xl font-bold text-mainBlack">{title}</h3>
    </div>
    <p className="text-mainBlack text-sm leading-relaxed">{description}</p>
  </div>
);

export default function Pitch2() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-mainBlack">
      <div className="max-w-section mx-auto px-section">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-semibold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl mb-4 leading-tight text-mainWhite">
            Fix Your Professional Branding Overnight
          </h1>
          <div className="flex items-center justify-center">
            <span className="text-mainOrange text-2xl mr-2 hidden sm:inline">✨</span>
            <p className="text-mainWhite text-lg">
              Used by individuals, small teams and professional photographers
            </p>
          </div>
        </div>

        {/* Feature Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <FeatureCard
            title="CV Profile Images That Stand Out"
            description="Enhance your resume with a professional headshot. Present a polished, approachable image that increases your interview potential."
            icon={User}
          />
          <FeatureCard
            title="LinkedIn Presence That Dominates"
            description="Optimize your LinkedIn profile with a studio-grade picture. Align with platform standards to boost your professional visibility and network impact."
            icon={LinkedInIcon}
          />
          <FeatureCard
            title="Twitter Profile Pictures That Captivate"
            description="Elevate your Twitter presence with a professionally crafted profile picture. Choose from various styles to reinforce your brand and engage followers."
            icon={Twitter}
          />
          <FeatureCard
            title="Photographers: Boost Your Business"
            description="Expand your services with high-end digital portraits. Offer efficient, customizable solutions to meet diverse client needs and increase revenue."
            icon={Camera}
          />
        </div>

        {/* Updated Testimonial Section */}
        <div className="text-center max-w-xl mx-auto">
          <div className="flex justify-center items-center mb-2">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className="w-6 h-6 text-mainOrange"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ))}
          </div>
          <p className="italic mb-2 text-mainWhite text-lg">
            &ldquo;I needed a business photo with a 24 hour turnaround - you
            beat it by 22 hours!&rdquo;
          </p>
          <div className="flex items-center justify-center">
            <span className="font-semibold text-mainWhite">Tobias Sjöblom</span>
          </div>
        </div>
      </div>
    </section>
  );
}
