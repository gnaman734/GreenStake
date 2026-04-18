import { CHARITIES } from "@/data/charities";
import { Charity } from "@/lib/domain/types";

export function listCharities(search?: string): Charity[] {
  if (!search) {
    return CHARITIES;
  }

  const term = search.toLowerCase();
  return CHARITIES.filter((charity) => {
    return (
      charity.name.toLowerCase().includes(term) ||
      charity.description.toLowerCase().includes(term) ||
      charity.tags.some((tag) => tag.toLowerCase().includes(term))
    );
  });
}

export function getCharityById(charityId: string): Charity | undefined {
  return CHARITIES.find((charity) => charity.id === charityId);
}

