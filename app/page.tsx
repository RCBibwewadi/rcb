import About from "@/components/About";
import Board from "@/components/Board";
import Events from "@/components/Events";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import JoinUsSection from "@/components/JoinUs";
import Navbar from "@/components/Navbar";
import Projects from "@/components/Projects";

export default function Home() {
  return (
    <main className="flex flex-col">
      <Navbar />
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
