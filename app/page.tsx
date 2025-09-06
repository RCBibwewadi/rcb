import About from "@/components/About";
import Board from "@/components/Board";
import ContactSection from "@/components/ContactUs";
import Events from "@/components/Events";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import JoinUsSection from "@/components/JoinUs";
import Projects from "@/components/Projects";

export default function Home() {
  return (
    <main className="flex flex-col">
      <Hero />
      <About />
      <Board />
      <Projects />
      <Events />
      <JoinUsSection />
      <Footer />
    </main>
  );
}
