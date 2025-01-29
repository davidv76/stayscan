import {useState } from "react";
import { useLoadScript, Autocomplete } from "@react-google-maps/api";

import { Input } from "./ui/input";

const apikey = process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY!; // Ensure default fallback for string
const libraries: "places"[] = ["places"]; // Explicit typing for libraries array

interface AddressComponents {
  street_number: string;
  route: string;
  locality: string;
  administrative_area_level_1: string;
  postal_code: string;
  country: string;
}

interface WifiNetwork {
    name: string;
    password: string;
  }


interface Property {
    id: string;
    wifi: WifiNetwork;
    rubbishAndBins: string;
    localFood: string;
    applianceGuides: string;
    name: string;
    location: string;
    description: string;
    amenities: string;
    images: string;
    status: "active" | "inactive";
    qrScans: number;
    emergencyContact: string;
    nearbyPlaces: string;
    checkOutDay: string;
    houseRules: string;
    digitalGuide: string;
  }

interface Props {
    address: Omit<Property, "id"> & { image: File | null };
    setAddress: (value: Omit<Property, "id"> & { image: File | null }) => void;
}


const AddressSuggestions: React.FC<Props> = ({ address, setAddress }) => {
    
  const [autocomplete, setAutocomplete] =
    useState<google.maps.places.Autocomplete | null>(null);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apikey,
    libraries,
  });

  const onLoad = (autocompleteInstance: google.maps.places.Autocomplete) => {
    setAutocomplete(autocompleteInstance);
  };

  const onPlaceChanged = () => {
    if (autocomplete) {

      const place = autocomplete.getPlace();

      if (!place.geometry) {
        console.log("No details available for input: '" + place.name + "'");
        return;
      }

      // Initialize addressComponents with empty strings
      const addressComponents: AddressComponents = {
        street_number: "",
        route: "",
        locality: "",
        administrative_area_level_1: "",
        postal_code: "",
        country: "",
      };

      // Map place.address_components
      place.address_components?.forEach((component) => {
        const type = component.types[0] as keyof AddressComponents;
        if (type in addressComponents) {
          addressComponents[type] = component.long_name;
        }
      });

      // Get formatted address
      const formattedAddress = place.formatted_address || "";

      setAddress({ ...address, location: formattedAddress })
    }
  };

  if (loadError) {
    return (
      <div className="text-red-500">
        Error loading Google Maps API: {loadError.message}
      </div>
    );
  }


  return (
    <div>
      {!isLoaded ? (
        <Input disabled placeholder="Loading..." className="w-full" />
      ) : (
        <Autocomplete
          onLoad={onLoad}
          onPlaceChanged={onPlaceChanged}
          fields={["address_components", "geometry", "formatted_address"]}
        >

          <Input
            id="location"
            value={address.location}
            onChange={(e) =>
              setAddress({ ...address, location: e.target.value })
            }
            className="w-full border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500"
            placeholder="e.g. 867 Champlin Mountains, Howetown, WI "
          />
        </Autocomplete>
      )}
    </div>
  );
};

export default AddressSuggestions;
