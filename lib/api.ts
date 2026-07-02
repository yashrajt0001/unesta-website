export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://unesta-backend.onrender.com";

const TOKEN_KEY = "unesta_guest_token";

type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
};

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAuthToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

type RequestOptions = RequestInit & { auth?: boolean };

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { auth = false, headers: extraHeaders, ...rest } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((extraHeaders as Record<string, string>) ?? {}),
  };

  if (auth) {
    const token = getAuthToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...rest,
      headers,
      cache: "no-store",
    });
  } catch {
    throw new ApiError("Network error. Check your connection and try again.", 0);
  }

  if (response.status === 401 && auth) {
    clearAuthToken();
  }

  let body: ApiEnvelope<T> | null = null;
  try {
    body = (await response.json()) as ApiEnvelope<T>;
  } catch {
    throw new ApiError("Unexpected server response", response.status);
  }

  if (!response.ok || !body?.success) {
    throw new ApiError(body?.message || "Request failed", response.status);
  }

  return body.data;
}

// ─── Types ───────────────────────────────────────────────────────────────────

export type AuthUser = {
  id: string;
  phone: string | null;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  role: "GUEST" | "HOST" | "ADMIN";
  isPhoneVerified: boolean;
};

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
    firstName: string | null;
    lastName: string | null;
    avatarUrl: string | null;
  };
};

export type ListingDetails = Omit<ListingCard, "images"> & {
  description: string;
  beds: number;
  cleaningFee: number;
  instantBook: boolean;
  amenities: { amenity: { id: string; name: string; icon: string | null } }[];
  houseRules: { id: string; ruleText: string }[];
  images: { id: string; url: string; isCover: boolean }[];
};

// Mirrors the backend price-breakdown response (bookings.service priceBreakdownService).
// `subtotal` is not sent by the server — derive it as basePricePerNight * numNights.
export type PriceBreakdown = {
  numNights: number;
  numGuests: number;
  basePricePerNight: number;
  cleaningFee: number;
  serviceFee: number;
  hostServiceFee: number;
  totalPrice: number;
  hostPayout: number;
  currency: string;
};

export type Booking = {
  id: string;
  status:
    | "PENDING"
    | "CONFIRMED"
    | "CHECKED_IN"
    | "COMPLETED"
    | "CANCELLED_BY_GUEST"
    | "CANCELLED_BY_HOST"
    | "DECLINED"
    | "EXPIRED";
  checkInDate: string;
  checkOutDate: string;
  numGuests: number;
  totalAmount: number;
  listing: {
    id: string;
    title: string;
    city: string;
    state: string;
    images: { url: string }[];
  };
};

export type PaymentOrder = {
  orderId: string;
  amount: number; // in paise
  currency: string;
  keyId: string;
  bookingId: string;
  listingTitle: string;
};

export type Wishlist = {
  id: string;
  name: string;
  items: {
    id: string;
    listing: ListingCard;
  }[];
};

// ─── Search & listings ───────────────────────────────────────────────────────

export async function fetchPublishedListings(params?: {
  location?: string;
  guests?: number;
  checkIn?: string;
  checkOut?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
  sort?: string;
}) {
  const qp = new URLSearchParams();
  if (params?.location) qp.set("location", params.location);
  if (params?.guests) qp.set("guests", String(params.guests));
  if (params?.checkIn) qp.set("check_in", params.checkIn);
  if (params?.checkOut) qp.set("check_out", params.checkOut);
  if (params?.minPrice != null) qp.set("min_price", String(params.minPrice));
  if (params?.maxPrice != null) qp.set("max_price", String(params.maxPrice));
  qp.set("sort", params?.sort ?? "newest");
  qp.set("page", String(params?.page ?? 1));
  qp.set("limit", String(params?.limit ?? 12));

  return request<ListingCard[]>(`/api/search/listings?${qp.toString()}`);
}

export type SearchSuggestion = {
  type: "city" | "state" | "country";
  label: string;
  value: string;
};

export async function fetchSearchSuggestions(q: string) {
  const qp = new URLSearchParams({ q });
  return request<SearchSuggestion[]>(`/api/search/suggestions?${qp.toString()}`);
}

