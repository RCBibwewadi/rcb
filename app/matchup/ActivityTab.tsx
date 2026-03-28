"use client";

import { motion } from "framer-motion";
import {
  Sparkles,
  PenLine,
  Handshake,
  Video,
  PersonStanding,
  Hand,
  GraduationCap,
  UtensilsCrossed,
  Users,
  Mic,
  Palette,
  CircleDot,
  Smile,
  Music,
  Coffee,
  CameraIcon
} from "lucide-react";

interface Activity {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  proof: string;
}

const activities: Activity[] = [
  {
    id: "two-truths-lie",
    icon: <Sparkles className="w-6 h-6" />,
    title: "2 Truths & 1 Lie",
    description:
      "Each person shares 3 statements about themselves — 2 truths and 1 lie. The partner listens carefully and guesses which one is the lie. Then switch roles.",
    proof:
      "Short video or voice note capturing one round with statements and the partner’s guess."
  },
  {
    id: "complete-sentences",
    icon: <PenLine className="w-6 h-6" />,
    title: "Complete Each Other's Sentences",
    description:
      "Take turns completing prompts like “I think you are the kind of person who…” or “You seem like someone who would…”. Focus on fun, honest, or unexpected observations.",
    proof:
      "Photo of written responses OR a short video of both sharing their answers."
  },
  {
    id: "funny-handshake",
    icon: <Handshake className="w-6 h-6" />,
    title: "Create a Funny Handshake / Signature Move",
    description:
      "As a pair, create a unique handshake or mini routine (claps, snaps, moves). Practice until both of you can perform it smoothly together.",
    proof:
      "Video of both performing the handshake/signature move together."
  },
  {
    id: "recreate-meme",
    icon: <Video className="w-6 h-6" />,
    title: "Recreate a Meme or Reel Together",
    description:
      "Pick a popular meme or reel and recreate it together. Focus on expressions, timing, and creativity while acting it out.",
    proof:
      "Final recorded reel/video."
  },
  {
    id: "blindfold-walk",
    icon: <PersonStanding className="w-6 h-6" />,
    title: "Blindfold Trust Walk",
    description:
      "One person is blindfolded while the other guides them using only verbal instructions (no physical pulling). Keep it short and safe, then switch roles.",
    proof:
      "Short video showing both roles — guiding and being guided."
  },
  {
    id: "one-hand-challenge",
    icon: <Hand className="w-6 h-6" />,
    title: "One-Hand Challenge",
    description:
      "Both participants use only one hand each to complete a simple task together (e.g., opening something, stacking items). Focus on coordination and teamwork.",
    proof:
      "Video of the attempt (success or failure both count)."
  },
  {
    id: "teach-skill",
    icon: <GraduationCap className="w-6 h-6" />,
    title: "Teach Each Other Something in 5 Minutes",
    description:
      "Each person gets up to 5 minutes to teach a small skill (dance step, trick, shortcut, etc.), and the partner tries to learn and perform it.",
    proof:
      "Video showing the teaching moment and the partner attempting the skill."
  },
  {
    id: "try-food",
    icon: <UtensilsCrossed className="w-6 h-6" />,
    title: "Try a New Food Together & Rate It",
    description:
      "Pick something new to try together (snack, drink, or dish). Taste it and rate it honestly out of 10 based on your experience.",
    proof:
      "Photo/video of tasting + both participants giving their ratings."
  },
  {
    id: "double-dinner",
    icon: <Users className="w-6 h-6" />,
    title: "Double Pair Dinner",
    description:
      "Team up with one more pair (total 4 people only) and go out for a casual meal. Keep it relaxed and focus on getting to know each other.",
    proof:
      "Group photo of all 4 people together at the venue."
  },
  {
    id: "sing-song",
    icon: <Mic className="w-6 h-6" />,
    title: "Sing & Record Your Favorite Song",
    description:
      "Choose a song that one or both of you like and sing it together. No need to be perfect — just enjoy the moment.",
    proof:
      "Audio or video recording of your performance."
  },
  {
    id: "half-coloring",
    icon: <Palette className="w-6 h-6" />,
    title: "Half-and-Half Coloring Challenge",
    description:
      "Take one drawing and divide it into two halves. Each person colors one side and try to make the final artwork look connected.",
    proof:
      "Photo of the final combined artwork."
  },
  {
    id: "color-hunt",
    icon: <CircleDot className="w-6 h-6" />,
    title: "Color Hunt",
    description:
      "Each person picks a different color and finds objects around them that match their chosen color within a set time.",
    proof:
      "Photo collage or 3–5 pictures per person showing the collected items."
  },
  {
    id: "funny-intro",
    icon: <Smile className="w-6 h-6" />,
    title: "Funny Introduction / Mimic Your Partner",
    description:
      "Introduce your partner as if you are them or mimic their personality in a fun way. Keep it entertaining for at least 2 minutes.",
    proof:
      "Video clip capturing the best or funniest part."
  },
  {
    id: "jamming",
    icon: <Music className="w-6 h-6" />,
    title: "Jamming Session Together",
    description:
      "Create music together using singing, clapping, instruments, or beats. Focus on building a shared rhythm or vibe.",
    proof:
      "Video or audio clip of your jam session."
  },
  {
    id: "coffee-convo",
    icon: <Coffee className="w-6 h-6" />,
    title: "Coffee & Conversations",
    description:
      "Sit down together and have a meaningful conversation about goals, ambitions, interests, or life experiences.",
    proof:
      "Selfie together + a short text or voice note sharing 1–2 things you learned about each other."
  }
];

export default function ActivityTab() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-mauve-wine mb-2">
          Activities for You Two
        </h2>
        <p className="text-mauve-wine-light">
          Fun things to do together and get to know each other better!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activities.map((activity, index) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="glass-effect rounded-xl p-5 luxury-shadow hover:shadow-lg transition-shadow group"
          >
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 luxury-gradient rounded-full flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                {activity.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-mauve-wine mb-1">
                  {activity.title}
                </h3>
                <p className="text-sm text-mauve-wine-light leading-relaxed">
                  {activity.description}
                </p>
                <p className="text-sm text-mauve-wine-light leading-relaxed mt-2">
                  <CameraIcon className="w-4 h-4 inline-block mr-1" />
                  {activity.proof}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-center pt-6"
      >
        <p className="text-mauve-wine-light text-sm italic">
          Remember: The goal is to have fun and connect. No pressure, just enjoy the moment!
        </p>
      </motion.div>
    </motion.div>
  );
}
