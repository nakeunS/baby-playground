'use client'

import { useFormStatus } from 'react-dom'

interface SubmitButtonProps {
  text: string
  loadingText: string
  bgColor?: string
  hoverColor?: string
}

export default function SubmitButton({ 
  text, 
  loadingText, 
  bgColor = 'bg-amber-400', 
  hoverColor = 'hover:bg-amber-500' 
}: SubmitButtonProps) {
  const { pending } = useFormStatus()

  return (
    <button 
      type="submit"
      disabled={pending}
      className={`w-full py-4 mt-2 ${bgColor} ${hoverColor} text-white font-bold rounded-md shadow-sm transition-colors text-base disabled:opacity-70 cursor-pointer flex items-center justify-center gap-2`}
    >
      {pending ? (
        <>
          <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          {loadingText}
        </>
      ) : (
        text
      )}
    </button>
  )
}