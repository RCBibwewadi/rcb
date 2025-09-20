"use client";
import React from "react";

interface BoardMember {
  id: number;
  name: string;
  position: string;
  description: string;
  image: string;
  gradient: string;
  initial: string;
}

const boardMembers: BoardMember[] = [
  {
    id: 1,
    name: "Sneha Jain",
    position: "President",
    description: "Leading with Vision",
    image: "/Seha.jpeg",
    gradient: "from-rose-tan to-rose-tan-dark",
    initial: "P",
  },
  {
    id: 2,
    name: "Rishi Oswal",
    position: "Secretary",
    description: "Organizing Success",
    image: "/Rishi.jpeg",
    gradient: "from-luxury-gold to-rose-tan",
    initial: "S",
  },
  {
    id: 3,
    name: "Hitansh Parmar",
    position: "Joint Secretary",
    description: "Ensuring Smooth Operations",
    image: "/Hitansh.png",
    gradient: "from-rose-tan-light to-mauve-wine-light",
    initial: "JS",
  },
  {
    id: 4,
    name: "Ansh Gandhi",
    position: "Treasurer",
    description: "Financial Stewardship",
    image: "/ansh.jpeg",
    gradient: "from-rose-tan-light to-mauve-wine-light",
    initial: "T",
  },
  {
    id: 5,
    name: "Jayendra Shroff",
    position: "Vice President",
    description: "Supporting Excellence",
    image: "/Jayendra.jpeg",
    gradient: "from-mauve-wine to-mauve-wine-dark",
    initial: "VP",
  },
  {
    id: 6,
    name: "Disha Daga",
    position: "Club Mentor",
    description: "Guiding with Experience",
    image: "/Disha.jpeg",
    gradient: "from-rose-tan-light to-mauve-wine-light",
    initial: "CM",
  },
  {
    id: 7,
    name: "Sahil Oswal",
    position: "IPP",
    description: "Continuing Legacy",
    image: "",
    gradient: "from-rose-tan-light to-mauve-wine-light",
    initial: "IP",
  },
  {
    id: 8,
    name: "Vanshita Jain",
    position: "SAA",
    description: "Maintaining Order & Discipline",
    image: "/Vanshita.jpeg",
    gradient: "from-rose-tan-light to-mauve-wine-light",
    initial: "SA",
  },
  {
    id: 9,
    name: "Pritesh Gadiya",
    position: "CSD",
    description: "Fostering Fellowship",
    image: "/Pritesh.JPG",
    gradient: "from-rose-tan-light to-mauve-wine-light",
    initial: "CSD",
  },
  {
    id: 10,
    name: "Shrenik Dugad",
    position: "PDD",
    description: "Encouraging Growth & Learning",
    image: "/Shrenik.jpeg",
    gradient: "from-rose-tan-light to-mauve-wine-light",
    initial: "PDD",
  },
  {
    id: 11,
    name: "Pranav Gandhi",
    position: "ISD",
    description: "Building Global Connections",
    image: "/Pranav.jpeg",
    gradient: "from-rose-tan-light to-mauve-wine-light",
    initial: "ISD",
  },
  {
    id: 12,
    name: "Lavish Lodha",
    position: "CMD",
    description: "Driving Social Impact",
    image: "/Lavish.png",
    gradient: "from-rose-tan-light to-mauve-wine-light",
    initial: "CMD",
  },
  {
    id: 13,
    name: "Jay Agarwal",
    position: "RRRO",
    description: "Strengthening Rotary Bonds",
    image: "",
    gradient: "from-rose-tan-light to-mauve-wine-light",
    initial: "RRRO",
  },
  {
    id: 14,
    name: "Viraj Soni",
    position: "DEI",
    description: "Promoting Inclusivity",
    image: "",
    gradient: "from-rose-tan-light to-mauve-wine-light",
    initial: "DEI",
  },
  {
    id: 15,
    name: "Dinal Jain",
    position: "PRO",
    description: "Spreading Awareness",
    image: "/Dinal.jpeg",
    gradient: "from-rose-tan-light to-mauve-wine-light",
    initial: "PRO",
  },
];

export default function Board() {
  return (
    <section id="board" className="py-16 px-6 lg:px-20 ">
      <div className="flex flex-col items-center justify-center text-center mb-8">
        <h3 className="text-2xl md:text-3xl font-bold text-mauve-wine mb-4">
          Board of Directors - RIY 2025-2026
        </h3>
        <p className="text-mauve-wine-light">
          Meet the dedicated leaders driving our mission forward
        </p>
      </div>

      <div className="grid  md:grid-cols-2 grid-cols-1 gap-8">
        {boardMembers.map((member) => (
          <div
            key={member.id}
            className="bg-white rounded-xl shadow-md overflow-hidden luxury-shadow hover:shadow-lg transition"
          >
            <div
              className={`h-[500px] bg-gradient-to-br ${member.gradient} relative`}
            >
              {member.image ? (
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover absolute inset-0"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">
                    {member.initial}
                  </span>
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 p-3 text-center">
                <div className="text-white font-bold">{member.name}</div>
                <div className="text-rose-tan-light text-sm">
                  {member.position}
                </div>
              </div>
            </div>
            <div className="p-4 text-center text-sm text-gray-600">
              {member.description}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
