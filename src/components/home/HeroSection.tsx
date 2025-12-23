"use client";

import Image from "next/image";
import Link from "next/link";

const heroImages = [
  {
    src: "https://res.cloudinary.com/dj4gy48lp/image/upload/v1758898858/altara_products/product_92_image_168.jpg",
    alt: "Elegant jewelry piece",
  },
  {
    src: "https://res.cloudinary.com/dj4gy48lp/image/upload/v1758898786/altara_products/product_54_image_101.jpg",
    alt: "Fine jewelry collection",
  },
];

export default function HeroSection() {
  return (
    <section className="relative w-full bg-cream overflow-hidden">
      {/* Main Hero Container */}
      <div className="container mx-auto px-4 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left order-2 lg:order-1">
            <span
              className="inline-block text-xs tracking-[0.3em] uppercase mb-6 font-light"
              style={{ color: "#dbb58e" }}
            >
              Colección de Joyería Fina
            </span>

            <h1
              className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-tight mb-8"
              style={{
                fontFamily: "Playfair Display, serif",
                color: "#172e3c",
                fontWeight: 400,
                letterSpacing: "-0.02em",
              }}
            >
              <span className="italic">Elegancia</span>
              <br />
              Atemporal
            </h1>

            <p
              className="text-base md:text-lg font-light mb-10 max-w-md mx-auto lg:mx-0 leading-relaxed"
              style={{ color: "#172e3c", opacity: 0.8 }}
            >
              Descubre nuestra exquisita colección de joyería, donde cada pieza
              cuenta una historia de arte y gusto refinado.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                href="/showroom"
                className="inline-block px-10 py-4 text-sm tracking-[0.2em] uppercase transition-all duration-300 hover:opacity-90 hover:transform hover:translate-y-[-2px]"
                style={{
                  backgroundColor: "#172e3c",
                  color: "#fffff5",
                }}
              >
                Comprar Colección
              </Link>

              <Link
                href="/showroom"
                className="inline-block px-10 py-4 text-sm tracking-[0.2em] uppercase border transition-all duration-300 hover:bg-[#4a80a1] hover:text-[#fffff5] hover:border-[#172e3c]"
                style={{
                  borderColor: "#172e3c",
                  color: "#172e3c",
                }}
              >
                Ver Todo
              </Link>
            </div>
          </div>

          {/* Right Images */}
          <div className="order-1 lg:order-2 relative">
            <div className="relative flex gap-4 justify-center lg:justify-end">
              {/* Primary Image */}
              <div className="relative w-[45%] aspect-[3/4] overflow-hidden shadow-2xl">
                <Image
                  src={heroImages[0].src}
                  alt={heroImages[0].alt}
                  fill
                  className="object-cover transition-transform duration-700 hover:scale-105"
                  priority
                  sizes="(max-width: 1024px) 45vw, 25vw"
                />
              </div>

              {/* Secondary Image - offset */}
              <div className="relative w-[45%] aspect-[3/4] overflow-hidden shadow-2xl mt-12">
                <Image
                  src={heroImages[1].src}
                  alt={heroImages[1].alt}
                  fill
                  className="object-cover transition-transform duration-700 hover:scale-105"
                  priority
                  sizes="(max-width: 1024px) 45vw, 25vw"
                />
              </div>
            </div>

            {/* Decorative Elements */}
            <div
              className="absolute -bottom-6 -left-6 w-32 h-32 border opacity-30 hidden lg:block"
              style={{ borderColor: "#dbb58e" }}
            />
            <div
              className="absolute -top-6 -right-6 w-24 h-24 opacity-20 hidden lg:block"
              style={{ backgroundColor: "#dbb58e" }}
            />
          </div>
        </div>
      </div>

      {/* Bottom Decorative Line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{ backgroundColor: "#d6e2e2" }}
      />
    </section>
  );
}
