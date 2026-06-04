import Image from "next/image";
import { ScrollReveal } from "@/components/landing/scroll-reveal";

interface Service {
  image: string;
  title: string;
  description: string;
}

const services: Service[] = [
  {
    image: "/images/campus-delivery.png",
    title: "Campus delivery",
    description:
      "Verified riders deliver directly to your hostel room. Track in real-time from order to doorstep.",
  },
  {
    image: "/images/weighing-scale.png",
    title: "Verified fill weight",
    description:
      "Every cylinder is weighed on arrival. You confirm the kg before accepting — no more guesswork.",
  },
  {
    image: "/images/student-receiving.png",
    title: "Doorstep convenience",
    description:
      "No trekking to town. No haggling. Just tap, pay, and your gas arrives while you study.",
  },
];

export function ServicesSection() {
  return (
    <section id="services" className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5">
        {/* Section heading */}
        <ScrollReveal>
          <div className="text-center">
            <h2 className="font-display text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">
              Everything you need, one tap away
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-neutral-500">
              From ordering to delivery verification — GasUp handles the entire
              refill journey.
            </p>
          </div>
        </ScrollReveal>

        {/* Cards grid */}
        <div className="mt-16 grid gap-8 sm:grid-cols-1 md:grid-cols-3">
          {services.map((service, index) => (
            <ScrollReveal key={service.title} delay={index * 150}>
              <div className="group overflow-hidden rounded-xl shadow-elevated transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl">
                {/* Image */}
                <div className="overflow-hidden">
                  <Image
                    src={service.image}
                    alt={service.title}
                    width={600}
                    height={400}
                    className="aspect-[3/2] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>

                {/* Text content */}
                <div className="p-6">
                  <h3 className="font-display text-xl font-semibold text-neutral-900">
                    {service.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-500">
                    {service.description}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
