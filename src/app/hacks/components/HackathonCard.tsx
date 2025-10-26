"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Users, Code, ExternalLink } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

interface Hackathon {
  id: string;
  name: string;
  description: string | null;
  start_date: Date;
  end_date: Date;
  image_url: string | null;
  status: string | null;
  created_at: Date | null;
  created_by: string | null;
}

interface HackathonCardProps {
  hackathon: Hackathon;
}

export function HackathonCard({ hackathon }: HackathonCardProps) {
  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "upcoming":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Upcoming</Badge>;
      case "active":
        return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>;
      case "ended":
        return <Badge variant="outline" className="bg-neutral-100 text-neutral-600">Ended</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const formatDate = (date: Date) => {
    try {
      return format(new Date(date), "MMM dd, yyyy");
    } catch {
      return "Invalid date";
    }
  };

  const isActive = () => {
    const now = new Date();
    const start = new Date(hackathon.start_date);
    const end = new Date(hackathon.end_date);
    return now >= start && now <= end;
  };

  const isUpcoming = () => {
    const now = new Date();
    const start = new Date(hackathon.start_date);
    return now < start;
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 border border-neutral-200 dark:border-neutral-700">
      {hackathon.image_url && (
        <div className="relative h-48 overHBAR-hidden rounded-t-lg">
          <img
            src={hackathon.image_url}
            alt={hackathon.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
          <div className="absolute top-3 right-3">
            {getStatusBadge(hackathon.status)}
          </div>
        </div>
      )}
      
      <CardHeader className={hackathon.image_url ? "pb-2" : ""}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg line-clamp-2 group-hover:text-blue-600 transition-colors">
              {hackathon.name}
            </CardTitle>
            {!hackathon.image_url && (
              <div className="mt-2">
                {getStatusBadge(hackathon.status)}
              </div>
            )}
          </div>
        </div>
        
        {hackathon.description && (
          <CardDescription className="line-clamp-2">
            {hackathon.description}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>Starts: {formatDate(hackathon.start_date)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>Ends: {formatDate(hackathon.end_date)}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            asChild 
            className="flex-1"
            variant={isActive() ? "default" : isUpcoming() ? "secondary" : "outline"}
          >
            <Link href={`/hacks/${hackathon.id}`} className="flex items-center gap-2">
              <Code className="w-4 h-4" />
              {isActive() ? "Join Now" : isUpcoming() ? "View Details" : "View Results"}
            </Link>
          </Button>
          
          <Button 
            asChild 
            variant="outline" 
            size="icon"
            className="hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <Link href={`/hacks/${hackathon.id}/projects`}>
              <Users className="w-4 h-4" />
            </Link>
          </Button>
        </div>

        {/* Additional info */}
        <div className="pt-2 border-t border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
            <span>
              Created {hackathon.created_at ? formatDate(hackathon.created_at) : "Unknown"}
            </span>
            <Link 
              href={`/hacks/${hackathon.id}`}
              className="flex items-center gap-1 hover:text-blue-600 transition-colors"
            >
              View <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
