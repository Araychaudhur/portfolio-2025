interface HeroSectionProps {
  title: string;
  subtitle: string;
}

export function HeroSection({ title, subtitle }: HeroSectionProps) {
  return (
    <section className="py-20 text-center">
      <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
        {title}
      </h1>
      <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
        {subtitle}
      </p>
    </section>
  );
}