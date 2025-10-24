"use client";
import { useForm, ValidationError } from "@formspree/react";


export default function JoinUs() {
  const [state, handleSubmit] = useForm("xvgweenl");
  return (
    <section
      id="join"
      className="py-20 luxury-gradient text-white relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-mauve-wine-dark opacity-50"></div>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Become a Part of the Family
          </h2>
          <div className="w-24 h-1 bg-luxury-gold mx-auto mb-8"></div>
          <p className="text-luxury-cream max-w-2xl mx-auto">
            Join a community of passionate young leaders committed to making a
            difference through service and fellowship.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Benefits */}
          <div>
            <h3 className="text-2xl font-semibold mb-8">Why Join Rotaract?</h3>
            <div className="space-y-6">
              {[
                {
                  title: "Professional Development",
                  text: "Enhance your leadership skills, public speaking, and project management abilities.",
                  color: "bg-rose-tan",
                },
                {
                  title: "Networking Opportunities",
                  text: "Connect with professionals, entrepreneurs, and leaders across various industries.",
                  color: "bg-mauve-wine-light",
                },
                {
                  title: "Community Impact",
                  text: "Make a meaningful difference in your community through service projects.",
                  color: "bg-luxury-gold",
                },
                {
                  title: "Lifelong Friendships",
                  text: "Build lasting relationships with like-minded individuals who share your values.",
                  color: "bg-rose-tan-light",
                },
              ].map((item, i) => (
                <div key={i} className="flex items-start">
                  <div
                    className={`w-8 h-8 ${item.color} rounded-full flex items-center justify-center mr-4 mt-1 luxury-shadow`}
                  >
                    <span className="text-white font-bold">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">{item.title}</h4>
                    <p className="text-luxury-cream opacity-90">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Form */}
          <div className="glass-effect rounded-xl p-8 text-mauve-wine luxury-shadow">
            <h3 className="text-2xl font-semibold mb-6 text-center">
              Express Your Interest
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-mauve-wine-dark mb-2">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  required
                  className="w-full px-4 py-3 border border-rose-tan-light rounded-lg focus:ring-2 focus:ring-rose-tan focus:border-transparent transition-all bg-white"
                />
                <ValidationError
                  prefix="Name"
                  field="name"
                  errors={state.errors}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-mauve-wine-dark mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  required
                  className="w-full px-4 py-3 border border-rose-tan-light rounded-lg focus:ring-2 focus:ring-rose-tan focus:border-transparent transition-all bg-white"
                />
                <ValidationError
                  prefix="Email"
                  field="email"
                  errors={state.errors}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-mauve-wine-dark mb-2">
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  placeholder="Enter your phone number"
                  required
                  className="w-full px-4 py-3 border border-rose-tan-light rounded-lg focus:ring-2 focus:ring-rose-tan focus:border-transparent transition-all bg-white"
                />
                <ValidationError
                  prefix="Phone"
                  field="phone"
                  errors={state.errors}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-mauve-wine-dark mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  placeholder="Tell us why you're interested in joining Rotaract..."
                  className="w-full px-4 py-3 border border-rose-tan-light rounded-lg focus:ring-2 focus:ring-rose-tan focus:border-transparent transition-all bg-white"
                />
                <ValidationError
                  prefix="Message"
                  field="message"
                  errors={state.errors}
                />
              </div>

              <button
                type="submit"
                disabled={state.submitting}
                className="w-full bg-gradient-to-r from-rose-tan to-mauve-wine hover:from-rose-tan-dark hover:to-mauve-wine-dark text-white font-semibold py-3 rounded-lg transition-all duration-300 luxury-shadow"
              >
                {state.submitting ? "Sending..." : `I'm Interested!`}
              </button>

              {state.succeeded && (
                <p className="text-center text-green-600 mt-4">
                  ✅ Thanks for your interest! We’ll contact you soon.
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
