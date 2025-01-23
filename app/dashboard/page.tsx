"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { put } from "@vercel/blob";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  QrCode,
  Home,
  Settings,
  Download,
  ArrowUpDown,
  Building2,
  Edit,
  Trash2,
  Clock,
  AlertTriangle,
  Info,
  Printer,
  MapPin,
  Utensils,
  MoreHorizontal,
  ExternalLink,
  Wrench,
  ChevronRight,
  ChevronLeft,
  X,
  Zap,
  Book,
  Wifi,
  Camera,
  Phone,
  CalendarCheck,
  CheckCircle,
  HelpCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { loadStripe } from "@stripe/stripe-js";
import QRCode from "qrcode";
import BtnSpinner from "@/components/ui/btnSpinner";


// Define color scheme
const colors = {
  black: "#000000",
  oxfordBlue: "#14213D",
  orange: "#FCA311",
  platinum: "#E5E5E5",
  white: "#FFFFFF",
};

// Initialize Stripe
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

// Main dashboard component
export default function StayScanDashboard() {
  // State declarations
  const router = useRouter();
  const { user, isLoaded, isSignedIn } = useUser();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isGeneratingGuide, setIsGeneratingGuide] = useState(false);
  const [newProperty, setNewProperty] = useState<
    Omit<Property, "id"> & { image: File | null }
  >({
    name: "",
    location: "",
    description: "",
    amenities: "",
    images: "",
    status: "inactive",
    qrScans: 0,
    image: null,
    emergencyContact: "",
    rubbishAndBins: "",
    wifi: "",
    localFood: "",
    applianceGuides: "",
    nearbyPlaces: "",
    checkOutDay: "",
    houseRules: "",
    digitalGuide: "",
  });
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null
  );
  const [activeTab, setActiveTab] = useState("properties");
  const [showQRCode, setShowQRCode] = useState(false);
  const [currentPropertyId, setCurrentPropertyId] = useState<string | null>(
    null
  );
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [maintenanceIssues, setMaintenanceIssues] = useState<
    MaintenanceIssue[]
  >([]);
  const [archivedIssues, setArchivedIssues] = useState<MaintenanceIssue[]>([]);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState<{
    name: string;
  } | null>(null);
  const [isAddPropertyDialogOpen, setIsAddPropertyDialogOpen] = useState(false);
  const [language, setLanguage] = useState("en");
  const [addPropertyStep, setAddPropertyStep] = useState(1);
  const [activePropertyCard, setActivePropertyCard] = useState<string | null>(
    null
  );
  const [showUpgradeBox, setShowUpgradeBox] = useState(true);
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState<
    "property" | "status" | "title" | "issue"
  >("property");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedPropertyForArchive, setSelectedPropertyForArchive] =
    useState("");
  const [activeEditTab, setActiveEditTab] = useState("general");
  const [isLoading, setIsLoading] = useState(true);
  const [isBtnLoading, setIsBtnLoading] = useState<{ [key: string]: boolean }>({});
  const [error, setError] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<MaintenanceIssue | null>(
    null
  );
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [stripeBlocked, setStripeBlocked] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const searchParams = useSearchParams();
  const MotionCard = motion(Card);

  const sortIssues = useCallback(
    (issues: MaintenanceIssue[]) => {
      return [...issues].sort((a, b) => {
        let aValue: string | undefined;
        let bValue: string | undefined;

        switch (sortColumn) {
          case "property":
            aValue = a.property?.name;
            bValue = b.property?.name;
            break;
          case "status":
            aValue = a.status;
            bValue = b.status;
            break;
          case "title":
            aValue = a.title;
            bValue = b.title;
            break;
          default:
            aValue = a.issue;
            bValue = b.issue;
        }

        if (aValue === undefined) return 1;
        if (bValue === undefined) return -1;

        if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
        if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    },
    [sortColumn, sortDirection]
  );

  const filterIssues = useCallback(
    (issues: MaintenanceIssue[]) => {
      return issues.filter(
        (issue) =>
          (issue.property?.name || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          false ||
          issue.issue.toLowerCase().includes(searchTerm.toLowerCase())
      );
    },
    [searchTerm]
  );

  const sortedActiveIssues = useMemo(
    () => sortIssues(filterIssues(maintenanceIssues)),
    [maintenanceIssues, filterIssues, sortIssues]
  );
  const sortedArchivedIssues = useMemo(() => {
    const filteredIssues = archivedIssues.filter((issue) =>
      selectedPropertyForArchive
        ? issue.property?.name === selectedPropertyForArchive
        : true
    );
    return sortIssues(filterIssues(filteredIssues));
  }, [archivedIssues, selectedPropertyForArchive, filterIssues, sortIssues]);

  const handleSort = (column: "property" | "status" | "title" | "issue") => {
    setSortDirection(
      sortColumn === column && sortDirection === "asc" ? "desc" : "asc"
    );
    setSortColumn(column);
  };
  interface MaintenanceIssue {
    id: string;
    status: string;
    title: string;
    issue: string;
    property?: {
      name: string;
    };
  }

  interface Property {
    id: string;
    wifi: string;
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

  interface Subscription {
    name: string;
    propertyLimit: number;
    price: number;
    currentPeriodEnd: Date;
  }

  interface SubscriptionPlan {
    name: string;
    price: number;
    propertyLimit: number;
    stripeId: string;
  }

  // Define subscription plans
  const subscriptionPlans: SubscriptionPlan[] = [
    {
      name: "basic",
      price: 9.99,
      propertyLimit: 5,
      stripeId: "price_1QkKskBy9Ue4ijcYwlExvrjV",
    },
    {
      name: "pro",
      price: 19.99,
      propertyLimit: 15,
      stripeId: "price_1QkKt1By9Ue4ijcY7uomvOeI",
    },
    {
      name: "enterprise",
      price: 49.99,
      propertyLimit: 50,
      stripeId: "price_1QkKtHBy9Ue4ijcYFk2Emofg",
    },
  ];

  // Effect hooks

  useEffect(() => {
    document.body.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    if (
      currentSubscription?.name &&
      currentSubscription.name !== "Enterprise"
    ) {
      setShowUpgradeBox(true);
    } else {
      setShowUpgradeBox(false);
    }
  }, [currentSubscription]);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (sessionId) {
      fetchSubscription();
    }
  }, [searchParams]);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  useEffect(() => {
    // Check if Stripe is blocked
    const checkStripe = async () => {
      try {
        const stripe = await stripePromise;
        if (!stripe) {
          setStripeBlocked(true);
        }
      } catch (error) {
        console.error("Error loading Stripe:", error);
        setStripeBlocked(true);
      }
    };

    checkStripe();
  }, []);


  console.log('property: ',subscription?.propertyLimit)

  const renderAddPropertyStep = () => {
    switch (addPropertyStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="text-sm font-medium text-emerald-700"
              >
                Property Name
              </Label>
              <Input
                id="name"
                value={newProperty.name}
                onChange={(e) =>
                  setNewProperty({ ...newProperty, name: e.target.value })
                }
                className="w-full border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500"
                placeholder="e.g. Seaside Villa"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="location"
                className="text-sm font-medium text-emerald-700"
              >
                Location
              </Label>
              <Input
                id="location"
                value={newProperty.location}
                onChange={(e) =>
                  setNewProperty({ ...newProperty, location: e.target.value })
                }
                className="w-full border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500"
                placeholder="e.g. 867 Champlin Mountains, Howetown, WI "
              />
            </div>
          </div>
        );
      case 2:
        const cards = [
          {
            id: "houseRules",
            title: "House Rules",
            placeholder: "e.g. No smoking, Quiet hours after 10 PM",
            icon: <Book className="h-4 w-4" />,
          },
          {
            id: "nearbyPlaces",
            title: "Local Attractions",
            placeholder: "e.g. Beach, Restaurants, Shopping",
            icon: <Camera className="h-4 w-4" />,
          },
          {
            id: "emergencyContact",
            title: "Emergency Contact & Other Contacts",
            placeholder: "e.g. +1 (555) 123-4567",
            icon: <Phone className="h-4 w-4" />,
          },
          {
            id: "rubbishAndBins",
            title: "Rubbish & Bins",
            placeholder: "e.g. Collection days, recycling instructions",
            icon: <Trash2 className="h-4 w-4" />,
          },
          {
            id: "applianceGuides",
            title: "Appliance Guides",
            placeholder: "Information for different kind of guides",
            icon: <Trash2 className="h-4 w-4" />,
          },
          {
            id: "wifi",
            title: "WiFi",
            placeholder: "e.g. Network Name: MyWiFi, Password: 12345",
            icon: <Wifi className="h-4 w-4" />,
          },
          {
            id: "localFood",
            title: "Local Food",
            placeholder: "e.g. Italian: Luigis Pizzeria, Sushi: Tokyo Diner",
            icon: <Utensils className="h-4 w-4" />,
          },
          {
            id: "checkOutDay",
            title: "Check-out Day",
            placeholder: "e.g. Sunday at 11:00 AM",
            icon: <CalendarCheck className="h-4 w-4" />,
          },
        ];

        return (
          <div className="space-y-4 max-h-[calc(100vh-8rem)] overflow-y-auto p-4">
            <div className="flex items-center space-x-2 mb-4">
              <Button
                onClick={generateWithAI}
                disabled={
                  isGeneratingAI || !newProperty.name || !newProperty.location
                }
                className="flex-grow bg-emerald-600 hover:bg-emerald-700 text-white text-sm py-2"
              >
                {isGeneratingAI ? "Generating..." : "Generate with AI"}
              </Button>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 text-white bg-emerald-600 hover:bg-emerald-700"
                  >
                    <HelpCircle className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-1">
                    <h4 className="font-medium">Welcome to StayScan!</h4>
                    <p className="text-sm text-muted-foreground">
                      We&apos;re thrilled to have you onboard. Thanks for
                      choosing us to make your hosting life a little easier (and
                      more fun)!
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Before adding your first property, here are two key things
                      to know:
                    </p>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                      <li>
                        <strong>AI-Powered Assistance:</strong> By selecting the
                        &quot;Generate with AI&quot; button, we&apos;ll create
                        basic information for you based on the details we have.
                        We recommend reviewing and customizing it to ensure
                        accuracy and suit your specific listing.
                      </li>
                      <li>
                        <strong>Easy Customization:</strong> You can easily edit
                        each field by tapping on the card and entering your
                        information. Get started now and make your listing
                        shine!
                      </li>
                    </ul>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {cards.map((card) => (
                <Card
                  key={card.id}
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    activePropertyCard === card.id
                      ? "ring-2 ring-emerald-500"
                      : ""
                  }`}
                  onClick={() => setActivePropertyCard(card.id)}
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 py-2">
                    <CardTitle className="text-xs font-medium flex items-center">
                      {card.icon}
                      <span className="ml-2">{card.title}</span>
                    </CardTitle>
                    {newProperty[card.id as keyof typeof newProperty] && (
                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                    )}
                  </CardHeader>
                  <CardContent className="py-2">
                    <Textarea
                      id={card.id}
                      value={
                        newProperty[
                          card.id as keyof typeof newProperty
                        ] as string
                      }
                      onChange={(e) =>
                        setNewProperty({
                          ...newProperty,
                          [card.id]: e.target.value,
                        })
                      }
                      className="w-full text-xs border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500"
                      placeholder={card.placeholder}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-1 gap-3">
              <Card>
                <CardHeader className="py-2">
                  <CardTitle className="text-xs font-medium">
                    Property Image
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-2">
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setNewProperty({ ...newProperty, image: file });
                    }}
                    className="w-full text-xs border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500"
                  />
                  {newProperty.image && (
                    <p className="mt-2 text-xs text-emerald-600">
                      File selected: {newProperty.image.name}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="description"
                className="text-sm font-medium text-emerald-700"
              >
                Welcome Message / Description
              </Label>
              <div className="flex space-x-2">
                <Textarea
                  id="description"
                  value={newProperty.description}
                  onChange={(e) =>
                    setNewProperty({
                      ...newProperty,
                      description: e.target.value,
                    })
                  }
                  className="flex-grow h-32 border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500"
                  placeholder="3-4 words to describe your property and we'll generate a description for you"
                />
                <Button
                  onClick={generateDescription}
                  disabled={isGeneratingDescription}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {isGeneratingDescription ? "Generating..." : "Generate"}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="digitalGuide"
                className="text-sm font-medium text-emerald-700"
              >
                Digital Guide
              </Label>
              <div className="flex space-x-2">
                <Textarea
                  id="digitalGuide"
                  name="digitalGuide"
                  value={newProperty.digitalGuide}
                  onChange={(e) => {
                    const words = e.target.value.trim().split(/\s+/);
                    if (words.length <= 200) {
                      setNewProperty({
                        ...newProperty,
                        digitalGuide: e.target.value,
                      });
                    }
                  }}
                  className="flex-grow h-32 border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500"
                  placeholder="Generate or enter a digital guide for your property (max 200 words)"
                />
                <Button
                  onClick={generateDigitalGuide}
                  disabled={isGeneratingGuide}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {isGeneratingGuide ? "Generating..." : "Generate"}
                </Button>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {newProperty.digitalGuide.trim().split(/\s+/).length}/200 words
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // API call functions
  const createOrUpdateUser = useCallback(async () => {
    try {
      const response = await fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const userData = await response.json();
      console.log("User created/updated:", userData);
    } catch (error) {
      console.error("Error creating/updating user:", error);
      toast({
        title: "Error",
        description:
          "Failed to update user information. Some features may be limited.",
        variant: "destructive",
      });
    }
  }, [user?.id, toast]);

  const generateWithAI = async () => {
    setIsGeneratingAI(true);
    try {
      const response = await fetch("/api/generate-ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newProperty.name,
          location: newProperty.location,
        }),
      });

      // if (!response.ok) {
      //   throw new Error('Failed to generate property details')
      // }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setNewProperty((prev) => ({
        ...prev,
        houseRules: data.houseRules,
        nearbyPlaces: data.nearbyPlaces,
        amenities: data.amenities,
        localFood: data.localFood,
        checkOutDay: data.checkOutDay,
        rubbishAndBins: JSON.stringify(data.rubbishAndBins),
      }));
      toast({
        title: "Success",
        description: "Property details generated successfully!",
        variant: "default",
      });
    } catch (error: any) {
      console.error("Error generating property details:", error);
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const generateDescription = async () => {
    setIsGeneratingDescription(true);
    try {
      const response = await fetch("/api/generate-description", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newProperty.name,
          location: newProperty.location,
          amenities: newProperty.amenities,
          nearbyPlaces: newProperty.nearbyPlaces,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate description");
      }

      const data = await response.json();
      setNewProperty((prev) => ({
        ...prev,
        description: data.generatedDescription,
      }));
      toast({
        title: "Success",
        description: "Property description generated successfully!",
        variant: "default",
      });
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  const getFirstImage = (images: string | string[] | null): string => {
    if (!images) return "/placeholder.jpg";
    if (typeof images === "string") {
      const imageArray = images.split(",");
      return imageArray.length > 0 && imageArray[0].trim() !== ""
        ? imageArray[0].trim()
        : "/placeholder.jpg";
    }
    if (Array.isArray(images)) {
      return images.length > 0 && images[0].trim() !== ""
        ? images[0].trim()
        : "/placeholder.jpg";
    }
    return "/placeholder.jpg";
  };

  const generateDigitalGuide = async () => {
    setIsGeneratingGuide(true);
    try {
      const response = await fetch("/api/generate-guide", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newProperty.name,
          location: newProperty.location,
          description: newProperty.description,
          rubbishAndBins: newProperty.rubbishAndBins,
          amenities: newProperty.amenities,
          nearbyPlaces: newProperty.nearbyPlaces,
          houseRules: newProperty.houseRules,
          applianceGuides: newProperty.applianceGuides,
          wifi: newProperty.wifi, // Add wifi
          localFood: newProperty.localFood, // Add localFood
          emergencyContact: newProperty.emergencyContact, // Add emergencyContact
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate digital guide");
      }

      const data = await response.json();
      setNewProperty((prev) => ({
        ...prev,
        digitalGuide: data.generatedGuide,
      }));
      toast({
        title: "Success",
        description: "Digital guide generated successfully!",
        variant: "default",
      });
    } catch (error) {
      console.error("Error generating digital guide:", error);
      toast({
        title: "Error",
        description: "Failed to generate digital guide. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingGuide(false);
    }
  };

  const fetchProperties = useCallback(async () => {
    try {
      const response = await fetch("/api/properties");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const propertiesData: Property[] = await response.json();
      setProperties(propertiesData);
    } catch (error) {
      console.error("Error fetching properties:", error);
      toast({
        title: "Error",
        description: "Failed to fetch properties. Please try again.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const fetchMaintenanceIssues = useCallback(async () => {
    try {
      const response = await fetch("/api/maintenance-issues");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const issuesData: MaintenanceIssue[] = await response.json();
      setMaintenanceIssues(issuesData);
    } catch (error) {
      console.error("Error fetching maintenance issues:", error);
      toast({
        title: "Error",
        description: "Failed to fetch maintenance issues. Please try again.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const fetchSubscription = useCallback(async () => {
    try {
      const response = await fetch("/api/subscription");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('current subs',data)
      setSubscription(data);
      setCurrentSubscription({ name: data.name }); // Use setCurrentSubscription here
    } catch (error) {
      console.error("Error fetching subscription data:", error);
      toast({
        title: "Error",
        description:
          "Failed to fetch subscription data. Some features may be limited.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await Promise.all([
        createOrUpdateUser(),
        fetchProperties(),
        fetchMaintenanceIssues(),
        fetchSubscription(),
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load some data. Please try refreshing the page.");
    } finally {
      setIsLoading(false);
    }
  }, [
    createOrUpdateUser,
    fetchProperties,
    fetchMaintenanceIssues,
    fetchSubscription,
  ]);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchData();
    } else if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
      setError("You must be signed in to view this page.");
    }
  }, [isLoaded, isSignedIn, fetchData, router]);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (sessionId) {
      fetchSubscription();
    }
  }, [searchParams, fetchSubscription]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  // CRUD operations for properties
  const addProperty = async () => {
    if (
      newProperty.name &&
      newProperty.location &&
      subscription &&
      properties.length < subscription.propertyLimit
    ) {
      try {
        setUploadingImage(true);
        let imageUrl = "";

        if (newProperty.image) {
          const imageBlob = await put(
            newProperty.image.name,
            newProperty.image,
            {
              access: "public",
              token: process.env.NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN,
            }
          );
          imageUrl = imageBlob.url;
        }

        const propertyData = {
          ...newProperty,
          images: imageUrl,
        };

        const response = await fetch("/api/properties", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(propertyData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            `HTTP error! status: ${response.status}, message: ${
              errorData.message || "Unknown error"
            }`
          );
        }

        const addedProperty = await response.json();
        console.log("Property added:", addedProperty);
        setProperties((prevProperties) => [...prevProperties, addedProperty]);
        setNewProperty({
          name: "",
          location: "",
          description: "",
          wifi: "",
          localFood: "",
          applianceGuides: "",
          rubbishAndBins: "",
          amenities: "",
          images: "",
          status: "inactive",
          qrScans: 0,
          image: null,
          emergencyContact: "",
          nearbyPlaces: "",
          checkOutDay: "",
          houseRules: "",
          digitalGuide: "",
        });
        toast({
          title: "Success",
          description: "Property added successfully!",
          variant: "default",
        });
        setIsAddPropertyDialogOpen(false); // Close the dialog
        setAddPropertyStep(1); // Reset the step to 1 for the next time the dialog is opened
      } catch (error) {
        console.error("Error adding property:", error);
        toast({
          title: "Error",
          description: `Failed to add property: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
          variant: "destructive",
        });
      } finally {
        setUploadingImage(false);
      }
    } else if (
      subscription &&
      properties.length >= subscription.propertyLimit
    ) {
      toast({
        title: "Property limit reached",
        description:
          "You've reached your property limit. Please upgrade your subscription to add more properties.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Incomplete information",
        description:
          "Please fill in all required fields (name, location, price).",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (property: Property) => {
    setSelectedProperty(property);
    setIsEditDialogOpen(true);
  };

  const handleQRCode = (propertyId: string) => {
    setCurrentPropertyId(propertyId);
    setShowQRCode(true);
  };

  const updateProperty = async (updatedProperty: Property) => {
    console.log("Updating property:", updatedProperty); // Add this line for debugging
    try {
      const response = await fetch(`/api/properties/${updatedProperty.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedProperty),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${
            errorData.message || "Unknown error"
          }`
        );
      }

      const updatedPropertyData = await response.json();
      console.log("Updated property data:", updatedPropertyData); // Add this line for debugging
      setProperties((prevProperties) =>
        prevProperties.map((prop) =>
          prop.id === updatedPropertyData.id ? updatedPropertyData : prop
        )
      );
      toast({
        title: "Success",
        description: "Property updated successfully!",
        variant: "default",
      });
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating property:", error);
      toast({
        title: "Error",
        description: `Failed to update property: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        variant: "destructive",
      });
    }
  };

  const deleteProperty = async (propertyId: string) => {
    try {
      const response = await fetch(`/api/properties/${propertyId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${
            errorData.message || "Unknown error"
          }`
        );
      }

      setProperties((prevProperties) =>
        prevProperties.filter((p) => p.id !== propertyId)
      );
      toast({
        title: "Success",
        description: "Property deleted successfully.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error deleting property:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to delete property. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Maintenance issue handling
  const updateMaintenanceStatus = async (
    issueId: string,
    newStatus: string
  ) => {
    try {
      const response = await fetch(`/api/maintenance-issues/${issueId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedIssue: MaintenanceIssue = await response.json();

      if (newStatus === "Resolved") {
        setMaintenanceIssues((prevIssues) =>
          prevIssues.filter((issue) => issue.id !== issueId)
        );
        setArchivedIssues((prevIssues) => [...prevIssues, updatedIssue]);
      } else {
        setMaintenanceIssues((prevIssues) =>
          prevIssues.map((issue) =>
            issue.id === issueId ? updatedIssue : issue
          )
        );
      }
    } catch (error) {
      console.error("Error updating maintenance status:", error);
      toast({
        title: "Error",
        description: "Failed to update maintenance status. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Subscription handling
  const handleSubscription = async (plan: SubscriptionPlan) => {

    try {
      setIsBtnLoading(prev=> ({ ...prev, [plan.name]: true }));
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId: plan.stripeId,
          propertyLimit: plan.propertyLimit
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const { url } = await response.json();

      if (url) {
        setShowUpgradeDialog(false);
        setShowSubscriptionDialog(false);
        window.location.href = url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error) {
      console.error("Error handling subscription:", error);
      toast({
        title: "Error",
        description: "Failed to process subscription. Please try again.",
        variant: "destructive",
      });
    } finally{
      setIsBtnLoading(prev=> ({ ...prev, [plan.name]: false }));
    }
  };

  // UI helper functions
  const tabItems = [
    { value: "general", icon: <Home className="w-4 h-4" />, label: "General" },
    {
      value: "amenities",
      icon: <Utensils className="w-4 h-4" />,
      label: "Amenities",
    },
    { value: "rules", icon: <Info className="w-4 h-4" />, label: "Rules" },
    { value: "nearby", icon: <MapPin className="w-4 h-4" />, label: "Nearby" },
    {
      value: "additional",
      icon: <Wifi className="w-4 h-4" />,
      label: "Additional",
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Open":
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case "In Progress":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "Resolved":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return null;
    }
  };

  // Navigation functions

  const handleViewPage = (propertyId: string) => {
    window.open(`/listing/${propertyId}`, "_blank", "noopener,noreferrer");
  };

  const getStatusVariant = (
    status: string
  ): "destructive" | "default" | "outline" => {
    switch (status) {
      case "Open":
        return "destructive";
      case "In Progress":
        return "default";
      case "Resolved":
        return "outline";
      default:
        return "default";
    }
  };
  // Sub-components
  const QRCodeDialog = ({ propertyId }: { propertyId: string | null }) => {
    const property = properties.find((p) => p.id === propertyId);
    const [qrCodeData, setQrCodeData] = useState("");

    useEffect(() => {
      if (property) {
        QRCode.toDataURL(`https://stayscan.tech/listing/${property.id}`)
          .then((url) => setQrCodeData(url))
          .catch((err) => console.error(err));
      }
    }, [property]);



  //   <div class="container">
  //   <h1>${property.name}</h1>
  //   <img src="${qrCodeData}" alt="QR Code for ${property.name}" />
  //   <p>Scan this QR code to access property information</p>
  //   <div class="guide">
  //     <strong>Digital Guide:</strong>
  //     ${property.digitalGuide}
  //   </div>
  // </div>

    // QR Code functions
    const handlePrint = () => {
      if (!property) return;

      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
                  <html>
                    <head>
                      <title>Print QR Code - ${property.name}</title>
                      <style>


                        body {
                          margin: 0; padding: 0;
                          font-family: Arial, sans-serif;
                          background: white;
                          min-height: 100vh; display: flex;
                          justify-content: center; align-items: center;
                        }

                       

                          .step-indicator {
                                background-color: #059669;
                            }


                        * {
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                            color-adjust: exact !important;
                        }

                        @media print {
                            body {
                                background: white !important;
                                -webkit-print-color-adjust: exact !important;
                                print-color-adjust: exact !important;
                                color-adjust: exact !important;
                            }

                            .step-indicator {
                                background-color: #059669 !important;
                            }


                            .card-container {
                                background-color: white !important;
                            }

                            @page {
                                margin: 20mm;
                            }
                        }


                      </style>
                    </head>
                    <body>
                          <div class="card-container" style="width: 100%; max-width: 500px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); padding: 24px; margin: 20px;">
                                      <!-- Header Section -->
                                      <div style="text-align: center; margin-bottom: 24px;">
                                          <h1 style="color: #047857; font-size: 30px; font-weight: bold; margin: 0 0 8px 0;">SCAN ME NOW</h1>
                                          
                                          <!-- Underline Decoration -->
                                          <hr style="width: 22%; border: 1px solid #047857;" />
                                          
                                          <h2 style="color: #047857; font-size: 20px; margin: 0 0 4px 0; text-transform: capitalize">${property.name}</h2>
                                          <p style="color: #10b981; font-size: 14px; margin: 0 0 8px 0;">Your Digital Guide Awaits</p>
                                          
                                          <!-- Navigation Links -->
                                          <div style="color: #6b7280; font-size: 14px;">
                                              <span>WiFi Access</span>
                                              <span style="margin: 0 4px;">•</span>
                                              <span>House Rules</span>
                                              <span style="margin: 0 4px;">•</span>
                                              <span>Local Attractions</span>
                                              <span style="margin: 0 4px;">•</span>
                                              <span>More</span>
                                          </div>
                                      </div>

                                      <!-- QR Code Container -->
                                      <div style="background-color: white; border: 1px solid #e5e7eb; border-radius: 8px; margin: 0 auto 16px auto; width: 80%;">
                                          <img src=${qrCodeData} alt="QR Code for ${property.name}" style="width: 100%; aspect-ratio: 1; display: block; border-radius: 8px;">
                                      </div>


                                      <!-- Step Indicators -->
                                     <div style="display: flex; justify-content: center; gap: 32px; margin-bottom: 16px;">
                                        <div style="display: flex; align-items: center; flex-direction: column;">
                                          <div class="step-indicator" style="width: 32px; height: 32px; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px;">1</div>
                                          <p style="font-size: 12px;">Open your camera</p>
                                        </div>
                                        <div style="display: flex; align-items: center; flex-direction: column;">
                                                  <div class="step-indicator" style="width: 32px; height: 32px; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px;">2</div>
                                          <p style="font-size: 12px">Scan QR code</p>
                                        </div>
                                        <div style="display: flex; align-items: center; flex-direction: column;">
                                                    <div class="step-indicator" style="width: 32px; height: 32px; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px;">3</div>
                                          <p style="font-size: 12px">Access guide</p>
                                        </div>
                                      </div>

                                      <!-- Footer -->
                                      <div style="text-align: center; color: #9ca3af; font-size: 12px; display: flex; justify-content: center; align-items: center; gap: 3px">
                                          <div>Powered by</div> <img style="height: 20px; width: 20px; border-radius: 100%;" src="https://www.stayscan.tech/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fstayscan-logo.f00faa81.jpg&w=1920&q=75" alt="logo" /> <div>Stayscan.tech</div>
                                      </div>
                                  </div>
                    </body>
                  </html>
                `);
        printWindow.document.close();
        printWindow.print();
      }
    };

    const handleDownload = () => {
      if (!property || !qrCodeData) return;

      const link = document.createElement("a");
      link.href = qrCodeData;
      link.download = `${property.name
        .replace(/\s+/g, "-")
        .toLowerCase()}-qr-code.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    if (!property) return null;


    return (
      <Dialog open={showQRCode} onOpenChange={setShowQRCode}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-emerald-700">
              QR Code for {property.name}
            </DialogTitle>
            <DialogDescription className="text-emerald-600">
              Scan this QR code to access the property page.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-6">
            <div className="w-64 h-64 bg-emerald-50 flex items-center justify-center rounded-lg border-2 border-emerald-200 shadow-lg">
              {qrCodeData && (
                <img
                  src={qrCodeData}
                  alt={`QR Code for ${property.name}`}
                  className="w-full h-full"
                />
              )}
            </div>
            <div className="flex space-x-4">
              <Button
                onClick={handlePrint}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Printer className="mr-2 h-4 w-4" />
                Print QR Code
              </Button>
              <Button
                onClick={handleDownload}
                variant="outline"
                className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  const MaintenanceTable = ({
    issues,
    isArchived,
  }: {
    issues: MaintenanceIssue[];
    isArchived: boolean;
  }) => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Input
          placeholder="Search issues..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm text-black"
        />
        {isArchived && (
          <Select
            value={selectedPropertyForArchive}
            onValueChange={setSelectedPropertyForArchive}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select Property" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-properties">All Properties</SelectItem>
              {properties.map((property) => (
                <SelectItem key={property.id} value={property.name}>
                  {property.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-emerald-50 to-teal-50">
              <TableHead className="py-3 px-4">
                <Button
                  variant="ghost"
                  onClick={() => handleSort("property")}
                  className="hover:text-emerald-700 transition-colors duration-200"
                >
                  <span className="font-semibold text-emerald-800">
                    Property
                  </span>
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="py-3 px-4">
                <span className="font-semibold text-emerald-800">Issue</span>
              </TableHead>
              <TableHead className="py-3 px-4">
                <Button
                  variant="ghost"
                  onClick={() => setSortColumn("status")}
                  className="hover:text-emerald-700 transition-colors duration-200"
                >
                  <span className="font-semibold text-emerald-800">Status</span>
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="py-3 px-4">
                <span className="font-semibold text-emerald-800">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {issues.map((issue) => (
              <TableRow
                key={issue.id}
                className="border-b border-emerald-100 hover:bg-emerald-50 transition-colors duration-200"
              >
                <TableCell className="py-4 px-4 font-medium text-emerald-700">
                  {issue.property ? issue.property.name : "Unknown Property"}
                </TableCell>
                <TableCell className="py-4 px-4 text-emerald-600">
                  {issue.title}
                </TableCell>
                <TableCell className="py-4 px-4">
                  <Badge
                    variant={
                      issue.status === "Open"
                        ? "destructive"
                        : issue.status === "In Progress"
                        ? "default"
                        : "outline"
                    }
                    className="flex items-center space-x-1 px-2 py-1 text-xs font-semibold rounded-full"
                  >
                    {getStatusIcon(issue.status)}
                    <span>{issue.status}</span>
                  </Badge>
                </TableCell>
                <TableCell className="py-4 px-4">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center space-x-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                      onClick={() => {
                        /* Handle view action */
                      }}
                    >
                      <Info className="h-4 w-4" />
                      <span>View</span>
                    </Button>
                    {!isArchived && (
                      <Select
                        value={issue.status}
                        onValueChange={(value) =>
                          updateMaintenanceStatus(issue.id, value)
                        }
                      >
                        <SelectTrigger className="w-[140px] bg-white border-emerald-200 text-emerald-700 text-sm">
                          <SelectValue placeholder="Update Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Open">Open</SelectItem>
                          <SelectItem value="In Progress">
                            In Progress
                          </SelectItem>
                          <SelectItem value="Resolved">Resolved</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );

  // Main component return
  return (
    <div
      className={`flex h-screen bg-gradient-to-br from-${
        colors.oxfordBlue
      } to-${colors.black} ${isDarkMode ? "dark" : ""}`}
      style={{ fontFamily: "SF Pro Display, sans-serif" }}
    >
      {/* Maintenance Issue Details Dialog */}
      <Dialog
        open={!!selectedIssue}
        onOpenChange={() => setSelectedIssue(null)}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-emerald-700">
              Maintenance Issue Details
            </DialogTitle>
          </DialogHeader>
          {selectedIssue && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">Title</h3>
                <p>{selectedIssue.title}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Description</h3>
                <p>{selectedIssue.issue}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Property</h3>
                <p>
                  {selectedIssue.property
                    ? selectedIssue.property.name
                    : "Unknown Property"}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Status</h3>
                <Badge
                  variant={getStatusVariant(selectedIssue.status)}
                  className="flex items-center space-x-1"
                >
                  {getStatusIcon(selectedIssue.status)}
                  <span>{selectedIssue.status}</span>
                </Badge>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Sidebar */}
      <div className="flex">
        <TooltipProvider>
          <motion.aside
            initial={{ width: isSidebarExpanded ? 300 : 100 }}
            animate={{ width: isSidebarExpanded ? 300 : 100 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="bg-gradient-to-b from-[#086241] to-[#1e3932] flex flex-col h-screen relative rounded-r-3xl shadow-2xl"
          >
            {/* Sidebar Header */}
            <div className="flex h-28 items-center justify-center px-6">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="flex items-center space-x-3 bg-[#d4e9e2] bg-opacity-20 rounded-2xl p-4 backdrop-blur-sm"
              >
                <QrCode className="h-8 w-8 text-[#dff9ba]" />
                {isSidebarExpanded && (
                  <motion.span
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="font-bold text-xl text-[#d4e9e2]"
                  >
                    StayScan
                  </motion.span>
                )}
              </motion.div>
            </div>
            {/* Sidebar Navigation */}
            <nav className="flex-1 space-y-3 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-[#1e3932] scrollbar-track-[#086241]">
              {["properties", "maintenance", "settings"].map((tab) => (
                <Tooltip key={tab}>
                  <TooltipTrigger asChild>
                    <Button
                      variant={activeTab === tab ? "secondary" : "ghost"}
                      className={`w-full justify-${
                        isSidebarExpanded ? "start" : "center"
                      } rounded-xl py-6 hover:bg-[#1e3932] hover:bg-opacity-70 text-[#d4e9e2] hover:text-[#dff9ba] transition-all duration-200 ${
                        activeTab === tab
                          ? "bg-[#1e3932] bg-opacity-70 text-[#dff9ba] shadow-lg"
                          : ""
                      }`}
                      onClick={() => setActiveTab(tab)}
                    >
                      {tab === "properties" && <Home className="h-5 w-5" />}
                      {tab === "maintenance" && <Wrench className="h-5 w-5" />}
                      {tab === "settings" && <Settings className="h-5 w-5" />}
                      {isSidebarExpanded && (
                        <motion.span
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3 }}
                          className="ml-3 capitalize text-base"
                        >
                          {tab}
                        </motion.span>
                      )}
                    </Button>
                  </TooltipTrigger>
                  {!isSidebarExpanded && (
                    <TooltipContent side="right" className="capitalize">
                      {tab}
                    </TooltipContent>
                  )}
                </Tooltip>
              ))}
            </nav>
            {/* Sidebar Footer */}
            <div className="p-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="flex items-center bg-[#1e3932] bg-opacity-50 rounded-xl p-4 backdrop-blur-sm"
              >
                <UserButton afterSignOutUrl="/" />
                {isSidebarExpanded && user && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="ml-3"
                  >
                    <p className="text-sm font-medium text-[#d4e9e2]">
                      {user.fullName}
                    </p>
                    <p className="text-xs text-[#dff9ba]">
                      {user.primaryEmailAddress?.emailAddress}
                    </p>
                  </motion.div>
                )}
              </motion.div>
            </div>
            {/* Sidebar Expand/Collapse Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-1/2 -right-5 transform -translate-y-1/2 bg-[#1e3932] bg-opacity-70 text-[#d4e9e2] hover:bg-[#dff9ba] hover:text-[#086241] rounded-full shadow-lg transition-all duration-200 backdrop-blur-sm"
                  onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
                >
                  {isSidebarExpanded ? (
                    <ChevronLeft className="h-5 w-5" />
                  ) : (
                    <ChevronRight className="h-5 w-5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                {isSidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}
              </TooltipContent>
            </Tooltip>
          </motion.aside>
        </TooltipProvider>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-white">
        <div className="container mx-auto p-6">
          <AnimatePresence mode="wait">
            {/* Properties Tab */}
            {activeTab === "properties" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="container mx-auto px-4 py-8"
              >
                <div className="mb-8 flex justify-between items-center">
                  <h2 className="text-3xl font-semibold text-gray-800 flex items-center">
                    <Building2 className="mr-3 h-8 w-8 text-emerald-600" />
                    Your Properties
                  </h2>
                  <Dialog
                    open={isAddPropertyDialogOpen}
                    onOpenChange={setIsAddPropertyDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        className="mb-4"
                        disabled={
                          properties.length >=
                          (subscription?.propertyLimit ?? 0)
                        }
                        onClick={() => setIsAddPropertyDialogOpen(true)}
                      >
                        Add Property
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[900px]">
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-semibold text-emerald-800">
                          Add New Property
                        </DialogTitle>
                        <DialogDescription className="text-emerald-600">
                          Enter the details of your new property below. Step{" "}
                          {addPropertyStep} of 3
                        </DialogDescription>
                      </DialogHeader>
                      {renderAddPropertyStep()}
                      <DialogFooter>
                        {addPropertyStep > 1 && (
                          <Button
                            variant="outline"
                            onClick={() =>
                              setAddPropertyStep(addPropertyStep - 1)
                            }
                            className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                          >
                            Back
                          </Button>
                        )}
                        {addPropertyStep < 3 ? (
                          <Button
                            onClick={() =>
                              setAddPropertyStep(addPropertyStep + 1)
                            }
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                            disabled={
                              addPropertyStep === 1 &&
                              (!newProperty.name || !newProperty.location)
                            }
                          >
                            Continue
                          </Button>
                        ) : (
                          <Button
                            onClick={addProperty}
                            disabled={
                              uploadingImage ||
                              !newProperty.name ||
                              !newProperty.location ||
                              !newProperty.description
                            }
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            {uploadingImage ? "Uploading..." : "Add Property"}
                          </Button>
                        )}
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                <AnimatePresence>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {properties.map((property) => (
                      <motion.div
                        key={property.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                          <div className="relative h-48">
                            <img
                              src={getFirstImage(property.images)}
                              alt={property.name}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <div className="absolute bottom-3 left-3 text-white">
                              <h3 className="font-semibold text-lg">
                                {property.name}
                              </h3>
                              <p className="text-sm flex items-center mt-1 text-gray-200">
                                <MapPin className="w-4 h-4 mr-1" />
                                {property.location}
                              </p>
                            </div>
                          </div>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-center mb-3">
                              <Badge
                                variant={
                                  property.status === "active"
                                    ? "default"
                                    : "secondary"
                                }
                                className="capitalize"
                              >
                                {property.status}
                              </Badge>
                              <span className="text-sm text-gray-500">
                                {property.qrScans} scans
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                              {property.description}
                            </p>
                            <div className="flex flex-wrap gap-2 mb-3"></div>
                            <div className="flex justify-between items-center">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-gray-600 hover:text-gray-900"
                                  >
                                    <MoreHorizontal className="h-5 w-5" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="end"
                                  className="w-48"
                                >
                                  <DropdownMenuItem
                                    onClick={() => handleEdit(property)}
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    <span>Edit</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleQRCode(property.id)}
                                  >
                                    <QrCode className="mr-2 h-4 w-4" />
                                    <span>QR Code</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onSelect={(event) => {
                                      event.preventDefault();
                                      handleViewPage(property.id);
                                    }}
                                  >
                                    <ExternalLink className="mr-2 h-4 w-4" />
                                    <span>View Page</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => deleteProperty(property.id)}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    <span>Delete</span>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </AnimatePresence>
              </motion.div>
            )}

            {/* Maintenance Tab */}
            {activeTab === "maintenance" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 shadow-lg">
                  <CardHeader className="border-b border-emerald-100">
                    <CardTitle className="text-2xl font-bold text-emerald-800">
                      Maintenance Issues
                    </CardTitle>
                    <p className="text-emerald-600">
                      Manage and track maintenance issues across all properties.
                    </p>
                  </CardHeader>
                  <CardContent className="p-6">
                    <Tabs defaultValue="active" className="w-full">
                      <TabsList className="grid w-full grid-cols-2 mb-6">
                        <TabsTrigger
                          value="active"
                          className="text-emerald-700"
                        >
                          Active Issues
                        </TabsTrigger>
                        <TabsTrigger
                          value="archived"
                          className="text-emerald-700"
                        >
                          Archived Issues
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent value="active">
                        <MaintenanceTable
                          issues={sortedActiveIssues}
                          isArchived={false}
                        />
                      </TabsContent>
                      <TabsContent value="archived">
                        <MaintenanceTable
                          issues={sortedArchivedIssues}
                          isArchived={true}
                        />
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Settings Tab */}
            {activeTab === "settings" && (
              <motion.div
                key="settings"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-8"
              >
                <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-2xl font-bold text-emerald-800">
                      Account Settings
                    </CardTitle>
                    <CardDescription className="text-emerald-600">
                      Manage your account preferences and subscription details.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* User Profile Card */}
                    <MotionCard
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      transition={{ duration: 0.5, delay: 0.1 }}
                      className="col-span-1 md:col-span-2 lg:col-span-3"
                    >
                      <CardContent className="p-6 flex items-center space-x-4">
                        <Avatar className="h-20 w-20">
                          <AvatarImage
                            src={user?.imageUrl}
                            alt={user?.fullName ?? "User avatar"}
                          />
                          <AvatarFallback>{user?.fullName?.[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="text-2xl font-semibold text-white">
                            {user?.fullName}
                          </h3>
                          <p className="text-white">
                            {user?.primaryEmailAddress?.emailAddress}
                          </p>
                        </div>
                      </CardContent>
                    </MotionCard>

                    {/* Subscription Information */}
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-emerald-700">
                        Subscription Information
                      </h3>
                      {subscription ? (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-emerald-600">
                              Current Plan
                            </Label>
                            <div className="text-white bg-black border rounded p-2 w-full">
                              {subscription.name}
                            </div>
                          </div>
                          <div>
                            <Label className="text-emerald-600">Price</Label>
                            <div className="text-white bg-black border rounded p-2 w-full">{`$${subscription.price}/month`}</div>
                          </div>
                          <div>
                            <Label className="text-emerald-600">
                              Property Limit
                            </Label>
                            <div className="text-white bg-black border rounded p-2 w-full">
                              {subscription.propertyLimit}
                            </div>
                          </div>
                          <div>
                            <Label className="text-emerald-600">
                              Next Billing Date
                            </Label>
                            <div className="text-white bg-black border rounded p-2 w-full">
                              {new Date(
                                subscription.currentPeriodEnd
                              ).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-emerald-600">
                          No active subscription found.
                        </p>
                      )}
                      <Button
                        onClick={() => setShowSubscriptionDialog(true)}
                        className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        Manage Subscription
                      </Button>
                    </div>

                    {/* Preferences */}
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-emerald-700">
                        Preferences
                      </h3>
                      {/* <div className="flex items-center justify-between">
                        <Label htmlFor="darkMode" className="text-emerald-600">Dark Mode</Label>
                        <Switch
                          id="darkMode"
                          checked={isDarkMode}
                          onCheckedChange={setIsDarkMode}
                        />
                      </div> */}
                      <div className="flex items-center justify-between">
                        <Label htmlFor="language" className="text-emerald-600">
                          Language
                        </Label>
                        <Select value={language} onValueChange={setLanguage}>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select a language" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="es">Español</SelectItem>
                            <SelectItem value="fr">Français</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Subscription Dialog */}
      <Dialog
        open={showSubscriptionDialog}
        onOpenChange={setShowSubscriptionDialog}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-emerald-700">
              Manage Subscription
            </DialogTitle>
            <DialogDescription className="text-emerald-600">
              Choose a plan that best fits your needs.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {subscriptionPlans.map((plan) => (
              <Card
                key={plan.name}
                className={`${
                  currentSubscription?.name === plan.name
                    ? "border-emerald-500"
                    : "border-gray-200"
                } transition-all duration-300 hover:shadow-md`}
              >
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-emerald-700 capitalize">
                    {plan.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-emerald-600">
                    ${plan.price}
                    <span className="text-base font-normal text-gray-400">
                      /month
                    </span>
                  </p>
                  <p className="mt-2 text-gray-400">
                    Up to {plan.propertyLimit} properties
                  </p>
                </CardContent>
                <CardFooter>
                  {currentSubscription?.name === plan.name ? (
                    <Button
                      disabled
                      className="w-full bg-emerald-100 text-emerald-700"
                    >
                      Current Plan
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleSubscription(plan)}
                      disabled={isBtnLoading[plan.name]}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-75 disabled:cursor-not-allowed"
                    >
                      {/* {currentSubscription
                        ? "Switch to this plan"
                        : "Select this plan"} */}
                        {isBtnLoading[plan.name] ? <BtnSpinner height="15px" width="15px" /> : 'Switch to this plan'}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* QR Code Dialog */}
      <QRCodeDialog propertyId={currentPropertyId} />

      {/* Edit Property Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-emerald-700">
              Edit Property
            </DialogTitle>
            <DialogDescription className="text-emerald-600">
              Make changes to your property information.
            </DialogDescription>
          </DialogHeader>
          {selectedProperty && (
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                {tabItems.map((item) => (
                  <TabsTrigger
                    key={item.value}
                    value={item.value}
                    onClick={() => setActiveEditTab(item.value)}
                    className={`flex items-center justify-center space-x-2 ${
                      activeEditTab === item.value
                        ? "bg-emerald-100 text-emerald-700"
                        : "text-gray-600"
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
              <TabsContent value="general">
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="edit-name"
                      className="text-sm font-medium text-gray-700"
                    >
                      Property Name
                    </Label>
                    <Input
                      id="edit-name"
                      value={selectedProperty.name}
                      onChange={(e) =>
                        setSelectedProperty({
                          ...selectedProperty,
                          name: e.target.value,
                        })
                      }
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="edit-location"
                      className="text-sm font-medium text-gray-700"
                    >
                      Location
                    </Label>
                    <Input
                      id="edit-location"
                      value={selectedProperty.location}
                      onChange={(e) =>
                        setSelectedProperty({
                          ...selectedProperty,
                          location: e.target.value,
                        })
                      }
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="edit-description"
                      className="text-sm font-medium text-gray-700"
                    >
                      Description
                    </Label>
                    <Textarea
                      id="edit-description"
                      value={selectedProperty.description}
                      onChange={(e) =>
                        setSelectedProperty({
                          ...selectedProperty,
                          description: e.target.value,
                        })
                      }
                      className="w-full"
                    />
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="amenities">
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="edit-amenities"
                      className="text-sm font-medium text-gray-700"
                    >
                      Amenities
                    </Label>
                    <Textarea
                      id="edit-amenities"
                      value={selectedProperty.amenities}
                      onChange={(e) =>
                        setSelectedProperty({
                          ...selectedProperty,
                          amenities: e.target.value,
                        })
                      }
                      className="w-full"
                      placeholder="e.g. WiFi, Pool, Parking (comma-separated)"
                    />
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="rules">
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="edit-rules"
                      className="text-sm font-medium text-gray-700"
                    >
                      House Rules
                    </Label>
                    <Textarea
                      id="edit-rules"
                      value={selectedProperty.houseRules}
                      onChange={(e) =>
                        setSelectedProperty({
                          ...selectedProperty,
                          houseRules: e.target.value,
                        })
                      }
                      className="w-full"
                      placeholder="e.g. No smoking, Quiet hours after 10 PM"
                    />
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="nearby">
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="edit-nearby"
                      className="text-sm font-medium text-gray-700"
                    >
                      Nearby Attractions
                    </Label>
                    <Textarea
                      id="edit-nearby"
                      value={selectedProperty.nearbyPlaces}
                      onChange={(e) =>
                        setSelectedProperty({
                          ...selectedProperty,
                          nearbyPlaces: e.target.value,
                        })
                      }
                      className="w-full"
                      placeholder="e.g. Beach (0.5 miles), Downtown (2 miles)"
                    />
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="additional">
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="edit-wifi"
                      className="text-sm font-medium text-gray-700"
                    >
                      WiFi Information
                    </Label>
                    <Textarea
                      id="edit-wifi"
                      value={selectedProperty.wifi}
                      onChange={(e) =>
                        setSelectedProperty({
                          ...selectedProperty,
                          wifi: e.target.value,
                        })
                      }
                      className="w-full"
                      placeholder="e.g. Network Name: MyWiFi, Password: 12345"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="edit-emergency"
                      className="text-sm font-medium text-gray-700"
                    >
                      Emergency Contact & Other Contacts
                    </Label>
                    <Input
                      id="edit-emergency"
                      value={selectedProperty.emergencyContact}
                      onChange={(e) =>
                        setSelectedProperty({
                          ...selectedProperty,
                          emergencyContact: e.target.value,
                        })
                      }
                      className="w-full"
                      placeholder="e.g. +1 (555) 123-4567"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="edit-rubbish"
                      className="text-sm font-medium text-gray-700"
                    >
                      Rubbish And Bins
                    </Label>
                    <Textarea
                      id="edit-rubbishAndBins"
                      value={selectedProperty.rubbishAndBins}
                      onChange={(e) =>
                        setSelectedProperty({
                          ...selectedProperty,
                          rubbishAndBins: e.target.value,
                        })
                      }
                      className="w-full"
                      placeholder="e.g. Collection days, recycling instructions"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="edit-local-food"
                      className="text-sm font-medium text-gray-700"
                    >
                      Local Food
                    </Label>
                    <Textarea
                      id="edit-local-food"
                      value={selectedProperty.localFood}
                      onChange={(e) =>
                        setSelectedProperty({
                          ...selectedProperty,
                          localFood: e.target.value,
                        })
                      }
                      className="w-full"
                      placeholder="e.g. Italian: Luigis Pizzeria, Sushi: Tokyo Diner"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="edit-checkout"
                      className="text-sm font-medium text-gray-700"
                    >
                      Check-out Day
                    </Label>
                    <Input
                      id="edit-checkout"
                      value={selectedProperty.checkOutDay}
                      onChange={(e) =>
                        setSelectedProperty({
                          ...selectedProperty,
                          checkOutDay: e.target.value,
                        })
                      }
                      className="w-full"
                      placeholder="e.g. Sunday at 11:00 AM"
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
          <DialogFooter>
            <Button
              onClick={() => {
                if (selectedProperty) {
                  updateProperty(selectedProperty);
                  setIsEditDialogOpen(false);
                }
              }}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upgrade Subscription Dialog */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-emerald-700">
              Upgrade Your Subscription
            </DialogTitle>
            <DialogDescription className="text-emerald-600">
              Unlock more features and increase your property limit.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {subscriptionPlans.map((plan) => (
              <Card
                key={plan.name}
                className={`${
                  currentSubscription?.name === plan.name
                    ? "border-emerald-500"
                    : "border-gray-200"
                } transition-all duration-300 hover:shadow-md`}
              >
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-emerald-700">
                    {plan.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-emerald-600">
                    ${plan.price}
                    <span className="text-base font-normal text-gray-500">
                      /month
                    </span>
                  </p>
                  <p className="mt-2 text-gray-600">
                    Up to {plan.propertyLimit} properties
                  </p>
                </CardContent>
                <CardFooter>
                  {currentSubscription?.name === plan.name ? (
                    <Button
                      disabled
                      className="w-full bg-emerald-100 text-emerald-700"
                    >
                      Current Plan
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleSubscription(plan)}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      Upgrade to {plan.name}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {showUpgradeBox &&
        currentSubscription &&
        currentSubscription.name !== "Enterprise" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-4 right-4 bg-gradient-to-b from-[#086241] to-[#1e3932] text-white p-4 rounded-lg shadow-lg max-w-sm"
          >
            <button
              onClick={() => setShowUpgradeBox(false)}
              className="absolute top-2 right-2 text-white/80 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
            <h3 className="text-lg font-semibold mb-2">
              Upgrade to Enterprise
            </h3>
            <p className="text-sm mb-3 text-white/90">
              Unlock unlimited properties and premium features.
            </p>
            <Button
              onClick={() => setShowSubscriptionDialog(true)}
              className="w-full bg-white text-[#086241] hover:bg-green-50 hover:text-black transition-colors"
              variant="outline"
            >
              <Zap className="mr-2 h-4 w-4" />
              Upgrade Now
            </Button>
          </motion.div>
        )}
      {/* Stripe Blocked Alert */}
      {stripeBlocked && (
        <div className="fixed bottom-4 right-4 z-50">
          <Alert variant="destructive">
            <AlertTitle className="text-red-800">Stripe Blocked</AlertTitle>
            <AlertDescription className="text-red-700">
              It appears that Stripe is being blocked. This may interfere with
              subscription management. Please disable any ad blockers or
              security extensions for this site.
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
}
