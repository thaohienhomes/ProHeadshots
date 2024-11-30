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
    <h3 className="text-gray-500 font-semibold">{title}</h3>
    <ul className="mt-4 space-y-2 flex flex-col items-center md:items-start">
      {links.map((link, index) => (
        <li key={index}>
          <Link
            href={link.href}
            className="text-white hover:text-gray-300"
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
        { href: "/signup", text: "Newsletter" },
        { href: "/contact", text: "Investor Relations" },
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
      title: "MORE",
      links: [
        { href: "/contact", text: "Country Partner" },
        { href: "/contact", text: "Affiliate" },
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