export async function fetchListingDetails(id: string) {
  return request<ListingDetails>(`/api/listings/${id}`);
}

/** Dates (YYYY-MM-DD) that cannot be booked: host-blocked + already-booked. */
export async function fetchUnavailableDates(id: string, from: string, to: string) {
  const qp = new URLSearchParams({ from, to });
  return request<string[]>(`/api/listings/${id}/unavailable-dates?${qp.toString()}`);
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
  return request<PriceBreakdown>(
    `/api/bookings/price-breakdown?${qp.toString()}`,
  );
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export const authApi = {
  sendOtp: (phone: string) =>
    request<{ message?: string } | null>(`/api/auth/send-otp`, {
      method: "POST",
      body: JSON.stringify({ phone }),
    }),

  verifyOtp: (phone: string, otp: string) =>
    request<{ user: AuthUser; accessToken: string; isNewUser: boolean }>(
      `/api/auth/verify-otp`,
      {
        method: "POST",
        body: JSON.stringify({ phone, otp }),
      },
    ),

  me: () => request<AuthUser>(`/api/users/me`, { auth: true }),

  updateProfile: (payload: {
    firstName?: string;
    lastName?: string;
    email?: string;
    bio?: string;
  }) =>
    request<AuthUser>(`/api/users/me`, {
      method: "PUT",
      auth: true,
      body: JSON.stringify(payload),
    }),
};

// ─── Bookings ────────────────────────────────────────────────────────────────

export const bookingsApi = {
  create: (payload: {
    listingId: string;
    checkInDate: string;
    checkOutDate: string;
    numGuests: number;
    specialRequests?: string;
    guestMessage?: string;
  }) =>
    request<Booking>(`/api/bookings`, {
      method: "POST",
      auth: true,
      body: JSON.stringify(payload),
    }),

  myBookings: (params?: { status?: string; page?: number; limit?: number }) => {
    const qp = new URLSearchParams({ role: "guest" });
    if (params?.status) qp.set("status", params.status);
    if (params?.page) qp.set("page", String(params.page));
    if (params?.limit) qp.set("limit", String(params.limit));
    return request<Booking[]>(`/api/bookings?${qp.toString()}`, { auth: true });
  },

  cancel: (id: string, reason?: string) =>
    request<Booking>(`/api/bookings/${id}/cancel`, {
      method: "PATCH",
      auth: true,
      body: JSON.stringify({ reason }),
    }),
};

// ─── Payments ────────────────────────────────────────────────────────────────

export const paymentsApi = {
  // Create a Razorpay order for a booking. Frontend opens checkout with the result.
  createOrder: (bookingId: string) =>
    request<PaymentOrder>(`/api/payments/create-order`, {
      method: "POST",
      auth: true,
      body: JSON.stringify({ bookingId }),
    }),

  // Confirm the payment after Razorpay checkout succeeds. Confirms the booking.
  verify: (payload: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) =>
    request<{ id: string; status: string }>(`/api/payments/verify`, {
      method: "POST",
      auth: true,
      body: JSON.stringify(payload),
    }),
};

// ─── Wishlists ───────────────────────────────────────────────────────────────

export const wishlistsApi = {
  list: () => request<Wishlist[]>(`/api/wishlists`, { auth: true }),

  create: (name: string) =>
    request<Wishlist>(`/api/wishlists`, {
      method: "POST",
      auth: true,
      body: JSON.stringify({ name }),
    }),

  addItem: (wishlistId: string, listingId: string) =>
    request<Wishlist>(`/api/wishlists/${wishlistId}/items`, {
      method: "POST",
      auth: true,
      body: JSON.stringify({ listingId }),
    }),

  removeItem: (wishlistId: string, listingId: string) =>
    request<{ message: string }>(
      `/api/wishlists/${wishlistId}/items/${listingId}`,
      { method: "DELETE", auth: true },
    ),

  delete: (wishlistId: string) =>
    request<{ message: string }>(`/api/wishlists/${wishlistId}`, {
      method: "DELETE",
      auth: true,
    }),
};
