export type Equipment = {
  _id: string;
  name: string;
  category: string;
  price: number;
  rentalType: "Daily" | "Weekly" | "Monthly";
  location: string;
  availableQuantity: number;
  image: string;
  status: "pending" | "approved" | "rejected";
};

const SAMPLE: Equipment[] = [
  { _id: "1", name: "CAT 320 Excavator", category: "Construction Equipment", price: 450, rentalType: "Daily", location: "Dhaka", availableQuantity: 3, image: "/hero/1.jpg", status: "approved" },
  { _id: "2", name: "Sony A7 IV Camera Kit", category: "Photography Equipment", price: 60, rentalType: "Daily", location: "Chattogram", availableQuantity: 5, image: "/hero/2.jpg", status: "approved" },
  { _id: "3", name: "DJI Mavic 3 Drone", category: "Photography Equipment", price: 90, rentalType: "Daily", location: "Sylhet", availableQuantity: 2, image: "/hero/3.jpg", status: "approved" },
  { _id: "4", name: "Kubota Tractor", category: "Agriculture Equipment", price: 700, rentalType: "Weekly", location: "Rajshahi", availableQuantity: 0, image: "/hero/4.jpg", status: "approved" },
  { _id: "5", name: "Pro PA Speaker System", category: "Event Equipment", price: 150, rentalType: "Daily", location: "Dhaka", availableQuantity: 4, image: "/hero/5.jpg", status: "approved" },
  { _id: "6", name: "Toyota Hiace Van", category: "Vehicles & Transportation", price: 2800, rentalType: "Monthly", location: "Khulna", availableQuantity: 1, image: "/hero/6.jpg", status: "approved" },
];

/**
 * Featured = 6 approved items. Once your API exists, set NEXT_PUBLIC_API_URL
 * and this calls GET /equipment/featured. Without the variable it uses
 * the sample data above.
 */
export async function getFeaturedEquipment(): Promise<Equipment[]> {
  const api = process.env.NEXT_PUBLIC_API_URL;
  if (!api) return SAMPLE;

  const res = await fetch(`${api}/equipment/featured`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error("Failed to load featured equipment");
  return res.json();
}