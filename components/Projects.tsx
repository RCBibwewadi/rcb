export default function Projects() {
  return (
    <section id="projects" className="py-20 bg-luxury-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-mauve-wine mb-4">
            Making a Difference in Our Community
          </h2>
          <div className="w-24 h-1 luxury-gradient mx-auto mb-8"></div>
          <p className="text-mauve-wine-light max-w-2xl mx-auto">
            Our impactful projects address real community needs and create
            lasting positive change.
          </p>
        </div>

        {/* Project Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Project 1 */}
          <div className="bg-white rounded-xl luxury-shadow overflow-hidden hover:scale-105 transition-transform duration-300">
            <div className="h-48 bg-gradient-to-br from-rose-tan to-rose-tan-dark"></div>
            <div className="p-6">
              <h3 className="text-xl font-semibold text-mauve-wine mb-3">
                Project Annapurna
              </h3>
              <p className="text-mauve-wine-light mb-4">
                Food Donation Drive providing nutritious meals to underprivileged
                communities across Bibwewadi area.
              </p>
              <div className="flex items-center text-rose-tan font-medium cursor-pointer">
                <span>Learn More</span>
                <svg
                  className="w-4 h-4 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Project 2 */}
          <div className="bg-white rounded-xl luxury-shadow overflow-hidden hover:scale-105 transition-transform duration-300">
            <div className="h-48 bg-gradient-to-br from-mauve-wine to-mauve-wine-dark"></div>
            <div className="p-6">
              <h3 className="text-xl font-semibold text-mauve-wine mb-3">
                Skill Development Initiative
              </h3>
              <p className="text-mauve-wine-light mb-4">
                Empowering youth with essential skills through workshops and
                training programs for better employment opportunities.
              </p>
              <div className="flex items-center text-mauve-wine font-medium cursor-pointer">
                <span>Learn More</span>
                <svg
                  className="w-4 h-4 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Project 3 */}
          <div className="bg-white rounded-xl luxury-shadow overflow-hidden hover:scale-105 transition-transform duration-300">
            <div className="h-48 bg-gradient-to-br from-luxury-gold to-rose-tan"></div>
            <div className="p-6">
              <h3 className="text-xl font-semibold text-mauve-wine mb-3">
                Environmental Conservation
              </h3>
              <p className="text-mauve-wine-light mb-4">
                Tree plantation drives and environmental awareness campaigns to
                create a greener, sustainable future.
              </p>
              <div className="flex items-center text-luxury-gold font-medium cursor-pointer">
                <span>Learn More</span>
                <svg
                  className="w-4 h-4 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Project 4 */}
          <div className="bg-white rounded-xl luxury-shadow overflow-hidden hover:scale-105 transition-transform duration-300">
            <div className="h-48 bg-gradient-to-br from-rose-tan-light to-mauve-wine-light"></div>
            <div className="p-6">
              <h3 className="text-xl font-semibold text-mauve-wine mb-3">
                Digital Literacy Program
              </h3>
              <p className="text-mauve-wine-light mb-4">
                Bridging the digital divide by teaching computer and internet
                skills to seniors and underserved communities.
              </p>
              <div className="flex items-center text-rose-tan-light font-medium cursor-pointer">
                <span>Learn More</span>
                <svg
                  className="w-4 h-4 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
