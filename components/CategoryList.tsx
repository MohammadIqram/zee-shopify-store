import Image from 'next/image';

interface Category {
  id: string;
  title: string;
  handle: string;
  image?: { url: string; altText?: string | null } | null;
}

export default function CategoryList({ categories }: { categories: Category[] }) {
  return (
    <section className="bg-[#fafafa] overflow-hidden p-[17px_20px_25px] max-md:p-[16px_14px_22px]" aria-label="Shop by category">
      <div className="mx-auto flex max-w-[1280px] justify-center gap-[37px] max-md:justify-start max-md:gap-[25px] max-md:overflow-x-auto max-md:p-[0_7px_8px] max-md:[scrollbar-width:none] max-md:[&::-webkit-scrollbar]:hidden">
        {categories.slice(0, 7).map((category) => (
          <a className="flex flex-col items-center gap-[13px] text-[#333] no-underline flex-[0_0_137px] max-md:flex-[0_0_96px] max-md:gap-[10px]" href={`/collections/${category.handle}`} key={category.id}>
            <span className="relative flex h-[119px] w-[119px] items-center justify-center overflow-hidden rounded-full border-[7px] border-[#f8c444] bg-[#f7f7f7] shadow-[0_0_0_5px_#f4e9db] max-md:h-[84px] max-md:w-[84px] max-md:border-[5px]">
              {category.image ? (
                <Image src={category.image.url} alt={category.image.altText || category.title} className="h-full w-full object-cover" fill sizes="119px" />
              ) : <span className="h-full w-full bg-[#eef2f1]" aria-hidden="true" />}
            </span>
            <span className="text-[17px] leading-[1.2] max-md:text-[14px]">{category.title}</span>
          </a>
        ))}
      </div>
    </section>
  );
}