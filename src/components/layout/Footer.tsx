import React from 'react';
import { GraduationCap, Mail, MapPin, Phone, Facebook, Twitter, Instagram, Linkedin, type LucideIcon } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 py-16 mt-20">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-10 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-4 text-white">
              <GraduationCap className="w-6 h-6" />
              <span className="text-xl font-bold">CoachingApp</span>
            </div>
            <p className="text-sm text-slate-400 mb-6">
              Empowering education institutes with AI-driven management tools.
            </p>
            <div className="flex gap-4">
              <SocialIcon Icon={Twitter} />
              <SocialIcon Icon={Facebook} />
              <SocialIcon Icon={Instagram} />
              <SocialIcon Icon={Linkedin} />
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <FooterLink>AI Attendance</FooterLink>
              <FooterLink>Fee Management</FooterLink>
              <FooterLink>Exam Portal</FooterLink>
              <FooterLink>Student Profiles</FooterLink>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <FooterLink>About Us</FooterLink>
              <FooterLink>Careers</FooterLink>
              <FooterLink>Blog</FooterLink>
              <FooterLink>Privacy Policy</FooterLink>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-indigo-400" />
                <span>support@coachingapp.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-indigo-400" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-indigo-400" />
                <span>123 EdTech Valley, CA</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800 pt-8 text-center text-xs text-slate-500">
          © 2024 CoachingApp Inc. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

interface FooterLinkProps {
  children: React.ReactNode;
}

const FooterLink = ({ children }: FooterLinkProps) => (
  <li>
    <a href="#" className="text-slate-400 hover:text-white transition-colors block py-1">
      {children}
    </a>
  </li>
);

interface SocialIconProps {
  Icon: LucideIcon;
}

const SocialIcon = ({ Icon }: SocialIconProps) => (
  <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-indigo-600 transition-colors">
    <Icon className="w-4 h-4" />
  </a>
);

export default Footer;