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
      {links.map((link, index) => (
        <li key={index}>
          <Link
            href={link.href}
            className="text-navy-300 hover:text-white transition-colors duration-300 text-sm"
            prefetch={false}
          >
            {link.text}
          </Link>
        </li>
      ))}
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
      title: "MAKER OF",
      links: [
        {
          href: "https://www.johnnytran.link/",
          text: "Johnnytran.link",
        },
        {
          href: "https://www.clonemysaas.com/",
          text: "CloneMySaaS.com",
        },
        {
          href: "https://www.hpappen.se/",
          text: "HPappen.se",
        },
        {
          href: "https://www.tweetviral.app/",
          text: "TweetViral.app",
        },
        {
          href: "https://www.growthack.dev/",
          text: "Growthack.dev",
        },
        {
          href: "https://www.free-youtube-transcript.com/",
          text: "Free-YouTube-Transcript.com",
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
