import Link from "next/link"

export default function AdminFooter() {
  return (
    <footer className="w-full border-t bg-white py-3 sm:py-4 px-3 sm:px-4 md:px-6 mt-auto">
      <div className="w-full">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-4">
          <div className="text-xs sm:text-sm text-slate-500 text-center sm:text-left">
            &copy; {new Date().getFullYear()} G Album Admin. All rights reserved.
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <Link href="/" className="text-xs sm:text-sm text-slate-500 hover:text-red-600 transition-colors">
              Back to Website
            </Link>
            <div className="text-xs sm:text-sm text-slate-500">Version 1.0.0</div>
          </div>
        </div>
      </div>
    </footer>
  )
}
