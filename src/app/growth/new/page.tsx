'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Cropper from 'react-easy-crop'

const FILTER_STYLES: Record<string, string> = {
  '원본': 'none',
  'Clarendon': 'contrast(1.2) saturate(1.35) brightness(1.1)',
  'Gingham': 'brightness(1.05) hue-rotate(350deg) contrast(1.1)',
  'Moon': 'grayscale(1) contrast(1.1) brightness(1.1)',
  'Lark': 'contrast(1.2) saturate(1.1)',
  'Reyes': 'sepia(0.22) brightness(1.1) contrast(0.85) saturate(0.75)',
  'Juno': 'saturate(1.4) contrast(1.1) brightness(1.1) hue-rotate(-10deg)',
  'Slumber': 'saturate(0.66) brightness(1.05) sepia(0.22)',
  'Crema': 'sepia(0.5) brightness(1.15) contrast(0.9)'
}
const FILTER_NAMES = Object.keys(FILTER_STYLES)

type CropArea = {
  x: number;
  y: number;
  width: number;
  height: number;
}

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (error) => reject(error))
    image.src = url
  })

async function getCroppedImg(imageSrc: string, pixelCrop: CropArea) {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height
  ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height)
  return new Promise<string>((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(URL.createObjectURL(blob))
    }, 'image/jpeg')
  })
}

