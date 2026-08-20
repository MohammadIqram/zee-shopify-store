
import Image from 'next/image';

interface Category {
    id: string;
    title: string;
    handle: string;
    image?: { url: string; altText?: string | null } | null;
}

const fallbackImages = ['/images/hero_img_2.png', '/images/hero_img_1.png'];
const categoryCopy = [
    'Create more space. Display every plant beautifully.',
    'Give your plants the care they need to thrive.',
    'Everything you need for easier, happier gardening.',
    'Give your plants a home as beautiful as they are.',
];

export default function ShopByCategory({ categories }: { categories: Category[] }) {
    const visibleCategories = categories.slice(0, 4);

    return <section className="bg-[#183D2B] px-6 py-16 text-white max-md:px-4 max-md:py-10" aria-labelledby="shop-by-category-title">
        <div className="mx-auto max-w-7xl">
            <h2 id="shop-by-category-title" className="m-0 text-[26px] font-bold tracking-tight max-md:text-2xl text-[#F5F2E9]">Shop by Category</h2>
            <div className="mt-12 grid grid-cols-4 gap-5 max-lg:grid-cols-2 max-md:mt-8 max-md:grid-cols-1">
                {visibleCategories.map((category, index) => (
                    <a className="group overflow-hidden rounded-lg bg-white text-center text-[#202722] no-underline shadow-sm transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg" href={`/collections/${category.handle}`} key={category.id}>
                        <div className="relative aspect-[1.02] overflow-hidden bg-[#E7DFCF]">
                            <Image
                                src={category.image?.url || fallbackImages[index % fallbackImages.length]}
                                alt={category.image?.altText || category.title}
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                        </div>
                        <div className="flex min-h-[166px] flex-col items-center px-5 py-7 max-md:min-h-0">
                            <h3 className="m-0 max-w-[230px] text-[19px] font-bold leading-snug text-[#202722]">{category.title}</h3>
                            <p className="mt-5 max-w-[245px] text-sm leading-relaxed text-[#6B4A32]">{categoryCopy[index] || 'Discover something special for your garden.'}</p>
                        </div>
                    </a>
                ))}
            </div>
            {visibleCategories.length === 0 && <p className="mt-8 text-sm text-[#F5F2E9]/80">Explore our collections to find your next plant project.</p>}
        </div>
    </section>;
}