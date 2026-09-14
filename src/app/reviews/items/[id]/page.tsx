import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getReviewItemById, getReview, sortItemReviews, type RecommendItem } from '@/data/review'
import { deleteReviewItem } from '@/app/actions/review'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, Star, Calendar, ExternalLink, Edit3, ArrowLeft, ArrowRight, } from 'lucide-react'
import DeleteButton from '@/components/common/DeleteButton'

interface ItemDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function ItemDetailPage({ params }: ItemDetailPageProps) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()
    if (!supabase) redirect('/auth/login')
  
    const { data: { user } } = await supabase.auth.getUser()
  
  let item = null
  let errorMessage = ''

  try {
    item = await getReviewItemById(id)
  } catch (error: unknown) {
    if (error instanceof Error) {
      errorMessage = error.message
    } else {
      errorMessage = '알 수 없는 오류가 발생했습니다.'
    }
  }

  if (errorMessage || !item) {
    return (
      <main className="min-h-screen bg-[#FFF9F2] flex flex-col items-center justify-center p-4">
        <p className="text-gray-500 font-medium mb-4">해당 추천글을 찾을 수 없습니다.</p>
        <Link href="/reviews" className="px-4 py-2 bg-amber-500 text-white rounded-xl font-bold">
          목록으로 돌아가기
        </Link>
      </main>
    )
  }

  const images: string[] = item.image_urls 
    ? item.image_urls 
    : item.image_url 
      ? item.image_url.split(',') 
      : ['/placeholder.svg']

  const formattedDate = item.created_at ? new Date(item.created_at).toISOString().split('T')[0] : ''
  const authorName = item.profiles?.display_name || '익명'
  const isOwner = user?.id === item.user_id

  const orderedItems = sortItemReviews(
    (await getReview()).items,
    "created-desc",
  );
  const currentIndex = orderedItems.findIndex((review) => review.id === item.id);
  const previousItem = currentIndex >= 0 ? orderedItems[currentIndex + 1] : undefined;
  const nextItem = currentIndex > 0 ? orderedItems[currentIndex - 1] : undefined;
  
  const formatPrice = (priceVal: string | number | null) => {
    if (!priceVal) return null
    const numericOnly = String(priceVal).replace(/[^0-9]/g, '')
    if (!numericOnly) return priceVal
    const number = parseInt(numericOnly, 10)
    return `${number.toLocaleString()}원`
  }

  const handleDelete = async () => {
    'use server'
    await deleteReviewItem(id)
  }

  return (
    <main className="min-h-screen bg-gray-50 pt-14">
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-sm relative pb-20">
        <header className="sticky top-0 bg-white/90 backdrop-blur-md z-10 border-b border-gray-100 flex items-center justify-between p-4">
          <Link href="/reviews" className="flex items-center gap-1 text-xs font-bold text-gray-700 hover:text-black">
            <ChevronLeft className="w-5 h-5" /> 리뷰 목록
          </Link>
          {isOwner && (
            <div className="flex items-center gap-2">
              <Link 
                href={`/reviews/items/${id}/edit`}
                className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" /> 수정
              </Link>
                <DeleteButton onDeleteAction={handleDelete} />
            </div>
          )}
        </header>

        <div className="relative w-full aspect-square bg-gray-100 flex overflow-x-auto snap-x snap-mandatory scrollbar-hide">
          {images.map((img: string, idx: number) => (
            <div key={idx} className="w-full h-full shrink-0 snap-center relative">
              <Image src={img} alt={`${item.title} 사진 ${idx + 1}`} fill unoptimized className="object-cover" />
            </div>
          ))}
          {images.length > 1 && (
            <div className="absolute bottom-3 right-3 bg-black/50 text-white text-[10px] px-2 py-1 rounded-full font-medium">
              여러 장 스와이프
            </div>
          )}
        </div>

        <div className="p-5 space-y-5">          
          <div className="space-y-2">
            <div className="flex flex-wrap gap-1.5">
              {item.category ? (
                item.category.split(',').map((cat: string, idx: number) => (
                  <span key={idx} className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md">
                    {cat.trim()}
                  </span>
                ))
              ) : (
                <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md">
                  육아템
                </span>
              )}
            </div>

            <h1 className="text-xl font-extrabold text-gray-900 break-keep leading-tight pt-1">
              {item.title}
            </h1>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 pt-1">
              <div className="flex items-center gap-1 font-bold text-gray-800">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>별점 {item.rating ?? 5} / 5</span>
              </div>
              {item.purchase_date && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  <span>구매일 {item.purchase_date}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <span>작성일 {formattedDate}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-medium text-gray-700">작성자: {authorName}</span>
              </div>
            </div>
          </div>

          {item.product_link ? (
            <a 
              href={item.product_link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3.5 bg-amber-50/60 hover:bg-amber-50 border border-amber-200/60 rounded-xl transition-colors shadow-xs"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shrink-0">
                  구매처
                </span>
                <span className="text-xs font-bold text-gray-800 truncate">{item.title}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {item.price && (
                  <span className="text-xs font-extrabold text-amber-600">
                    {formatPrice(item.price)}
                  </span>
                )}
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </div>
            </a>
          ) : (
            item.price && (
              <div className="flex items-center justify-between p-3.5 bg-gray-50 border border-gray-100 rounded-xl">
                <span className="text-xs font-bold text-gray-600">등록 가격</span>
                <span className="text-xs font-extrabold text-amber-600">{formatPrice(item.price)}</span>
              </div>
            )
          )}

          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 space-y-2">
            <h2 className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">리뷰</h2>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {item.content || '작성된 후기 내용이 없습니다.'}
            </p>
          </div>

          {previousItem || nextItem ? (
              <nav aria-label="리뷰 이전 다음 글" className="mt-8 grid gap-4 sm:grid-cols-2">
                {previousItem ? (
                  <ReviewAdjacentCard
                    item={previousItem}
                    label="이전 리뷰"
                    direction="previous"
                  />
                ) : (
                  <div className="hidden sm:block" />
                )}
                {nextItem ? (
                  <ReviewAdjacentCard
                    item={nextItem}
                    label="다음 리뷰"
                    direction="next"
                  />
                ) : null}
              </nav>
            ) : null}
        </div>


      </div>
    </main>
  )
}

function ReviewAdjacentCard({
  item,
  label,
  direction,
}: {
  item: RecommendItem;
  label: string;
  direction: "previous" | "next";
}) {
  const Icon = direction === "previous" ? ArrowLeft : ArrowRight;
  const title = item.title;

  const images: string[] = item.image_url 
      ? item.image_url.split(',') 
      : ['/placeholder.svg']

  return (
    <Link
      href={`/reviews/items/${item.id}`}
      className="group grid grid-cols-[88px_1fr] overflow-hidden rounded-lg border border-[#ddd6cc] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
    >
      <div className="relative w-full aspect-square bg-gray-100 flex overflow-x-auto snap-x snap-mandatory scrollbar-hide">
          {images.map((img: string, idx: number) => (
            <div key={idx} className="w-full h-full shrink-0 snap-center relative">
              <Image src={img} alt={`${item.title} 사진 ${idx + 1}`} fill unoptimized className="object-cover" />
            </div>
          ))}
        </div>
      <div className="min-w-0 p-4">
        <p className="flex items-center gap-1.5 text-xs font-bold text-[#e57632]">
          {direction === "previous" ? <Icon size={14} /> : null}
          {label}
          {direction === "next" ? <Icon size={14} /> : null}
        </p>
        <h2 className="mt-2 line-clamp-2 font-bold leading-6 text-[#17202a] transition group-hover:text-[#e57632]">
          {title}
        </h2>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs font-semibold text-[#6b7280]">
          <span>{formatFullDate(item.created_at)}</span>
          <span className="flex items-center gap-1">
            <Star size={13} fill="#f2b84b" color="#f2b84b" />
            {item.rating}
          </span>
        </div>
      </div>
    </Link>
  );
}

function formatFullDate(value: string) {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);

  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}