import Image from 'next/image';

interface Category {
  id: string;
  title: string;
  handle: string;
  image?: { url: string; altText?: string | null } | null;
}

export default function CategoryList({ categories }: { categories: Category[] }) {
  return (
    <section className="bg-[#F5F2E9] overflow-hidden p-[13px_20px_18px] max-md:p-[12px_14px_15px]" aria-label="Shop by category">
      <div className="mx-auto flex max-w-[1280px] justify-center gap-[28px] max-md:justify-start max-md:gap-[18px] max-md:overflow-x-auto max-md:p-[0_7px_5px] max-md:[scrollbar-width:none] max-md:[&::-webkit-scrollbar]:hidden">
        {categories.slice(0, 7).map((category) => (
          <a className="flex flex-col items-center gap-[9px] text-[#202722] no-underline flex-[0_0_116px] max-md:flex-[0_0_82px] max-md:gap-[7px]" href={`/collections/${category.handle}`} key={category.id}>
            <span className="relative flex h-[101px] w-[101px] items-center justify-center overflow-hidden rounded-full border-[5px] border-[#B59A5A] bg-[#FFFFFF] shadow-[0_0_0_3.5px_#E7DFCF] max-md:h-[71px] max-md:w-[71px] max-md:border-[3.5px]">
              {category.image ? (
                <Image src={category.image.url} alt={category.image.altText || category.title} className="h-full w-full object-cover" fill sizes="101px" />
              ) : <span className="h-full w-full bg-[#E7DFCF]" aria-hidden="true" />}
            </span>
            <span className="text-[14px] leading-[1.2] max-md:text-[12px] text-center font-medium text-[#202722]">{category.title}</span>
          </a>
        ))}
      </div>
    </section>
  );
}