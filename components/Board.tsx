export default function Board() {
  return (
    <section id="board" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h3 className="text-2xl md:text-3xl font-bold text-mauve-wine mb-4">
            Board of Directors - RIY 2025-2026
          </h3>
          <p className="text-mauve-wine-light">
            Meet the dedicated leaders driving our mission forward
          </p>
        </div>

        {/* Dynamic Board Members */}
        <div
          id="board-members-container"
          className="grid md:grid-cols-2 gap-8"
        >
          {/* Later we’ll map board members dynamically from Supabase */}
          <div className="bg-gradient-to-br from-rose-tan to-rose-tan-dark p-6 rounded-xl text-white text-center luxury-shadow">
            <h4 className="text-lg font-semibold mb-2">John Doe</h4>
            <p className="text-sm opacity-90">President</p>
          </div>
          <div className="bg-gradient-to-br from-mauve-wine to-mauve-wine-dark p-6 rounded-xl text-white text-center luxury-shadow">
            <h4 className="text-lg font-semibold mb-2">Jane Smith</h4>
            <p className="text-sm opacity-90">Vice President</p>
          </div>
        </div>
      </div>
    </section>
  );
}
