"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Image from "next/image";
import {
  Wifi,
  CalendarCheck,
  Trash2,
  MapPin,
  Book,
  Utensils,
  Camera,
  Phone,
  Lightbulb,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { processText } from "@/lib/utils";
import logo from "../../../assets/images/stayscan-logo.jpg";

interface Property {
  id: string;
  name: string;
  location: string;
  images: string;
  description: string;
  wifi: { name: string; password: string };
  houseRules: string;
  applianceGuides: string;
  checkOutDay: string;
  emergencyContact: string;
  rubbishAndBins: string;
  nearbyPlaces: { name: string; description: string; distance: string }[];
  reviews: { author: string; rating: number; comment: string }[];
  digitalGuide: string;
  localFood: string;
  isAuth: boolean;
}

interface MaintenanceIssue {
  id: string;
  title: string;
  issue: string;
  status: "Open" | "In Progress" | "Resolved";
}

type CategoryContent =
  | string
  | { name: string; instructions: string; fileUrl: string }[]
  | { name: string; description: string; distance: string }[]
  | { name: string; password: string }
  | { checkOutTime: string; instructions: string }
  | string[];

interface Category {
  name: string;
  icon: React.ElementType;
  content: CategoryContent;
}

export default function PropertyInfoPage() {
  const { id } = useParams() as { id: string };
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [maintenanceIssue, setMaintenanceIssue] = useState({
    title: "",
    issue: "",
  });
  const [maintenanceIssues, setMaintenanceIssues] = useState<
    MaintenanceIssue[]
  >([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showDescription, setShowDescription] = useState(true);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await fetch(`/api/properties/${id}`);
        if (!response.ok) throw new Error("Failed to fetch property");

        const data: Property = await response.json();
        data.checkOutDay = JSON.parse(data.checkOutDay);

        setProperty(data);
      } catch (error) {
        console.error("Error fetching property:", error);
        toast({
          title: "Error",
          description: "Failed to fetch property details.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    // const fetchMaintenanceIssues = async () => {
    //   try {
    //     const response = await fetch(
    //       `/api/maintenance-issues?propertyId=${id}`
    //     );
    //     if (!response.ok) throw new Error("Failed to fetch maintenance issues");
    //     const data: MaintenanceIssue[] = await response.json();
    //     setMaintenanceIssues(
    //       data.filter((issue) => issue.status !== "Resolved")
    //     );
    //   } catch (error) {
    //     console.error("Error fetching maintenance issues:", error);
    //     toast({
    //       title: "Error",
    //       description: "Failed to fetch maintenance issues.",
    //       variant: "destructive",
    //     });
    //   }
    // };

    fetchProperty();
    // fetchMaintenanceIssues()
  }, [id]);

  // const reportMaintenanceIssue = async () => {
  //   if (maintenanceIssue.title.trim() && maintenanceIssue.issue.trim()) {
  //     try {
  //       const response = await fetch('/api/maintenance-issues', {
  //         method: 'POST',
  //         headers: { 'Content-Type': 'application/json' },
  //         body: JSON.stringify({
  //           propertyId: id,
  //           title: maintenanceIssue.title,
  //           issue: maintenanceIssue.issue,
  //           status: 'Open',
  //         }),
  //       })

  //       if (!response.ok) throw new Error('Failed to report maintenance issue')

  //       const newIssue: MaintenanceIssue = await response.json()
  //       setMaintenanceIssues([...maintenanceIssues, newIssue])
  //       setMaintenanceIssue({ title: "", issue: "" })
  //       toast({ title: "Success", description: "Maintenance issue reported successfully." })
  //     } catch (error) {
  //       console.error('Error reporting maintenance issue:', error)
  //       toast({ title: "Error", description: "Failed to report maintenance issue. Please try again.", variant: "destructive" })
  //     }
  //   } else {
  //     toast({ title: "Error", description: "Please provide both a title and description for the issue.", variant: "destructive" })
  //   }
  // }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex justify-center items-center h-screen">
        Property not found
      </div>
    );
  }

  const categories: Category[] = [
    { name: "House Rules", icon: Book, content: property.houseRules },
    { name: "Wifi", icon: Wifi, content: property.wifi },
    { name: "Local Food", icon: Utensils, content: property.localFood },
    { name: "Local Attractions", icon: Camera, content: property.nearbyPlaces },
    {
      name: "Emergency Contacts",
      icon: Phone,
      content: property.emergencyContact,
    },
    {
      name: "Appliance Guides",
      icon: Lightbulb,
      content: property.applianceGuides,
    },
    { name: "Rubbish & Bins", icon: Trash2, content: property.rubbishAndBins },
    { name: "Check Out", icon: CalendarCheck, content: property.checkOutDay },
  ];
  const renderCategoryContent = (category: Category) => {
    if (category.name === "Emergency Contacts") {
      console.log("emergency executed");
      return (
        <Card className="overflow-hidden">
          <CardContent className="pt-4">
            <div className="space-y-2">
              {typeof category.content === "string" &&
                category.content.split(",").map((contact, index) => {
                  const [name, number] = contact
                    .split(":")
                    .map((item) => item.trim());
                  return (
                    <div
                      key={index}
                      className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0"
                    >
                      <span className="font-medium text-gray-400">
                        Phone: {name}
                      </span>
                      <a
                        href={`tel:${number}`}
                        className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                      >
                        {number}
                      </a>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      );
    }else if(category.name === 'Local Attractions'){
      const contentString = category.content as string;

      const attractions = contentString
      .split("\n\n")
      .map((item: string, index: number) => item.split("\n"))
      .filter(subArray => subArray.length > 0 && subArray[0].trim() !== "")
      .map(subArray =>
        subArray.map(item => {
            return item.trim(); // Trim whitespace for other items
        })
    );
  
    return (
      <Card>
        <CardContent>
          {attractions.map((item: string[], index: number) => (
            <div
              key={index}
              className="bg-gray-100 text-gray-800 rounded p-3 text-sm hover:bg-gray-200 transition-colors duration-200 cursor-pointer mb-3"
            >
              {item.map(str=> (<p>{str}</p>))}
            </div>
          ))}
        </CardContent>
      </Card>
    );

    } else if (category.name === "Local Food") {

      const contentString = category.content as string;

      const localFoods = contentString
        .split("\n\n")
        .map((item: string, index: number) => item.split("\n"))
        .filter(subArray => subArray.length > 0 && subArray[0].trim() !== "")
        .map(subArray =>
          subArray.map(item => {
              return item.trim(); // Trim whitespace for other items
          })
      );
    
      return (
        <Card>
          <CardContent>
            {localFoods.map((item: string[], index: number) => (
              <div
                key={index}
                className="bg-gray-100 text-gray-800 rounded p-3 text-sm hover:bg-gray-200 transition-colors duration-200 cursor-pointer mb-3"
              >
                {item.map(str=> ((str.includes('website:') && !str.includes("website: N/A")) ? <Link
                  target="_blank"
                  className="underline text-blue-500"
                  href={str.trim().replace('website:', "")}
                >
                  {str.replace(/https?:\/\/([^\/]+).*/g, "$1")}
                </Link> : <p>{str}</p>))}
              </div>
            ))}
          </CardContent>
        </Card>
      );
    } else if (category.name === "Wifi") {
      const wifiDetails = category.content as {
        name: string;
        password: string;
      };

      return (
        <Card>
          <CardContent>
            <div className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm hover:bg-gray-200 transition-colors duration-200 cursor-pointer gap-1">
              <p className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm hover:bg-gray-200 transition-colors duration-200">
                Network name: {wifiDetails.name}
              </p>
              <p className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm hover:bg-gray-200 transition-colors duration-200">
                Password: {wifiDetails.password}
              </p>
            </div>
          </CardContent>
        </Card>
      );
    } else if (category.name === "Check Out") {
      const checkoutDetails = category.content as {
        checkOutTime: string;
        instructions: string;
      };

      return (
        <Card>
          <CardContent>
            <div className="px-3 py-1 bg-gray-100 text-gray-800 rounded w-full text-sm hover:bg-gray-200 transition-colors duration-200 cursor-pointer gap-1">
              <p className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm hover:bg-gray-200 transition-colors duration-200">
                Checkout time: {checkoutDetails.checkOutTime}
              </p>
              <p className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm hover:bg-gray-200 transition-colors duration-200">
                Instructions: {checkoutDetails.instructions}
              </p>
            </div>
          </CardContent>
        </Card>
      );
    } else {
      return (
        <Card className="overflow-hidden">
          <CardContent className="pt-4">
            <div className="flex flex-wrap gap-2">
              {typeof category.content === "string"
                ? category.content.split(",").map((item, index) => {
                    const trimmedItem = item.trim();
                    return (
                      <Link
                        key={index}
                        href={trimmedItem}
                        target=""
                        rel=" "
                        className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm hover:bg-gray-200 transition-colors duration-200 cursor-pointer gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm hover:bg-gray-200 transition-colors duration-200 cursor-pointer">
                          {trimmedItem}
                        </span>
                      </Link>
                    );
                  })
                : "No content available"}
            </div>
          </CardContent>
        </Card>
      );
    }
  };

  const processedText = processText(
    property?.digitalGuide?.replace(/[*#]/g, "")
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Dialog open={showDescription} onOpenChange={setShowDescription}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{property.name}</DialogTitle>
            <DialogDescription>Welcome to your stay!</DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {property.description}
            </p>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowDescription(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="container mx-auto px-4 py-8 flex-grow">
        <header className="mb-8 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-2">
            {property.name}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground flex items-center justify-center mb-4">
            <MapPin className="w-5 h-5 mr-2" />
            {property.location}
          </p>
          <div className="relative w-full h-48 md:h-64 lg:h-96 rounded-lg overflow-hidden">
            <Image
              src={
                property.images[0] || "/placeholder.svg?height=384&width=768"
              }
              alt={property.name}
              fill
              style={{ objectFit: "cover" }}
              className="rounded-lg"
            />
          </div>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          {categories.map((category, index) => (
            <Card
              key={index}
              className="cursor-pointer transition-all hover:shadow-lg group"
              onClick={() => setSelectedCategory(category.name)}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {category.name}
                </CardTitle>
                <category.icon className="h-6 w-6 text-muted-foreground transition-all duration-200 group-hover:scale-110 group-hover:text-green-600" />
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Click to view details
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Dialog
          open={!!selectedCategory}
          onOpenChange={() => setSelectedCategory(null)}
        >
          <DialogContent
            className="sm:max-w-[425px]"
            onClick={(e) => e.stopPropagation()}
          >
            <DialogHeader>
              <DialogTitle>{selectedCategory}</DialogTitle>
            </DialogHeader>
            <div className="mt-4 max-h-[60vh] overflow-y-auto">
              {selectedCategory &&
                renderCategoryContent(
                  categories.find((c) => c.name === selectedCategory)!
                )}
            </div>
          </DialogContent>
        </Dialog>
        {/* if user is not logged in, can't use the maintanence issue form */}
        {/*<Card className={`mb-8 ${property.isAuth ? '' : "hidden"}`}>
          <CardHeader>
            <CardTitle className="text-xl md:text-2xl">Report an Issue</CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            <div className="space-y-4">
              <Input 
                value={maintenanceIssue.title}
                onChange={(e) => setMaintenanceIssue({ ...maintenanceIssue, title: e.target.value })}
                placeholder="Issue title..."
              />
              <Textarea 
                value={maintenanceIssue.issue}
                onChange={(e) => setMaintenanceIssue({ ...maintenanceIssue, issue: e.target.value })}
                placeholder="Describe the issue..."
              />
              <Button onClick={reportMaintenanceIssue} className="w-full">Report Issue</Button>
            </div>
          </CardContent>
        </Card>
        */}

        <Card>
          <CardHeader>
            <CardTitle className="text-xl md:text-2xl">Digital Guide</CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            <div
              className="text-sm md:text-base text-muted-foreground whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: processedText }}
            ></div>
          </CardContent>
        </Card>
      </div>
      <footer className="bg-muted py-4 mt-12">
        <div className="container mx-auto px-4 text-center">
          <div className="text-sm text-muted-foreground gap-3 flex items-center justify-center">
            <span>
              &copy; {new Date().getFullYear()} Proudly night to you by
            </span>

            <div className="flex items-center gap-1">
              <img
                className="rounded-full w-[20px] h-[20px]"
                src={logo.src}
                alt="Logo"
              />
              <a
                href="https://stayscan.tech"
                className="text-foreground hover:underline ml-1"
                target="_blank"
                rel="noopener noreferrer"
              >
                StayScan.tech
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
