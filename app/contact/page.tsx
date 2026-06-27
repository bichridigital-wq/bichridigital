import Navbar from "../navbar";
import ContactHero from "../components/contact/ContactHero";
import ContactCards from "../components/contact/ContactCards";
import ContactForm from "../components/contact/ContactForm";
import ContactMap from "../components/contact/ContactMap";
import ContactCTA from "../components/contact/ContactCTA";
import ContactFooter from "../components/contact/contactfooter";

export default function ContactPage() {
  return (
    <>
      <Navbar />

      <main className="bg-[#020B2E] text-white pt-24">
        <ContactHero />
        <ContactCards />
        <ContactForm />
        <ContactMap />
        <ContactCTA />
      </main>

      <ContactFooter />
    </>
  );
}