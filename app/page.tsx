'use client'

import 'tailwindcss/tailwind.css';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CardTitle, CardHeader, CardContent, Card } from "@/components/ui/card"
import { TabsTrigger, TabsList, TabsContent, Tabs } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import Link from "next/link"
import { Check, Building, Users, BarChart, Key, Wrench, Shield, Menu, X } from "lucide-react"
import { useState } from "react"
import { SVGProps } from 'react';
import logo from '../assets/images/stayscan-logo.jpg';
import Image from 'next/image';

export default function Component() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="flex flex-col min-h-screen w-full bg-white text-gray-800">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b border-gray-200 sticky top-0 bg-white z-50">
        <Link className="flex items-center justify-center" href="#">
          {/* <BuildingIcon className="h-6 w-6 text-blue-600" /> */}
          <Image className='w-14 h-14 object-cover rounded-full' src={logo} alt="stayscan-logo"  />
          <span className="ml-2 text-xl font-bold text-gray-900">Stayscan</span>
        </Link>
        <nav className="hidden md:flex ml-auto gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:text-blue-600 transition-colors" href="#features">
            Features
          </Link>
          <Link className="text-sm font-medium hover:text-blue-600 transition-colors" href="#how-it-works">
            How It Works
          </Link>
          <Link className="text-sm font-medium hover:text-blue-600 transition-colors" href="#pricing">
            Pricing
          </Link>
          <Link className="text-sm font-medium hover:text-blue-600 transition-colors" href="#testimonials">
            Testimonials
          </Link>
          <Link className="text-sm font-medium hover:text-blue-600 transition-colors" href="#contact">
            Contact
          </Link>
        </nav>
        <div className="hidden md:flex items-center ml-4">
          <Button variant="outline" className="mr-2" asChild>
            <Link href="/dashboard" className='text-white'>Log In</Link>
          </Button>
          <Button asChild>
            <Link href="/sign-up">Sign Up</Link>
          </Button>
        </div>
        <button
          className="md:hidden ml-auto"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </header>
      {mobileMenuOpen && (
        <div className="md:hidden bg-white p-4 border-b border-gray-200">
          <nav className="flex flex-col gap-4">
            <Link className="text-sm font-medium hover:text-blue-600 transition-colors" href="#features" onClick={() => setMobileMenuOpen(false)}>
              Features
            </Link>
            <Link className="text-sm font-medium hover:text-blue-600 transition-colors" href="#how-it-works" onClick={() => setMobileMenuOpen(false)}>
              How It Works
            </Link>
            <Link className="text-sm font-medium hover:text-blue-600 transition-colors" href="#pricing" onClick={() => setMobileMenuOpen(false)}>
              Pricing
            </Link>
            <Link className="text-sm font-medium hover:text-blue-600 transition-colors" href="#testimonials" onClick={() => setMobileMenuOpen(false)}>
              Testimonials
            </Link>
            <Link className="text-sm font-medium hover:text-blue-600 transition-colors" href="#contact" onClick={() => setMobileMenuOpen(false)}>
              Contact
            </Link>
          </nav>
          <div className="mt-4 flex flex-col gap-2">
            <Button variant="outline" className="w-full" asChild>
              <Link href="/sign-in" className='text-white'>Log In</Link>
            </Button>
            <Button className="w-full" asChild>
              <Link href="/sign-up">Sign Up</Link>
            </Button>
          </div>
        </div>
      )}
      <main className="flex-1">
        {/* <section className="min-h-screen bg-gradient-to-b from-teal-50 to-white flex items-center justify-center p-6 hero-section"> */}
        <section className="py-48 w-full text-center space-y-8 flex items-center justify-center p-8 rounded-2xl shadow-lg hero-section">
          {/* <div className="container mx-auto px-4 md:px-6 w-full max-w-7xl">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none text-gray-900">
                  Digital guest guides made simple
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl">
                create engaging digital guides, streamline your hosting workflow, and enhance guest experiences                </p>
              </div>
              <div className="space-x-4">
                <Button variant="outline" className="text-white">Watch Demo</Button>
              </div>
            </div>
          </div> */}


    <div className="max-w-3xl w-full text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
            AI-Powered Property Management{' '}
            <span className="block text-teal-500">
              That Works While You Sleep
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Turn hours of work into minutes with smart automation, AI-generated
            guest guides, and unified property management.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button className="bg-teal-500 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-teal-600 transition-colors duration-200 flex items-center gap-2">
            Start Free Trial
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
          
          <button className="px-8 py-3 rounded-lg text-lg font-semibold text-teal-500 border-2 border-teal-500 hover:bg-teal-50 transition-colors duration-200">
            Watch Demo
          </button>
        </div>
      </div>
        </section>
        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container mx-auto px-4 md:px-6 w-full max-w-7xl">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-center mb-12 text-gray-900">Key Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <Building className="w-8 h-8 text-blue-600 mb-2" />
                  <CardTitle className="text-xl font-semibold">Digital Guides</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Create comprehensive digital guides for your properties, enhancing guest experience and reducing inquiries.</p>
                </CardContent>
              </Card>
              <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <Users className="w-8 h-8 text-blue-600 mb-2" />
                  <CardTitle className="text-xl font-semibold">Listing Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Efficiently manage and update your property listings across multiple platforms from a single dashboard.</p>
                </CardContent>
              </Card>
              <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <BarChart className="w-8 h-8 text-blue-600 mb-2" />
                  <CardTitle className="text-xl font-semibold">Performance Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Gain valuable insights into your property performance with comprehensive analytics and reporting tools.</p>
                </CardContent>
              </Card>
              <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <Key className="w-8 h-8 text-blue-600 mb-2" />
                  <CardTitle className="text-xl font-semibold">Guest Communication</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Streamline guest communication with automated messaging and a centralized inbox for all your properties.</p>
                </CardContent>
              </Card>
              <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <Wrench className="w-8 h-8 text-blue-600 mb-2" />
                  <CardTitle className="text-xl font-semibold">Task Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Efficiently manage and track tasks related to property maintenance, cleaning, and guest requests.</p>
                </CardContent>
              </Card>
              <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <Shield className="w-8 h-8 text-blue-600 mb-2" />
                  <CardTitle className="text-xl font-semibold">Booking Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Manage bookings across multiple platforms, sync calendars, and avoid double bookings with ease.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32 bg-gray-50">
          <div className="container mx-auto px-4 md:px-6 w-full max-w-7xl">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-center mb-12 text-gray-900">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                  <span className="text-blue-600 text-xl font-bold">1</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Sign Up</h3>
                <p className="text-gray-600">Create your Stayscan account and add your properties to the platform.</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                  <span className="text-blue-600 text-xl font-bold">2</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Create Guides</h3>
                <p className="text-gray-600">Build digital guides for your properties and customize your listing details.</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                  <span className="text-blue-600 text-xl font-bold">3</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Manage</h3>
                <p className="text-gray-600">Start managing your properties efficiently with our powerful tools and analytics.</p>
              </div>
            </div>
          </div>
        </section>
        <section id="pricing" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container mx-auto px-4 md:px-6 w-full max-w-7xl">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-center mb-12 text-gray-900">Pricing Plans</h2>
            <div className="flex justify-center w-full">
              <Tabs defaultValue="monthly" className="w-full max-w-3xl mx-auto">
                <TabsList className="grid w-full grid-cols-2 mb-8">
                  <TabsTrigger value="monthly">Monthly</TabsTrigger>
                  <TabsTrigger value="annual">Annual (Save 20%)</TabsTrigger>
                </TabsList>
                <TabsContent value="monthly">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
                      <CardHeader>
                        <CardTitle className="text-xl font-semibold">Host</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-4xl font-bold mb-2 text-blue-600">$9.99<span className="text-lg font-normal text-gray-600">/mo</span></div>
                        <ul className="space-y-2 mb-4">
                        <li className="flex items-center text-gray-600">
                            <Check className="mr-2 h-4 w-4 text-green-500" />
                            4 Properties
                          </li>
                          <li className="flex items-center text-gray-600">
                          Designed for individual hosts or those with up to 4 properties, providing all essential guest experience features.
                          </li>
                        </ul>
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" asChild>
                        <Link href="/dashboard">Choose Plan</Link>
                      </Button>                      
                      </CardContent>
                    </Card>
                    <Card className="bg-white shadow-sm hover:shadow-md transition-shadow border-2 border-blue-600">
                      <CardHeader>
                        <CardTitle className="text-xl font-semibold">Professional</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-4xl font-bold mb-2 text-blue-600">$7.99<span className="text-lg font-normal text-gray-600">/mo</span></div>
                        <ul className="space-y-2 mb-4">
                        <li className="flex items-center text-gray-600">
                            <Check className="mr-2 h-4 w-4 text-green-500" />
                            5-49 Properties
                          </li>
                          <li className="flex items-center text-gray-600">
                          Perfect for hosts with a growing portfolio. Includes advanced analytics and streamlined support to enhance guest experiences at scale.
                          </li>
                        </ul>
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" asChild>
                        <Link href="/dashboard">Choose Plan</Link>
                      </Button> 
                      </CardContent>
                    </Card>
                    <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
                      <CardHeader>
                        <CardTitle className="text-xl font-semibold">Enterprise</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-4xl font-bold mb-2 text-blue-600">Custom</div>
                        <ul className="space-y-2 mb-4">
                          <li className="flex items-center text-gray-600">
                            <Check className="mr-2 h-4 w-4 text-green-500" />
                            Unlimited Properties
                          </li>
                          <li className="flex items-center text-gray-600">
                          Tailored solutions for large-scale operations, with personalized onboarding, priority support, and potential custom integrations.
                          </li>
                        </ul>
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" asChild>
                        <Link href="/dashboard">Contact Sales</Link>
                      </Button>                     
                       </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                <TabsContent value="annual">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
                      <CardHeader>
                        <CardTitle className="text-xl font-semibold">Host</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-4xl font-bold mb-2 text-blue-600">$99.99<span className="text-lg font-normal text-gray-600">/mo</span></div>
                        <ul className="space-y-2 mb-4">
                          <li className="flex items-center text-gray-600">
                            <Check className="mr-2 h-4 w-4 text-green-500" />
                            Up to 4 units
                          </li>
                          <li className="flex items-center text-gray-600">
                          Designed for individual hosts or those with up to 4 properties, providing all essential guest experience features.
                          </li>
                        </ul>
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">Choose Plan</Button>
                      </CardContent>
                    </Card>
                    <Card className="bg-white shadow-sm hover:shadow-md transition-shadow border-2 border-blue-600">
                      <CardHeader>
                        <CardTitle className="text-xl font-semibold">Host Pro</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-4xl font-bold mb-2 text-blue-600">$79<span className="text-lg font-normal text-gray-600">/mo</span></div>
                        <ul className="space-y-2 mb-4">
                          <li className="flex items-center text-gray-600">
                            <Check className="mr-2 h-4 w-4 text-green-500" />
                            Up to 49 units
                          </li>
                          <li className="flex items-center text-gray-600">
                          Perfect for hosts with a growing portfolio. Includes advanced analytics and streamlined support to enhance guest experiences at scale.
                          </li>
                        </ul>
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">Choose Plan</Button>
                      </CardContent>
                    </Card>
                    <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
                      <CardHeader>
                        <CardTitle className="text-xl font-semibold">Enterprise</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-4xl font-bold mb-2 text-blue-600">Custom</div>
                        <ul className="space-y-2 mb-4">
                          <li className="flex items-center text-gray-600">
                            <Check className="mr-2 h-4 w-4 text-green-500" />
                            Unlimited units
                          </li>
                          <li className="flex items-center text-gray-600">
                          Tailored solutions for large-scale operations, with personalized onboarding, priority support, and potential custom integrations.
                          </li>
                        </ul>
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">Contact Sales</Button>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </section>
        <section id="testimonials" className="w-full py-12 md:py-24 lg:py-32 bg-gray-50">
          <div className="container mx-auto px-4 md:px-6 w-full max-w-7xl">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-center mb-12 text-gray-900">What Our Clients Say</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="bg-white shadow-sm">
                <CardContent className="pt-6">
                  <p className="text-gray-600 mb-4">&quot;Stayscan has revolutionized how we manage our vacation rentals. The digital guides have significantly reduced guest inquiries and improved satisfaction.&quot;</p>
                  <p className="font-semibold">- Sarah Johnson, Vacation Rental Owner</p>
                </CardContent>
              </Card>
              <Card className="bg-white shadow-sm">
                <CardContent className="pt-6">
                  <p className="text-gray-600 mb-4">&quot;The listing management features are top-notch. We can now update our properties across multiple platforms with just a few clicks.&quot;</p>
                  <p className="font-semibold">- Michael Chen, Property Manager</p>
                </CardContent>
              </Card>
              <Card className="bg-white shadow-sm">
                <CardContent className="pt-6">
                  <p className="text-gray-600 mb-4">&quot;Stayscan&apos;s analytics have given us valuable insights into our property performance, helping us make data-driven decisions to improve our business.&quot;</p>
                  <p className="font-semibold">- Emily Rodriguez, Hospitality Entrepreneur</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        <section id="faq" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container mx-auto px-4 md:px-6 w-full max-w-7xl">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-center mb-12 text-gray-900">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="w-full max-w-3xl mx-auto">
              <AccordionItem value="item-1">
                <AccordionTrigger>How does Stayscan handle data security?</AccordionTrigger>
                <AccordionContent>
                  Stayscan uses industry-standard encryption and security protocols to protect your data. We regularly perform security audits and updates to ensure your information and your guests&apos; information is safe and secure.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Can I integrate Stayscan with my existing booking software?</AccordionTrigger>
                <AccordionContent>
                  Yes, Stayscan offers integrations with many popular booking platforms and property management systems. Our team can assist you in setting up custom integrations if needed.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>Is there a limit to the number of properties I can manage with Stayscan?</AccordionTrigger>
                <AccordionContent>
                  Our Starter and Professional plans have limits on the number of properties you can manage. For unlimited properties, we recommend our Enterprise plan, which can be customized to your specific needs.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger>Do you offer a mobile app for property management on-the-go?</AccordionTrigger>
                <AccordionContent>
                  Yes, Stayscan offers mobile apps for both iOS and Android devices. These apps allow you to manage your properties, update digital guides, and communicate with guests on-the-go.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>
        <section id="contact" className="w-full py-12 md:py-24 lg:py-32 bg-gray-50">
          <div className="container mx-auto px-4 md:px-6 w-full max-w-7xl">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-center mb-12 text-gray-900">Get in Touch</h2>
            <div className="max-w-md mx-auto">
              <form className="space-y-4">
                <Input placeholder="Name" className="bg-white" />
                <Input type="email" placeholder="Email" className="bg-white" />
                <Input placeholder="Company" className="bg-white" />
                <textarea
                  className="w-full h-32 px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-blue-500 bg-white"
                  placeholder="Message"
                ></textarea>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">Send Message</Button>
              </form>
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full py-6 bg-gray-100">
        <div className="container mx-auto px-4 md:px-6 w-full max-w-7xl flex flex-col md:flex-row justify-between items-center">
          <div className="flex flex-col items-center md:items-start mb-4 md:mb-0">
            <BuildingIcon className="h-6 w-6 text-blue-600 mb-2" />
            <p className="text-sm text-gray-600">© 2024 Stayscan Inc. All rights reserved.</p>
          </div>
          <nav className="flex flex-wrap justify-center md:justify-end gap-4 sm:gap-6">
            <Link className="text-sm hover:underline underline-offset-4 text-gray-600 hover:text-blue-600" href="#">
              Terms of Service
            </Link>
            <Link className="text-sm hover:underline underline-offset-4 text-gray-600 hover:text-blue-600" href="#">
              Privacy Policy
            </Link>
            <Link className="text-sm hover:underline underline-offset-4 text-gray-600 hover:text-blue-600" href="#">
              FAQ
            </Link>
            <Link className="text-sm hover:underline underline-offset-4 text-gray-600 hover:text-blue-600" href="#">
              Blog
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}

function BuildingIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01" />
      <path d="M16 6h.01" />
      <path d="M12 6h.01" />
      <path d="M12 10h.01" />
      <path d="M12 14h.01" />
      <path d="M16 10h.01" />
      <path d="M16 14h.01" />
      <path d="M8 10h.01" />
      <path d="M8 14h.01" />
    </svg>
  )
}
