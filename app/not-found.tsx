import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 px-4">
      <h1 className="text-6xl font-bold text-emerald-700 mb-4">404</h1>
      <h2 className="text-3xl font-semibold text-emerald-600 mb-6">Page Not Found</h2>
      <p className="text-lg text-emerald-500 mb-8 text-center max-w-md">
        Oops! The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link href="/" passHref>
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
      </Link>
    </div>
  )
}