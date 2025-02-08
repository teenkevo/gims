import { cn } from "@/lib/utils";
import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";
import Marquee from "@/components/ui/marquee";
import { CalendarIcon, FileTextIcon, InputIcon } from "@radix-ui/react-icons";
import { Share2Icon } from "lucide-react";
import { Communications } from "./communications";
import { FeatureServiceManagement } from "./feature-service-management";
import { FeatureProjectTracking } from "./feature-project-tracking";
import { FeatureComplexForm } from "./feature-complex-form";

interface Item {
  name: string;
  description: string;
  icon: string;
  color: string;
  time: string;
}

let notifications = [
  {
    name: "Payment received",
    description: "Magic UI",
    time: "15m ago",

    icon: "💸",
    color: "#00C9A7",
  },
  {
    name: "User signed up",
    description: "Magic UI",
    time: "10m ago",
    icon: "👤",
    color: "#FFB800",
  },
  {
    name: "New message",
    description: "Magic UI",
    time: "5m ago",
    icon: "💬",
    color: "#FF3D71",
  },
  {
    name: "New event",
    description: "Magic UI",
    time: "2m ago",
    icon: "🗞️",
    color: "#1E86FF",
  },
];

notifications = Array.from({ length: 10 }, () => notifications).flat();

const Notification = ({ name, description, icon, color, time }: Item) => {
  return (
    <figure
      className={cn(
        "relative mx-auto min-h-fit w-full max-w-[400px] transform cursor-pointer overflow-hidden rounded-2xl p-4",
        // animation styles
        "transition-all duration-200 ease-in-out hover:scale-[103%]",
        // light styles
        "bg-white [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)]",
        // dark styles
        "transform-gpu dark:bg-transparent dark:backdrop-blur-md dark:[border:1px_solid_rgba(255,255,255,.1)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset]"
      )}
    >
      <div className="flex flex-row items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-2xl"
          style={{
            backgroundColor: color,
          }}
        >
          <span className="text-lg">{icon}</span>
        </div>
        <div className="flex flex-col overflow-hidden">
          <figcaption className="flex flex-row items-center whitespace-pre text-lg font-medium dark:text-white ">
            <span className="text-sm sm:text-lg">{name}</span>
            <span className="mx-1">·</span>
            <span className="text-xs text-gray-500">{time}</span>
          </figcaption>
          <p className="text-sm font-normal dark:text-white/60">
            {description}
          </p>
        </div>
      </div>
    </figure>
  );
};

const features = [
  {
    Icon: FileTextIcon,
    name: "Move fast with project tracking",
    description: "Track better, prevent delays & deliver faster.",
    href: "/",
    cta: "Learn more",
    className: "col-span-3 lg:col-span-1",
    background: (
      <Marquee
        pauseOnHover
        className="absolute top-10 [--duration:40s] [mask-image:linear-gradient(to_top,transparent_40%,#000_100%)] "
      >
        <FeatureProjectTracking />
      </Marquee>
    ),
  },
  {
    Icon: InputIcon,
    name: "Centralized services repository",
    description:
      "Manage and search through all your lab's services in one place.",
    href: "/",
    cta: "Learn more",
    className: "col-span-3 lg:col-span-2",
    background: (
      <div className="absolute right-0 h-[500px] w-[80%] p-2 mx-10 border rounded-lg bg-secondary/40 top-10 origin-top transition-all duration-300 ease-out [mask-image:linear-gradient(to_top,transparent_40%,#000_100%)]">
        <FeatureServiceManagement />
      </div>
    ),
  },
  {
    Icon: Share2Icon,
    name: "Flexible billing workflows",
    description:
      "Charge your clients the way you want. There's a workflow for everyone.",
    href: "/",
    cta: "Learn more",
    className: "col-span-3 lg:col-span-2",
    background: <FeatureComplexForm />,
  },
  {
    Icon: CalendarIcon,
    name: "Communicate through a single channel",
    description: "Streamline all your team's communications in one place.",
    className: "col-span-3 lg:col-span-1",
    href: "/",
    cta: "Learn more",
    background: (
      <Communications className="absolute right-5 top-2 h-[350px] w-[350px] mx-auto border-none transition-all duration-300 ease-out [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)] group-hover:scale-105" />
    ),
  },
];

export function Features() {
  return (
    <BentoGrid className="pb-10">
      {features.map((feature, idx) => (
        <BentoCard key={idx} {...feature} />
      ))}
    </BentoGrid>
  );
}