export default function GrowthWritePage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  

  const [mediaList, setMediaList] = useState<string[]>([]) 
  const [currentIndex, setCurrentIndex] = useState(0)
  const [croppedImages, setCroppedImages] = useState<string[]>([]) 
  
  const [imageFilters, setImageFilters] = useState<string[]>([])
  
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [aspect, setAspect] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropArea | null>(null)
  
  const [showRatioMenu, setShowRatioMenu] = useState(false)
  const [showMultiMenu, setShowMultiMenu] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const multiFileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setMediaList([URL.createObjectURL(file)])
      setStep(2)
    }
  }

  const handleAddMoreFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const newUrls = files.map(file => URL.createObjectURL(file))
    if (newUrls.length > 0) {
      setMediaList(prev => [...prev, ...newUrls])
      setCurrentIndex(mediaList.length)
    }
  }

  const onCropComplete = useCallback((croppedArea: CropArea, croppedAreaPixels: CropArea) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const getHeaderTitle = () => {
    if (step === 1 || step === 4) return '새 게시물 만들기'
    if (step === 2) return '자르기'
    if (step === 3) return '편집'
  }

  const handleBack = () => {
    if (step === 1) router.push('/growth')
    else setStep(step - 1)
  }

  const handleNext = async () => {
    if (step === 2 && mediaList.length > 0) {
      const newCropped = [...mediaList]
      if (croppedAreaPixels) {
        const cropped = await getCroppedImg(mediaList[currentIndex], croppedAreaPixels)
        if (cropped) newCropped[currentIndex] = cropped
      }
      setCroppedImages(newCropped)
      
      setImageFilters(new Array(newCropped.length).fill('원본'))
      
      setCurrentIndex(0)
      setStep(3)
    } else if (step < 4) {
      setStep(step + 1)
    } else {
      alert('게시물이 성공적으로 업로드되었습니다! 🎉')
      router.push('/growth')
    }
  }

  const applyFilterToCurrent = (filterName: string) => {
    const newFilters = [...imageFilters]
    newFilters[currentIndex] = filterName
    setImageFilters(newFilters)
  }

  return (
    <main className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <Link href="/growth" className="absolute top-4 right-4 sm:top-6 sm:right-8 text-white text-3xl font-light hover:text-gray-300 transition-colors z-50">✕</Link>

      <div className={`bg-white rounded-xl overflow-hidden flex flex-col shadow-2xl transition-all duration-300 ${step >= 3 ? 'w-full max-w-5xl h-[80vh]' : 'w-full max-w-2xl h-[70vh]'}`}>
        
        <div className="flex items-center justify-between px-4 h-12 border-b border-gray-200 bg-white z-10 shrink-0">
          <button onClick={handleBack} className="text-xl text-gray-800 hover:text-gray-500 p-1">←</button>
          <h1 className="font-extrabold text-gray-900 text-base">{getHeaderTitle()}</h1>
          {step === 1 ? <div className="w-6" /> : (
            <button onClick={handleNext} className="text-amber-500 font-bold text-sm hover:text-amber-600">
              {step === 4 ? '공유하기' : '다음'}
            </button>
          )}
        </div>

        <div className="flex flex-1 overflow-hidden bg-gray-50">
          
          {step === 1 && (
            <div className="flex flex-col items-center justify-center w-full h-full gap-4">
              <h2 className="text-xl font-light text-gray-800">사진과 동영상을 여기에 끌어다 놓으세요</h2>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*" onChange={handleFileSelect} />
              <button onClick={() => fileInputRef.current?.click()} className="mt-4 bg-amber-500 text-white font-bold py-2 px-6 rounded-lg">컴퓨터에서 선택</button>
            </div>
          )}

          {step === 2 && mediaList.length > 0 && (
            <div className="w-full h-full relative bg-black flex items-center justify-center">
              <Cropper image={mediaList[currentIndex]} crop={crop} zoom={zoom} aspect={aspect} onCropChange={setCrop} onCropComplete={onCropComplete} onZoomChange={setZoom} />
              {/* 좌/우측 하단 메뉴 */}
              <div className="absolute bottom-4 left-4 z-50">
                {showRatioMenu && (
                  <div className="mb-2 bg-black/80 rounded-lg p-2 flex flex-col gap-1 text-white text-sm shadow-lg">
                    <button onClick={() => setAspect(1)} className={`p-2 hover:bg-white/20 rounded ${aspect === 1 ? 'text-amber-400' : ''}`}>1:1</button>
                    <button onClick={() => setAspect(4/5)} className={`p-2 hover:bg-white/20 rounded ${aspect === 4/5 ? 'text-amber-400' : ''}`}>4:5</button>
                    <button onClick={() => setAspect(16/9)} className={`p-2 hover:bg-white/20 rounded ${aspect === 16/9 ? 'text-amber-400' : ''}`}>16:9</button>
                  </div>
                )}
                <button onClick={() => { setShowRatioMenu(!showRatioMenu); setShowMultiMenu(false); }} className="w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center">⧉</button>
              </div>
              <div className="absolute bottom-4 right-4 z-50">
                {showMultiMenu && (
                  <div className="mb-2 bg-black/80 rounded-lg p-3 flex gap-3 overflow-x-auto shadow-lg max-w-[200px] sm:max-w-[300px]">
                    {mediaList.map((url, idx) => (
                      <div key={idx} onClick={() => setCurrentIndex(idx)} className={`relative w-12 h-12 shrink-0 cursor-pointer border-2 ${currentIndex === idx ? 'border-amber-500' : 'border-transparent'}`}>
                        <img src={url} className="w-full h-full object-cover rounded-sm" />
                      </div>
                    ))}
                    <div onClick={() => multiFileInputRef.current?.click()} className="w-12 h-12 shrink-0 border border-dashed border-gray-400 flex items-center justify-center text-gray-400 cursor-pointer">+</div>
                  </div>
                )}
                <input type="file" multiple ref={multiFileInputRef} className="hidden" accept="image/*,video/*" onChange={handleAddMoreFiles} />
                <button onClick={() => { setShowMultiMenu(!showMultiMenu); setShowRatioMenu(false); }} className="w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center">❐</button>
              </div>
            </div>
          )}

          {step >= 3 && croppedImages.length > 0 && (
            <div className="w-full h-full flex flex-col md:flex-row">
              
              <div className="relative w-full md:w-[60%] h-1/2 md:h-full bg-gray-100 flex items-center justify-center border-b md:border-b-0 md:border-r border-gray-200 group overflow-hidden">
                <img 
                  src={croppedImages[currentIndex]} 
                  alt="편집 중인 이미지" 
                  className="max-w-full max-h-full object-contain shadow-sm transition-all duration-300" 
                  style={{ filter: FILTER_STYLES[imageFilters[currentIndex]] }}
                />
                
                {currentIndex > 0 && (
                  <button onClick={() => setCurrentIndex(prev => prev - 1)} className="absolute left-4 w-8 h-8 flex items-center justify-center bg-black/50 text-white rounded-full opacity-80 hover:opacity-100 transition-opacity z-10">‹</button>
                )}
                {currentIndex < croppedImages.length - 1 && (
                  <button onClick={() => setCurrentIndex(prev => prev + 1)} className="absolute right-4 w-8 h-8 flex items-center justify-center bg-black/50 text-white rounded-full opacity-80 hover:opacity-100 transition-opacity z-10">›</button>
                )}
                {croppedImages.length > 1 && (
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-10">
                    {croppedImages.map((_, idx) => (
                      <div key={idx} className={`h-1.5 rounded-full transition-all duration-300 shadow-sm ${currentIndex === idx ? 'w-3 bg-blue-500' : 'w-1.5 bg-black/30'}`} />
                    ))}
                  </div>
                )}
              </div>

              <div className="w-full md:w-[40%] h-1/2 md:h-full bg-white flex flex-col overflow-y-auto scrollbar-hide">
                
                {step === 3 && (
                  <div className="p-4 grid grid-cols-3 gap-3">
                    {FILTER_NAMES.map((filter) => {
                      const isSelected = imageFilters[currentIndex] === filter;
                      
                      return (
                        <div 
                          key={filter} 
                          onClick={() => applyFilterToCurrent(filter)}
                          className="flex flex-col items-center gap-2 cursor-pointer group"
                        >
                          <div className={`aspect-square w-full rounded-md overflow-hidden ${isSelected ? 'border-[3px] border-amber-500' : 'border border-gray-200 group-hover:opacity-80'}`}>
                            <img 
                              src={croppedImages[currentIndex]} 
                              alt={filter} 
                              className="w-full h-full object-cover"
                              style={{ filter: FILTER_STYLES[filter] }}
                            />
                          </div>
                          <span className={`text-xs ${isSelected ? 'font-bold text-amber-500' : 'text-gray-500 font-medium'}`}>
                            {filter}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}

                {step === 4 && (
                  <div className="flex flex-col h-full">
                    <div className="flex items-center gap-3 p-4">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-lg shadow-inner">👩</div>
                      <span className="font-bold text-sm text-gray-900">튼튼이 엄마</span>
                    </div>
                    <div className="px-4 pb-4 border-b border-gray-100 flex-1">
                      <textarea 
                        placeholder="문구 입력..." 
                        className="w-full h-32 resize-none outline-none text-sm text-black placeholder:text-gray-400 bg-transparent"
                        autoFocus
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}