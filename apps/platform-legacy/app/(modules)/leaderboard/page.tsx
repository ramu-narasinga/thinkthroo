"use client";

import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/interfaces/page/header";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

const contestTracks = [
  "Algorithms",
  "Mathematics",
  "Functional Programming",
  "Artificial Intelligence",
];

const practiceTracks = [
  "Algorithms",
  "Data Structures",
  "Mathematics",
  "Artificial Intelligence",
  "C++",
  "Java",
  "Python",
  "Ruby",
  "SQL",
  "Databases",
  "Distributed Systems",
  "Linux Shell",
  "Functional Programming",
  "Security",
];

export default function ChallengesPage() {
  const [selectedTrack, setSelectedTrack] = useState("Algorithms");
  const [trackType, setTrackType] = useState("Contests");

  return (
    <div className="container relative space-y-6">
      {/* Page Header */}
      <PageHeader>
        <PageHeaderHeading>Leaderboard</PageHeaderHeading>
        <PageHeaderDescription>
          Bring your best techniques and patterns to solve the challenges.
        </PageHeaderDescription>
      </PageHeader>

      {/* Dropdown */}
      <div className="bg-white p-3 shadow w-fit">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="!rounded-none flex items-center space-x-3 px-0 py-0 h-auto bg-transparent shadow-none border-none hover:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
            >
              <span className="font-medium">{selectedTrack}</span>
              <div className="h-5 w-px bg-gray-300"></div>
              <span className="text-gray-500">{trackType}</span>
              <ChevronDown className="w-5 h-5 text-gray-500 ml-2" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
          className="mt-2 ml-15.5 p-6 w-[900px] grid grid-cols-2 gap-4 shadow-xl !rounded-none z-50">
            {/* Contests */}
            <div>
              <h3 className="text-md font-semibold text-gray-500 mb-2 uppercase">
                Contests
              </h3>
              <ul className="space-y-4">
                {contestTracks.map((track) => (
                  <li
                    key={track}
                    onClick={() => {
                      setSelectedTrack(track);
                      setTrackType("Contests");
                    }}
                    className="text-lg hover:text-black cursor-pointer"
                  >
                    {track}
                  </li>
                ))}
              </ul>
            </div>

            {/* Practice */}
            <div>
              <h3 className="text-md font-semibold text-gray-500 mb-2 uppercase">
                Practice
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {practiceTracks.map((track) => (
                  <span
                    key={track}
                    onClick={() => {
                      setSelectedTrack(track);
                      setTrackType("Practice");
                    }}
                    className={`text-lg px-3 py-1 rounded cursor-pointer hover:bg-gray-100 ${
                      selectedTrack === track && trackType === "Practice"
                        ? "bg-gray-100"
                        : ""
                    }`}
                  >
                    {track}
                  </span>
                ))}
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
