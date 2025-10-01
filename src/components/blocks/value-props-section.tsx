import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

interface ValueProp {
  title: string;
  description: string;
}

interface ValuePropsSectionProps {
  title: string;
  props: ValueProp[];
}

export function ValuePropsSection({ title, props }: ValuePropsSectionProps) {
  return (
    <section className="py-20">
      <h2 className="text-3xl font-bold text-center mb-12">{title}</h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {props.map((prop, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle>{prop.title}</CardTitle>
              <CardDescription className="pt-2">
                {prop.description}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  );
}