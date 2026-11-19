import { cn } from "@/lib/utils";
import { InfiniteSlider } from "@/components/ui/infinite-slider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SectionTitle } from "@/components/ui/section-title";

type Testimonial = {
  quote: string;
  image?: string;
  name: string;
  role: string;
  company?: string;
};

// Placeholder content for Apex Rentals. Add an `image` URL to show a photo;
// without one the avatar shows the person's initial.
const testimonials: Testimonial[] = [
  {
    quote:
      "The excavator arrived on the agreed morning and was in better shape than the photos. Paying through Stripe took under a minute.",
    name: "Tanvir Ahmed",
    role: "Site Engineer",
    company: "Dhaka",
  },
  {
    quote:
      "I rented a full-frame kit for a three-day shoot. The owner replied fast and pickup was easy. Cheaper than buying for one job.",
    name: "Nusrat Jahan",
    role: "Photographer",
    company: "Dhaka",
  },
  {
    quote:
      "Good machine at a fair weekly rate. Delivery ran a few hours late, but the owner called ahead and kept me updated.",
    name: "Rafiq Hossain",
    role: "Farm Manager",
    company: "Bogura",
  },
  {
    quote:
      "Everything we needed for a 300-person event came from one listing. The rental terms were clear, so there were no surprises at return.",
    name: "Sadia Rahman",
    role: "Event Planner",
    company: "Dhaka",
  },
  {
    quote:
      "The drone came with spare batteries and a hard case. Booking dates were easy to change before I paid.",
    name: "Imran Khan",
    role: "Videographer",
    company: "Sylhet",
  },
  {
    quote:
      "I could compare daily and monthly rates and pick the cheaper option. I'll list my own idle equipment here next.",
    name: "Mehnaz Chowdhury",
    role: "Contractor",
    company: "Chattogram",
  },
  {
    quote:
      "Listing my generators took ten minutes. The admin approved them the same day and my first booking came in that week.",
    name: "Karim Uddin",
    role: "Equipment Owner",
    company: "Gazipur",
  },
  {
    quote:
      "Payments land in my dashboard with the rental dates beside them, so I always know what is out and what is coming back.",
    name: "Farhana Akter",
    role: "Equipment Owner",
    company: "Khulna",
  },
  {
    quote:
      "We needed a power tiller for one planting season. Renting saved us the cost of a machine that would sit idle all year.",
    name: "Abdul Malek",
    role: "Farmer",
    company: "Rajshahi",
  },
];

const firstColumn = testimonials.slice(0, 3);
const secondColumn = testimonials.slice(3, 6);
const thirdColumn = testimonials.slice(6, 9);

export function CustomerReview() {
  return (
    <section className="relative py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto flex max-w-sm flex-col items-center justify-center gap-4">
          <div className="flex justify-center">
            <div className="rounded-lg border px-4 py-1">Customer Reviews</div>
          </div>
          <SectionTitle text="What our renters say" className="font-bold text-3xl tracking-tighter lg:text-4xl" />
          <p className="text-center text-muted-foreground text-sm">
            See what our customers and owners have to say about us.
          </p>
        </div>

        <div
          className={cn(
            "mt-10 flex max-h-160 justify-center gap-6 overflow-hidden",
            "mask-[linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)]",
          )}
        >
          <InfiniteSlider direction="vertical" speed={30} speedOnHover={15}>
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
            speed={50}
            speedOnHover={25}
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
            speed={35}
            speedOnHover={17}
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
  const { quote, image, name, role, company } = testimonial;
  return (
    <figure
      className={cn(
        "w-full max-w-xs rounded-3xl border bg-card p-8 shadow-foreground/10 shadow-lg dark:bg-card/20",
        className,
      )}
      {...props}
    >
      <blockquote>{quote}</blockquote>
      <figcaption className="mt-5 flex items-center gap-2">
        <Avatar className="size-8 rounded-full">
          {image && <AvatarImage alt={`${name}'s profile picture`} src={image} />}
          <AvatarFallback>{name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <cite className="font-medium not-italic leading-5 tracking-tight">
            {name}
          </cite>
          <span className="text-muted-foreground text-sm leading-5 tracking-tight">
            {company ? `${role}, ${company}` : role}
          </span>
        </div>
      </figcaption>
    </figure>
  );
}

export default CustomerReview;