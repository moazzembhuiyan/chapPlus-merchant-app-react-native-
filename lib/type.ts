import { ImageSourcePropType } from "react-native";

export interface Hotel {
    id: string;
    title: string;
    location: string;
    rating: number;
    price: number;
    originalPrice: number;
    image: ImageSourcePropType;
}

