"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { track } from "@vercel/analytics";

interface FooterLink {
  href: string;
  text: string;
}

interface FooterSectionProps {
  title: string;
  links: FooterLink[];
  children?: React.ReactNode;
}

const FooterSection: React.FC<FooterSectionProps> = ({
  title,
  links,
  children,
}) => (
  <div className="flex flex-col items-center md:items-start">
    <h3 className="text-cyan-400 font-semibold text-sm tracking-wide">{title}</h3>
    <ul className="mt-4 space-y-3 flex flex-col items-center md:items-start">
      {links.map((link, index) => {
        const isExternal = link.href.startsWith('http');
        return (
          <li key={index}>
            <Link
              href={link.href}
              className="text-navy-300 hover:text-white transition-colors duration-300 text-sm"
              prefetch={false}
              target={isExternal ? "_blank" : undefined}
              rel={isExternal ? "noopener noreferrer" : undefined}
            >
              {link.text}
            </Link>
          </li>
        );
      })}
      {children}
    </ul>
  </div>
);

interface LinkSection {
  title: string;
  links: FooterLink[];
  children?: React.ReactNode;
}

const FooterList: React.FC = () => {
  const linkSections: LinkSection[] = [
    {
      title: "LINKS",
      links: [
        { href: "/contact", text: "Affiliate" },
        { href: "/contact", text: "Contact Us" },
      ],
    },
    {
      title: "LEGAL",
      links: [
        { href: "/terms", text: "Terms of services" },
        { href: "/privacy", text: "Privacy policy" },
      ],
    },
    {
      title: "FREE TOOLS",
      links: [
        {
          href: "https://www.linkedin.com/help/linkedin/answer/430/profile-photo-tips",
          text: "LinkedIn Profile Optimizer",
        },
        {
          href: "https://www.indeed.com/career-advice/resumes-cover-letters/resume-photo",
          text: "Resume Photo Guidelines",
        },
        {
          href: "https://www.thebalancecareers.com/professional-dress-code-guide-2061067",
          text: "Professional Dress Code Guide",
        },
        {
          href: "https://www.petapixel.com/2019/03/14/how-to-pose-for-professional-headshots/",
          text: "Headshot Pose Tips",
        },
        {
          href: "https://coolors.co/",
          text: "Background Color Selector",
        },
        {
          href: "https://tinypng.com/",
          text: "Image Compression Tool",
        },
        {
          href: "https://www.hubspot.com/email-signature-generator",
          text: "Email Signature Generator",
        },
      ],
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-16 px-4 w-full">
      {linkSections.map((section, index) => (
        <FooterSection
          key={index}
          title={section.title}
          links={section.links}
        />
      ))}
    </div>
  );
};

export default FooterList;
