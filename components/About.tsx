export default function About() {
  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-mauve-wine mb-4">
            Who We Are
          </h2>
          <div className="w-24 h-1 luxury-gradient mx-auto mb-8"></div>
        </div>

        {/* About Content */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          {/* Text Side */}
          <div>
            <h3 className="text-2xl font-semibold text-mauve-wine mb-6">
              About Rotaract Club of Bibwewadi
            </h3>
            <p className="text-mauve-wine-light mb-6 leading-relaxed">
              Rotaract is a youth organization of Rotary International for young
              and aspiring leaders (typically 18-30) who wish to grow their
              network and develop themselves both professionally and personally.
            </p>
            <p className="text-mauve-wine-light mb-6 leading-relaxed">
              <span className="font-bold">
                The Rotaract Club of Bibwewadi Pune
              </span>{" "}
              is committed to making a difference in our local community while
              fostering leadership, fellowship, and service among young
              professionals.
            </p>
            <p className="text-mauve-wine-light leading-relaxed">
              As a Board of Directors, we work collectively across all avenues
              to create a holistic impact in the lives of our members. From
              social bonding and fundraising initiatives to hosting delegates
              from other states and countries, our efforts go beyond projects —
              they build lasting friendships, networks, and opportunities for
              growth. At its core, our club is a close-knit family where
              professionalism meets purpose, leaders are nurtured, and every
              member is encouraged to grow, connect, and serve with meaning.
            </p>
          </div>

          {/* Cards Side */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-rose-tan to-rose-tan-dark p-6 rounded-xl text-white text-center luxury-shadow">
              <h4 className="font-semibold mb-2">Professional Development</h4>
              <p className="text-sm opacity-90">Building careers and skills</p>
            </div>
            <div className="bg-gradient-to-br from-mauve-wine to-mauve-wine-dark p-6 rounded-xl text-white text-center luxury-shadow">
              <h4 className="font-semibold mb-2">Community Service</h4>
              <p className="text-sm opacity-90">Serving our local community</p>
            </div>
            <div className="bg-gradient-to-br from-luxury-gold to-rose-tan p-6 rounded-xl text-white text-center luxury-shadow">
              <h4 className="font-semibold mb-2">International Service</h4>
              <p className="text-sm opacity-90">Global impact initiatives</p>
            </div>
            <div className="bg-gradient-to-br from-rose-tan-light to-mauve-wine-light p-6 rounded-xl text-white text-center luxury-shadow">
              <h4 className="font-semibold mb-2">Club Service</h4>
              <p className="text-sm opacity-90">Strengthening our club</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
