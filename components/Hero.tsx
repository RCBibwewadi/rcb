export default function Hero() {
  return (
    <section
      id="home"
      className="pt-16 min-h-screen flex items-center relative overflow-hidden"
    >
      {/* Background Layers */}
      <div className="absolute inset-0 luxury-gradient opacity-20"></div>
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1559027615-cd4628902d4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=2073&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-mauve-wine-dark opacity-60"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Rotaract Club of{" "}
            <span className="bg-gradient-to-r from-rose-tan to-luxury-gold bg-clip-text text-transparent">
              Bibwewadi Pune
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-luxury-cream mb-8 font-medium">
            From solos to symphony
          </p>
          <p className="text-lg text-gray-300 mb-10 max-w-2xl mx-auto">
            Join us in creating positive change and impacting lives through
            service, leadership, and community engagement.
          </p>
          <a
            href="#join"
            className="inline-block luxury-gradient hover:opacity-90 text-white font-semibold px-8 py-4 rounded-full transition-all duration-300 hover:scale-105 luxury-shadow"
          >
            Join Our Mission
          </a>
        </div>
      </div>
    </section>
  );
}
