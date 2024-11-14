import Link from 'next/link'
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react'

export function Header() {
  return (
    <footer className="bg-emerald-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">About StayScan</h3>
            <p className="text-sm">StayScan is your ultimate property management solution, making it easy to manage and showcase your properties.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="text-sm hover:text-emerald-300">Home</Link></li>
              <li><Link href="/properties" className="text-sm hover:text-emerald-300">Properties</Link></li>
              <li><Link href="/maintenance" className="text-sm hover:text-emerald-300">Maintenance</Link></li>
              <li><Link href="/settings" className="text-sm hover:text-emerald-300">Settings</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <p className="text-sm">Email: support@stayscan.com</p>
            <p className="text-sm">Phone: (123) 456-7890</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-white hover:text-emerald-300">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-white hover:text-emerald-300">
                <Twitter className="h-6 w-6" />
              </a>
              <a href="#" className="text-white hover:text-emerald-300">
                <Instagram className="h-6 w-6" />
              </a>
              <a href="#" className="text-white hover:text-emerald-300">
                <Linkedin className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} StayScan. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}