export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  const body = (await response.json()) as ApiEnvelope<T>;

  if (!response.ok || !body.success) {
    throw new Error(body?.message || "Request failed");
  }

  return body.data;
}

export type ListingCard = {
  id: string;
  title: string;
  city: string;
  state: string;
  country: string;
  basePrice: number;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  images: { url: string }[];
  host: {
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
  };
};

export type ListingDetails = ListingCard & {
  description: string;
  beds: number;
  cleaningFee: number;
  instantBook: boolean;
  amenities: { amenity: { id: string; name: string; icon: string | null } }[];
  houseRules: { id: string; ruleText: string }[];
  images: { id: string; url: string; isCover: boolean }[];
};

export type PriceBreakdown = {
  nights: number;
  basePrice: number;
  subtotal: number;
  cleaningFee: number;
  guestServiceFee: number;
  totalAmount: number;
  hostServiceFee: number;
  hostPayoutAmount: number;
};

export async function fetchPublishedListings(params?: {
  location?: string;
  guests?: number;
  page?: number;
  limit?: number;
}) {
  const qp = new URLSearchParams();
  if (params?.location) qp.set("location", params.location);
  if (params?.guests) qp.set("guests", String(params.guests));
  qp.set("sort", "newest");
  qp.set("page", String(params?.page ?? 1));
  qp.set("limit", String(params?.limit ?? 12));

  return request<ListingCard[]>(`/api/search/listings?${qp.toString()}`);
}

export async function fetchListingDetails(id: string) {
  return request<ListingDetails>(`/api/listings/${id}`);
}

export async function fetchPriceBreakdown(input: {
  listingId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
}) {
  const qp = new URLSearchParams({
    listing_id: input.listingId,
    check_in: input.checkIn,
    check_out: input.checkOut,
    guests: String(input.guests),
  });

  return request<PriceBreakdown>(`/api/bookings/price-breakdown?${qp.toString()}`);
}
