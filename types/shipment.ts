// Shipment types
export interface ClientProfile {
    id: string;
    companyName: string;
    commercialReg?: string | null;
    taxNumber?: string | null;
    address?: string | null;
    userId: string;
}

// Type aliases for documentation - Prisma returns these as strings
export type ShipmentType = 'SEA' | 'AIR' | 'LAND';
export type ShipmentStatus =
    | 'PENDING'
    | 'PROCESSING'
    | 'IN_TRANSIT'
    | 'CUSTOMS_CLEARANCE'
    | 'DELIVERED'
    | 'CANCELLED';

export interface Shipment {
    id: string;
    trackingNumber: string;
    type: string; // ShipmentType stored as string in DB
    status: string; // ShipmentStatus stored as string in DB
    origin: string;
    destination: string;
    weight?: number | null;
    pieces?: number | null;
    description?: string | null;
    departureDate?: Date | null;
    arrivalDate?: Date | null;
    clientId: string;
    managedById?: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface ShipmentWithClient extends Shipment {
    client: ClientProfile;
}
