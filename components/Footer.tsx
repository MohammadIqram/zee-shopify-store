import React from 'react';

const supportLinks = [
    { label: 'Contact Us', href: 'mailto:care@gardenbyzee.in' },
    { label: 'Request Return/Exchange', href: 'mailto:care@gardenbyzee.in?subject=Return%20or%20Exchange%20Request' },
    { label: 'Call: 08069630390', href: 'tel:08069630390' },
    { label: 'Email: care@gardenbyzee.in', href: 'mailto:care@gardenbyzee.in' },
    { label: 'Click to WhatsApp', href: 'https://wa.me/99999099909' },
];

const importantLinks = ['About Us', 'Track your Order', 'Career', 'Blog', 'Invest with us', 'Happy Customers'];
const policyLinks = ['Shipping Policy', 'Privacy Policy', 'Terms & Conditions', 'Refund Policy', 'Return Policy'];

export default function Footer() {
    return (
        <footer className="relative bg-[#183D2B] px-6 pb-10 pt-16 text-[#F5F2E9] max-md:px-5 max-md:pt-12" aria-label="Site footer">
            <div className="mx-auto max-w-[1400px]">
                <div className="grid grid-cols-[1fr_1fr_1fr_1.65fr] gap-12 max-lg:grid-cols-2 max-md:grid-cols-1 max-md:gap-9">
                    <FooterColumn title="Support Center">
                        {supportLinks.map((link) => (
                            <a className="block w-fit text-[16px] leading-9 text-[#F5F2E9] no-underline transition-colors hover:text-[#B59A5A]" href={link.href} key={link.label}>
                                {link.label}
                            </a>
                        ))}
                    </FooterColumn>
                    <FooterColumn title="Important Links">
                        {importantLinks.map((label) => (
                            <a className="block w-fit text-[16px] leading-9 text-[#F5F2E9] no-underline transition-colors hover:text-[#B59A5A]" href="/" key={label}>
                                {label}
                            </a>
                        ))}
                    </FooterColumn>
                    <FooterColumn title="Our Policies">
                        {policyLinks.map((label) => (
                            <a className="block w-fit text-[16px] leading-9 text-[#F5F2E9] no-underline transition-colors hover:text-[#B59A5A]" href="/" key={label}>
                                {label}
                            </a>
                        ))}
                    </FooterColumn>
                    <FooterColumn title="Company Info">
                        <p className="m-0 text-[17px] leading-9 text-[#E7DFCF]">
                            Brand Owned by <strong className="text-white">Grandeur IT Innovations Private Limited</strong>
                        </p>
                        <p className="mt-4 text-[17px] leading-9 text-[#E7DFCF]">
                            <strong className="text-white">Add:</strong> 208, 2nd Floor SS Plaza, (Opp. Hilton Hotel, Sector 47,
                            <br className="max-md:hidden" /> Gurugram, Haryana 122002
                        </p>
                        <p className="mt-4 text-[17px] leading-9 text-[#E7DFCF]">
                            <strong className="text-white">Add:</strong> 2/666, Sector 2, Vikas Nagar, Lucknow 226022
                        </p>
                        <p className="mt-4 text-[17px] leading-9 text-[#E7DFCF]">CIN: U72200UP2020PTC127885</p>
                    </FooterColumn>
                </div>

                <div className="mt-20 flex items-end justify-between gap-8 max-md:mt-12 max-md:flex-col max-md:items-start border-t border-[#3F6B45]/40 pt-8">
                    <p className="m-0 text-[20px] text-[#E7DFCF]">© 2026 Garden by Zee</p>
                    <div>
                        <p className="m-0 mb-5 text-[20px] text-[#F5F2E9]">Follow Us</p>
                        <div className="flex items-center gap-3">
                            <SocialLink label="Facebook" href="https://www.facebook.com" icon={<FacebookIcon />} />
                            <SocialLink label="X" href="https://x.com" icon={<XIcon />} />
                            <SocialLink label="Instagram" href="https://www.instagram.com" icon={<InstagramIcon />} />
                            <SocialLink label="Pinterest" href="https://www.pinterest.com" icon={<PinterestIcon />} />
                            <SocialLink label="YouTube" href="https://www.youtube.com" icon={<YoutubeIcon />} />
                            <SocialLink label="LinkedIn" href="https://www.linkedin.com" icon={<LinkedinIcon />} />
                        </div>
                    </div>
                </div>
            </div>

            <a
                className="fixed bottom-8 right-9 z-30 flex h-16 w-16 items-center justify-center rounded-full bg-[#3F6B45] text-white shadow-lg transition-transform hover:scale-105 hover:bg-[#183D2B] max-md:bottom-5 max-md:right-5"
                href="https://wa.me/99999099909"
                target="_blank"
                rel="noreferrer"
                aria-label="Chat on WhatsApp"
            >
                <WhatsAppIcon />
            </a>
        </footer>
    );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section>
            <h2 className="m-0 mb-4 text-sm font-bold uppercase">{title}</h2>
            {children}
        </section>
    );
}

function SocialLink({ label, href, icon }: { label: string; href: string; icon: React.ReactNode }) {
    return (
        <a
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#858585] text-[#303030] no-underline transition-colors hover:bg-white"
            href={href}
            target="_blank"
            rel="noreferrer"
            aria-label={label}
        >
            {icon}
        </a>
    );
}

/* Custom SVG Icons */
function FacebookIcon() {
    return (
        <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
            <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H7.5v-3H10V9.5C10 7.01 11.49 5.6 13.78 5.6c1.1 0 2.25.2 2.25.2v2.47h-1.27c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 3h-2.34v6.8c4.56-.93 8-4.96 8-9.8z" />
        </svg>
    );
}

function InstagramIcon() {
    return (
        <svg className="h-5 w-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
    );
}

function LinkedinIcon() {
    return (
        <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
            <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
        </svg>
    );
}

function YoutubeIcon() {
    return (
        <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
    );
}

function XIcon() {
    return (
        <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
    );
}

function PinterestIcon() {
    return (
        <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
            <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
        </svg>
    );
}

function WhatsAppIcon() {
    return (
        <svg className="h-8 w-8 fill-current" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
        </svg>
    );
}