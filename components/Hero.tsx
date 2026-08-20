
'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

const slides = [
    { src: '/images/hero_img_1.png', alt: 'Gift the joy of nature' },
    { src: '/images/hero_img_2.png', alt: 'Green spaces, happy places' },
];

export default function Hero() {
    const [activeSlide, setActiveSlide] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        if (isPaused) return;
        const timer = window.setInterval(() => {
            setActiveSlide((current) => (current + 1) % slides.length);
        }, 5000);
        return () => window.clearInterval(timer);
    }, [isPaused]);

    const showSlide = (index: number) => {
        setActiveSlide((index + slides.length) % slides.length);
    };

    return (
        <section
            className="relative overflow-hidden bg-[#eef2e8]"
            aria-label="Featured promotions"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <div className="relative aspect-[16/6] min-h-[230px] w-full max-md:aspect-[16/9] max-md:min-h-0">
                {slides.map((slide, index) => (
                    <div
                        className={`absolute inset-0 transition-opacity duration-700 ${index === activeSlide ? 'z-[1] opacity-100' : 'opacity-0'}`}
                        key={slide.src}
                        aria-hidden={index !== activeSlide}
                    >
                        <Image
                            src={slide.src}
                            alt={slide.alt}
                            fill
                            priority={index === 0}
                            sizes="100vw"
                            className="object-cover"
                        />
                    </div>
                ))}
            </div>

            <button
                className="absolute left-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-black/35 text-2xl text-white transition-colors hover:bg-black/60 max-md:left-2"
                type="button"
                aria-label="Previous slide"
                onClick={() => showSlide(activeSlide - 1)}
            >
                ‹
            </button>
            <button
                className="absolute right-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-black/35 text-2xl text-white transition-colors hover:bg-black/60 max-md:right-2"
                type="button"
                aria-label="Next slide"
                onClick={() => showSlide(activeSlide + 1)}
            >
                ›
            </button>
            <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2" aria-label="Choose promotion slide">
                {slides.map((slide, index) => (
                    <button
                        className={`h-2.5 w-2.5 rounded-full border border-white transition-colors ${index === activeSlide ? 'bg-white' : 'bg-white/40'}`}
                        type="button"
                        key={slide.src}
                        aria-label={`Show slide ${index + 1}`}
                        aria-current={index === activeSlide}
                        onClick={() => showSlide(index)}
                    />
                ))}
            </div>
        </section>
    );
}