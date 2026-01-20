import { Mail, Phone, MapPin, Twitter, Linkedin, type LucideIcon } from 'lucide-react';

const ContactPage = () => {
  return (
    <div className="py-20 min-h-screen">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row">
          <div className="bg-indigo-600 p-10 md:w-2/5 text-white flex flex-col justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-4">Get in touch</h2>
              <p className="text-indigo-100 mb-8">We'd love to hear from you. Fill out the form or drop us an email.</p>
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5" />
                  <span>hello@coachingapp.com</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5" />
                  <span>+1 (555) 000-0000</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5" />
                  <span>San Francisco, CA</span>
                </div>
              </div>
            </div>
            <div className="mt-12 flex gap-4">
              <SocialIcon Icon={Twitter} />
              <SocialIcon Icon={Linkedin} />
            </div>
          </div>

          <div className="p-10 md:w-3/5">
            <form className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">First Name</label>
                  <input type="text" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder="John" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Last Name</label>
                  <input type="text" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder="Doe" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Email</label>
                <input type="email" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder="john@example.com" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Message</label>
                <textarea className="w-full px-4 py-2 border border-slate-300 rounded-lg h-32 resize-none focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder="Tell us about your institute..."></textarea>
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition-colors">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

interface SocialIconProps {
  Icon: LucideIcon;
}

const SocialIcon = ({ Icon }: SocialIconProps) => (
  <a href="#" className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors">
    <Icon className="w-4 h-4" />
  </a>
);

export default ContactPage;