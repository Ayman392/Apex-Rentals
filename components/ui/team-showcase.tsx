"use client";

import { useState } from "react";
import { AtSign, Briefcase, Camera, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { FALLBACK_EQUIPMENT_IMAGE } from "@/lib/constants";
import Image from "next/image";

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  image: string;
  social?: {
    twitter?: string;
    linkedin?: string;
    instagram?: string;
    website?: string;
  };
}

export const TRUSTED_OWNERS: TeamMember[] = [
  {
    id: "1",
    name: "Mahmudul Hasan",
    role: "Heavy Construction Fleet · Dhaka",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=500&q=80",
    social: { linkedin: "#", website: "#" },
  },
  {
    id: "2",
    name: "Nusrat Jahan",
    role: "Cinema & Camera Gear · Dhaka",
    image:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=500&q=80",
    social: { instagram: "#", linkedin: "#" },
  },
  {
    id: "3",
    name: "Tanvir Chowdhury",
    role: "Power Generators & Tools · Chattogram",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&q=80",
    social: { twitter: "#", linkedin: "#" },
  },
  {
    id: "4",
    name: "Farhana Akter",
    role: "Event Audio & Lighting · Sylhet",
    image:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=500&q=80",
    social: { instagram: "#", website: "#" },
  },
  {
    id: "5",
    name: "Rafiqul Islam",
    role: "Agricultural Machinery · Bogura",
    image:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=500&q=80",
    social: { linkedin: "#" },
  },
  {
    id: "6",
    name: "Sadia Rahman",
    role: "Aerial Drones & Surveying · Khulna",
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80",
    social: { twitter: "#", instagram: "#", linkedin: "#" },
  },
];

interface TeamShowcaseProps {
  members?: TeamMember[];
}

export function TeamShowcase({ members = TRUSTED_OWNERS }: TeamShowcaseProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const col1 = members.filter((_, i) => i % 3 === 0);
  const col2 = members.filter((_, i) => i % 3 === 1);
  const col3 = members.filter((_, i) => i % 3 === 2);

  return (
    <div className="mx-auto flex w-full max-w-5xl select-none flex-col items-start gap-8 px-4 py-8 font-sans md:flex-row md:gap-10 md:px-6 lg:gap-14">
      {/* Left: 3-column staggered photo grid */}
      <div className="flex flex-shrink-0 gap-2 overflow-x-auto pb-1 md:gap-3 md:pb-0">
        {/* Column 1 */}
        <div className="flex flex-col gap-2 md:gap-3">
          {col1.map((member) => (
            <PhotoCard
              key={member.id}
              member={member}
              className="h-[120px] w-[110px] sm:h-[140px] sm:w-[130px] md:h-[165px] md:w-[155px]"
              hoveredId={hoveredId}
              onHover={setHoveredId}
            />
          ))}
        </div>

        {/* Column 2 */}
        <div className="mt-[48px] flex flex-col gap-2 sm:mt-[56px] md:mt-[68px] md:gap-3">
          {col2.map((member) => (
            <PhotoCard
              key={member.id}
              member={member}
              className="h-[132px] w-[122px] sm:h-[155px] sm:w-[145px] md:h-[182px] md:w-[172px]"
              hoveredId={hoveredId}
              onHover={setHoveredId}
            />
          ))}
        </div>

        {/* Column 3 */}
        <div className="mt-[22px] flex flex-col gap-2 sm:mt-[26px] md:mt-[32px] md:gap-3">
          {col3.map((member) => (
            <PhotoCard
              key={member.id}
              member={member}
              className="h-[125px] w-[115px] sm:h-[146px] sm:w-[136px] md:h-[172px] md:w-[162px]"
              hoveredId={hoveredId}
              onHover={setHoveredId}
            />
          ))}
        </div>
      </div>

      {/* Right: owner name list */}
      <div className="flex w-full flex-1 flex-col gap-4 pt-0 sm:grid sm:grid-cols-2 md:flex md:flex-col md:gap-5 md:pt-2">
        {members.map((member) => (
          <MemberRow
            key={member.id}
            member={member}
            hoveredId={hoveredId}
            onHover={setHoveredId}
          />
        ))}
      </div>
    </div>
  );
}

