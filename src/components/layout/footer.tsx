import React from 'react'

const Footer = () => {
  return (
    <footer className="py-8 border-t border-white/10 bg-black/20 backdrop-blur-sm flex justify-center">
      <div className="flex flex-col items-center">
          <span className="text-sm ">
            © 2025 WIR SPIELEN FUßBALL. Alle Rechte vorbehalten.
          </span>

        <div className="flex items-center space-x-2 group">
          <span className="text-sm">Entwickelt mit</span>
          <div className="w-4 h-4 text-red-500">❤️</div>
          <span className="text-sm">von</span>
          <span className="text-transparent primary-gradient bg-clip-text font-bold text-sm">
              Maurice R.
            </span>
          <div className="text-xs">©</div>
        </div>
      </div>
    </footer>
  )
}

export default Footer;