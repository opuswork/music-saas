"use client";

import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Music, Mail, MapPin, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

const PROGRAMS_LINKS = ["Programs", "Lessons", "Quizzes", "Practice", "Tools"];
const LESSONS_LINKS = ["Piano", "Theory", "Sight Reading", "Composition"];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t bg-background">
      {/* Newsletter Section */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col items-center justify-between gap-6 lg:flex-row">
            <div className="text-center lg:text-left">
              <h3 className="text-2xl font-bold tracking-tight">Subscribe to Our Newsletter</h3>
              <p className="text-muted-foreground">
                Get latest news, updates, and insider tips delivered to your inbox.
              </p>
            </div>
            <form 
              className="flex w-full max-w-md items-center space-x-2" 
              onSubmit={(e) => e.preventDefault()}
            >
              <Input 
                type="email" 
                placeholder="Enter your email" 
                className="h-10"
              />
              <Button type="submit">Subscribe</Button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
          {/* Brand Column */}
          <div className="sm:col-span-2 lg:col-span-2">
            <a href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Music size={18} className="text-red-500" />
              </div>
              <span>Music-Saas™</span>
            </a>
            <p className="mb-6 max-w-xs text-muted-foreground">
              Your trusted destination for music education and learning. 
              Making music theory accessible to everyone since 2026.
            </p>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2 hover:text-foreground transition-colors">
                <Mail size={16} />
                <a href="mailto:info@music-saas.com">info@music-saas.com</a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={16} />
                <span>Silicon Valley, CA</span>
              </li>
            </ul>
          </div>

          {/* Programs Column */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider">Programs</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              {PROGRAMS_LINKS.map((label) => (
                <li key={label}>
                  <a href="#" className="hover:text-primary transition-colors">{label}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Lessons Column */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider">Lessons</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              {LESSONS_LINKS.map((label) => (
                <li key={label}>
                  <a href="#" className="hover:text-primary transition-colors">{label}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <p className="text-sm text-muted-foreground">
              © {currentYear} Music-Saas. All rights reserved.
            </p>
            
            {/* Social Links */}
            <div className="flex items-center gap-4">
              {[
                { icon: <Facebook size={18} />, label: "Facebook" },
                { icon: <Twitter size={18} />, label: "Twitter" },
                { icon: <Instagram size={18} />, label: "Instagram" },
                { icon: <Linkedin size={18} />, label: "LinkedIn" },
              ].map((social) => (
                <Button 
                  key={social.label} 
                  variant="ghost" 
                  size="icon" 
                  className="h-9 w-9 rounded-full text-muted-foreground hover:text-primary"
                  aria-label={social.label}
                >
                  {social.icon}
                </Button>
              ))}
            </div>

            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}