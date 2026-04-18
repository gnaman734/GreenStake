import { Charity } from "@/lib/domain/types";

export const CHARITIES: Charity[] = [
  {
    id: "junior-fairways-foundation",
    name: "Junior Fairways Foundation",
    description:
      "Funds coaching scholarships and equipment for underrepresented junior golfers.",
    heroImage: "/charity-junior-fairways.jpg",
    tags: ["youth", "education", "golf"],
    upcomingEvent: "City Junior Golf Day - 15 May",
    isFeatured: true,
  },
  {
    id: "clean-water-drive",
    name: "Clean Water Drive",
    description:
      "Builds clean water infrastructure in rural communities with transparent impact reports.",
    heroImage: "/charity-clean-water.jpg",
    tags: ["health", "infrastructure"],
    upcomingEvent: "Impact Showcase - 01 June",
  },
  {
    id: "green-links-initiative",
    name: "Green Links Initiative",
    description:
      "Restores local ecosystems around sports spaces through community volunteering programs.",
    heroImage: "/charity-green-links.jpg",
    tags: ["environment", "community"],
    upcomingEvent: "Planting Weekend - 22 April",
  },
];

