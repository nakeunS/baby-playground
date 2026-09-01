'use client'

import { useState } from 'react'
import Image from 'next/image'

export default function MediaCarousel({ media }: { media: { type: string, url: string }[] }) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const prev = () => setCurrentIndex(i => (i > 0 ? i - 1 : i))
  const next = () => setCurrentIndex(i => (i < media.length - 1 ? i + 1 : i))

  if (!media || media.length === 0) return null

  return (
    <div className="relative w-full aspect-square bg-gray-100 overflow-hidden group">
      
      <div
        className="flex w-full h-full transition-transform duration-300 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {media.map((item, index) => (
          <div key={index} className="w-full h-full flex-none relative">
            {item.type === 'video' ? (
              <video src={item.url} className="w-full h-full object-cover" controls playsInline />
            ) : (
              <Image src={item.url} alt={`미디어 ${index + 1}`} width={500} height={500} className="w-full h-full object-cover" />
            )}
          </div>
        ))}
      </div>

      {media.length > 1 && currentIndex > 0 && (
        <button
          onClick={prev}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-black/40 text-white rounded-full opacity-80 hover:opacity-100 transition-opacity z-10 shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
      )}

      {media.length > 1 && currentIndex < media.length - 1 && (
        <button
          onClick={next}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-black/40 text-white rounded-full opacity-80 hover:opacity-100 transition-opacity z-10 shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      )}

      {media.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-10">
          {media.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 rounded-full transition-all duration-300 shadow-sm ${
                currentIndex === index ? 'w-3 bg-blue-500' : 'w-1.5 bg-white/70'
              }`}
            />
          ))}
        </div>
      )}
      
    </div>
  )
}