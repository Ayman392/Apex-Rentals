"use client";

import React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { InfiniteSlider } from "@/components/ui/infinite-slider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SectionTitle } from "@/components/ui/section-title";
import { motion } from "framer-motion";

type Testimonial = {
  quote: string;
  image?: string;
  name: string;
  role: string;
  company?: string;
  rating: number;
};

const testimonials: Testimonial[] = [
  {
    quote:
      "The excavator arrived on the agreed morning and was in better shape than the photos. Paying through Stripe took under a minute.",
    name: "Tanvir Ahmed",
    role: "Site Engineer",
    company: "Dhaka",
    rating: 5,
  },
  {
    quote:
      "I rented a full-frame kit for a three-day shoot. The owner replied fast and pickup was easy. Cheaper than buying for one job.",
    name: "Nusrat Jahan",
    role: "Photographer",
    company: "Dhaka",
    rating: 5,
  },
  {
    quote:
      "Good machine at a fair weekly rate. Delivery ran a few hours late, but the owner called ahead and kept me updated.",
    name: "Rafiq Hossain",
    role: "Farm Manager",
    company: "Bogura",
    rating: 4,
  },
  {
    quote:
      "Everything we needed for a 300-person event came from one listing. The rental terms were clear, so there were no surprises at return.",
    name: "Sadia Rahman",
    role: "Event Planner",
    company: "Dhaka",
    rating: 5,
  },
  {
    quote:
      "The drone came with spare batteries and a hard case. Booking dates were easy to change before I paid.",
    name: "Imran Khan",
    role: "Videographer",
    company: "Sylhet",
    rating: 4,
  },
  {
    quote:
      "I could compare daily and monthly rates and pick the cheaper option. I'll list my own idle equipment here next.",
    name: "Mehnaz Chowdhury",
    role: "Contractor",
    company: "Chattogram",
    rating: 5,
  },
  {
    quote:
      "Listing my generators took ten minutes. The admin approved them the same day and my first booking came in that week.",
    name: "Karim Uddin",
    role: "Equipment Owner",
    company: "Gazipur",
    rating: 5,
  },
  {
    quote:
      "Payments land in my dashboard with the rental dates beside them, so I always know what is out and what is coming back.",
    name: "Farhana Akter",
    role: "Equipment Owner",
    company: "Khulna",
    rating: 4,
  },
  {
    quote:
      "We needed a power tiller for one planting season. Renting saved us the cost of a machine that would sit idle all year.",
    name: "Abdul Malek",
    role: "Farmer",
    company: "Rajshahi",
    rating: 4,
  },
];

const firstColumn = testimonials.slice(0, 3);
const secondColumn = testimonials.slice(3, 6);
const thirdColumn = testimonials.slice(6, 9);

function RatingStars({ rating }: { rating: number }) {
  const clamped = Math.max(1, Math.min(5, Math.round(rating)));

  return (
    <div
      className="flex items-center gap-1"
      aria-label={`Rated ${clamped} out of 5`}
    >
      {Array.from({ length: 5 }, (_, idx) => {
        const filled = idx < clamped;
        return (
          <Star
            key={idx}
            aria-hidden="true"
            className={cn(
              "size-4 shrink-0",
              filled
                ? "fill-current text-coral-text"
                : "text-muted-foreground/30",
            )}
          />
        );
      })}
    </div>
  );
}

export function CustomerReview() {
  return (
    <section className="relative w-full overflow-hidden">
      <div className="mx-auto w-full max-w-6xl px-6 py-10 sm:px-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-6 border-b border-border pb-8 md:flex-row md:items-end md:justify-between"
        >
          <SectionTitle text="What our renters say" />
          <p className="max-w-xs text-lg font-medium leading-snug tracking-tight md:text-right">
            <span className="text-foreground">
              See what our customers and owners
            </span>{" "}
            <span className="text-muted-foreground">
              have to say about us.
            </span>
          </p>
        </motion.div>

        <div
          className={cn(
            "mt-10 flex max-h-[40rem] justify-center gap-6 overflow-hidden",
            "[mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)]",
          )}
        >
          <InfiniteSlider direction="vertical" gap={24}>
            {firstColumn.map((testimonial) => (
              <ReviewCard
                key={testimonial.name}
                testimonial={testimonial}
              />
            ))}
          </InfiniteSlider>
          <InfiniteSlider
            className="hidden md:block"
            direction="vertical"
            gap={24}
          >
            {secondColumn.map((testimonial) => (
              <ReviewCard
                key={testimonial.name}
                testimonial={testimonial}
              />
            ))}
          </InfiniteSlider>
          <InfiniteSlider
            className="hidden lg:block"
            direction="vertical"
            gap={24}
          >
            {thirdColumn.map((testimonial) => (
              <ReviewCard
                key={testimonial.name}
                testimonial={testimonial}
              />
            ))}
          </InfiniteSlider>
        </div>
      </div>
    </section>
  );
}

function ReviewCard({
  testimonial,
  className,
  ...props
}: React.ComponentProps<"figure"> & {
  testimonial: Testimonial;
}) {
  const { quote, image, name, role, company, rating } = testimonial;
  return (
    <figure
      className={cn(
        "glass flex h-[270px] w-full max-w-xs flex-col justify-between rounded-3xl border bg-card p-6 shadow-lg shadow-foreground/10 dark:bg-card/20",
        className,
      )}
      {...props}
    >
      <div className="space-y-3">
        <RatingStars rating={rating} />
        <blockquote className="line-clamp-5 text-sm leading-relaxed text-foreground/90">
          “{quote}”
        </blockquote>
      </div>

      <figcaption className="mt-4 flex items-center gap-2.5 border-t border-border/60 pt-3.5">
        <Avatar className="size-8 shrink-0 rounded-full">
          {image && (
            <AvatarImage alt={`${name}'s profile picture`} src={image} />
          )}
          <AvatarFallback>{name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-col">
          <cite className="truncate font-medium not-italic leading-5 tracking-tight">
            {name}
          </cite>
          <span className="truncate text-xs leading-5 tracking-tight text-muted-foreground">
            {company ? `${role}, ${company}` : role}
          </span>
        </div>
      </figcaption>
    </figure>
  );
}

export default CustomerReview;