function PhotoCard({
  member,
  className,
  hoveredId,
  onHover,
}: {
  member: TeamMember;
  className: string;
  hoveredId: string | null;
  onHover: (id: string | null) => void;
}) {
  const [failed, setFailed] = useState(false);
  const isActive = hoveredId === member.id;
  const isDimmed = hoveredId !== null && !isActive;

  return (
    <div
      className={cn(
        "flex-shrink-0 cursor-pointer overflow-hidden rounded-xl bg-muted transition-opacity duration-400",
        className,
        isDimmed ? "opacity-60" : "opacity-100",
      )}
      onMouseEnter={() => onHover(member.id)}
      onMouseLeave={() => onHover(null)}
    >
      <Image
        width={300}
        height={300}
        unoptimized
        src={failed ? FALLBACK_EQUIPMENT_IMAGE : member.image}
        alt={member.name}
        onError={() => setFailed(true)}
        className="h-full w-full object-cover transition-[filter] duration-500"
        style={{
          filter: isActive
            ? "grayscale(0) brightness(1)"
            : "grayscale(1) brightness(0.77)",
        }}
      />
    </div>
  );
}

function MemberRow({
  member,
  hoveredId,
  onHover,
}: {
  member: TeamMember;
  hoveredId: string | null;
  onHover: (id: string | null) => void;
}) {
  const isActive = hoveredId === member.id;
  const isDimmed = hoveredId !== null && !isActive;
  const hasSocial =
    member.social?.twitter ??
    member.social?.linkedin ??
    member.social?.instagram ??
    member.social?.website;

  return (
    <div
      className={cn(
        "cursor-pointer transition-opacity duration-300",
        isDimmed ? "opacity-50" : "opacity-100",
      )}
      onMouseEnter={() => onHover(member.id)}
      onMouseLeave={() => onHover(null)}
    >
      {/* Name + social */}
      <div className="flex items-center gap-2.5">
        <span
          className={cn(
            "h-3 w-4 flex-shrink-0 rounded-[5px] transition-all duration-300",
            isActive ? "w-5 bg-foreground" : "bg-foreground/25",
          )}
        />
        <span
          className={cn(
            "text-base font-semibold leading-none tracking-tight transition-colors duration-300 md:text-[18px]",
            isActive ? "text-foreground" : "text-foreground/80",
          )}
        >
          {member.name}
        </span>

        {/* Social icons */}
        {hasSocial && (
          <div
            className={cn(
              "ml-0.5 flex items-center gap-1.5 transition-all duration-200",
              isActive
                ? "translate-x-0 opacity-100"
                : "pointer-events-none -translate-x-2 opacity-0",
            )}
          >
            {member.social?.twitter && (
              <a
                href={member.social.twitter}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="rounded p-1 text-muted-foreground transition-all duration-150 hover:scale-110 hover:bg-foreground/10 hover:text-foreground"
                title="X / Social"
              >
                <AtSign className="size-3" />
              </a>
            )}
            {member.social?.linkedin && (
              <a
                href={member.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="rounded p-1 text-muted-foreground transition-all duration-150 hover:scale-110 hover:bg-foreground/10 hover:text-foreground"
                title="Company Profile"
              >
                <Briefcase className="size-3" />
              </a>
            )}
            {member.social?.instagram && (
              <a
                href={member.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="rounded p-1 text-muted-foreground transition-all duration-150 hover:scale-110 hover:bg-foreground/10 hover:text-foreground"
                title="Media Gallery"
              >
                <Camera className="size-3" />
              </a>
            )}
            {member.social?.website && (
              <a
                href={member.social.website}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="rounded p-1 text-muted-foreground transition-all duration-150 hover:scale-110 hover:bg-foreground/10 hover:text-foreground"
                title="Storefront"
              >
                <Globe className="size-3" />
              </a>
            )}
          </div>
        )}
      </div>

      {/* Role / Specialty */}
      <p className="mt-1.5 pl-[27px] text-[9px] font-medium uppercase tracking-[0.2em] text-muted-foreground md:text-[10px]">
        {member.role}
      </p>
    </div>
  );
}

export default TeamShowcase;