// src/app/(site)/contact/page.tsx
import ContactForm from "./ContactForm";

export const metadata = {
  title: "Contact",
  description: "Get in touch",
};

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Contact</h1>

      <p className="mt-6 text-base leading-7">
        The easiest way to reach me is email. I also keep GitHub and LinkedIn
        current. I am open to roles that blend platform and AI work.
      </p>

      <div className="mt-4 space-y-2">
        <p>
          Email:{" "}
          <a className="underline" href="mailto:araychaudhur@binghamton.edu">
            araychaudhur@binghamton.edu
          </a>
        </p>
        <p>
          GitHub:{" "}
          <a className="underline" href="https://github.com/Araychaudhur">
            github.com/Araychaudhur
          </a>
        </p>
        <p>
          LinkedIn:{" "}
          <a
            className="underline"
            href="https://www.linkedin.com/in/apoorva-ray-chaudhuri"
          >
            linkedin.com/in/apoorva-ray-chaudhuri
          </a>
        </p>
      </div>

      <ContactForm />
    </main>
  );
}
