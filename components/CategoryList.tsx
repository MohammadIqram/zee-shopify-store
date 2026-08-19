import Image from 'next/image';

interface Category {
  id: string;
  title: string;
  handle: string;
  image?: { url: string; altText?: string | null } | null;
}

export default function CategoryList({ categories }: { categories: Category[] }) {
  return (
    <section className="category-list" aria-label="Shop by category">
      <div className="category-list-inner">
        {categories.slice(0, 7).map((category) => (
          <a className="category-item" href={`/collections/${category.handle}`} key={category.id}>
            <span className="category-image-wrap">
              {category.image ? (
                <Image src={category.image.url} alt={category.image.altText || category.title} className="category-image" fill sizes="119px" />
              ) : <span className="category-image-placeholder" aria-hidden="true" />}
            </span>
            <span className="category-name">{category.title}</span>
          </a>
        ))}
      </div>
    </section>
  );
}