import { Users, Target, Award, Lightbulb, ArrowUpRight } from "lucide-react";
import { useAboutContent } from "@/hooks/useAboutContent";
import { useClubs } from "@/hooks/useClubs";
import { useCommittees } from "@/hooks/useCommittees";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { motion, Variants } from "framer-motion"; // Import Variants type
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

// --- SMOOTHER VARIANTS (Type Safe) ---
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }, // Removed 'ease' from here as it's not valid for orchestration
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }, // Smooth entry
  },
};

// --- Helper Component ---
const StatDisplay = ({ value, label }: any) => (
  <div>
    <span className="font-heading text-3xl font-bold text-accent tracking-tight block">
      {value}
    </span>
    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
      {label}
    </span>
  </div>
);

export const About = () => {
  // 1. Fetch Dynamic Content
  const { data: aboutContent } = useAboutContent();
  const { data: clubs } = useClubs();
  const { data: committees } = useCommittees();
  const { data: settings } = useSiteSettings();

  // 2. Helper to get Setting
  const getVal = (key: string, def: string) =>
    settings?.find((s) => s.setting_key === key)?.setting_value || def;

  // 3. Process Batch Data
  const b1 = {
    name: getVal("batch_1_label", "Batch 1"),
    male: parseInt(getVal("batch_1_male", "0")),
    female: parseInt(getVal("batch_1_female", "0")),
  };
  const b2 = {
    name: getVal("batch_2_label", "Batch 2"),
    male: parseInt(getVal("batch_2_male", "0")),
    female: parseInt(getVal("batch_2_female", "0")),
  };

  const totalStudents = b1.male + b1.female + b2.male + b2.female;

  return (
    <section
      id="about"
      className="py-8 md:py-12 bg-slate-50 relative overflow-hidden" // Reduced vertical padding
    >
      {/* --- VISIBLE BACKGROUND GRID --- */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage: "radial-gradient(#94a3b8 1.5px, transparent 1.5px)",
          backgroundSize: "24px 24px",
          opacity: 0.15, // Increased visibility
        }}
      />
      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-slate-50 via-slate-50/50 to-transparent" />

      <div className="container-wide mx-auto px-6 relative z-10">
        {/* --- Header --- */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12" // Reduced margin bottom
        >
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-3">
              {" "}
              {/* Reduced margin */}
              <span className="w-10 h-[2px] bg-accent"></span>
              <span className="text-accent font-bold tracking-widest text-xs uppercase">
                Who We Are
              </span>
            </div>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-slate-900 leading-tight">
              {aboutContent?.title ? (
                <>
                  {aboutContent.title.split(" ").slice(0, -1).join(" ")}{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-amber-500">
                    {aboutContent.title.split(" ").slice(-1)}
                  </span>
                </>
              ) : (
                <>
                  Voice of{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-amber-500">
                    IIM Sambalpur
                  </span>
                </>
              )}
            </h2>
          </div>
          <p className="text-slate-500 text-sm max-w-md md:text-right leading-relaxed font-medium">
            {" "}
            {/* Smaller text */}
            {aboutContent?.description ||
              "Fostering leadership, culture, and academic excellence through student governance."}
          </p>
        </motion.div>

        {/* --- Bento Grid --- */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[minmax(140px,auto)]" // Reduced gap and row height
        >
          {/* 1. VISION CARD (Dark Theme) */}
          <motion.div
            variants={cardVariants}
            className="md:col-span-2 md:row-span-2 bg-[#0F172A] rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between group shadow-xl" // Reduced padding
          >
            <div className="absolute top-0 right-0 p-8 opacity-[0.08] transition-transform duration-700 group-hover:scale-110">
              <Lightbulb className="w-40 h-40 text-white" />{" "}
              {/* Smaller icon */}
            </div>
            <div className="relative z-10">
              <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-accent mb-5 shadow-inner">
                {" "}
                {/* Smaller icon box */}
                <Target className="w-5 h-5" />
              </div>
              <h3 className="font-heading text-2xl font-bold text-white mb-3">
                {" "}
                {/* Smaller text */}
                Our Vision
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed max-w-sm">
                {aboutContent?.vision ||
                  "To create a vibrant, inclusive, and dynamic campus ecosystem that empowers every student."}
              </p>
            </div>
          </motion.div>

          {/* 2. BATCH STATS */}
          <motion.div
            variants={cardVariants}
            className="md:col-span-2 bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow duration-300" // Reduced padding
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <span className="block font-bold text-slate-900 text-xs">
                    Demographics
                  </span>
                  <span className="text-[9px] text-slate-400 uppercase tracking-wider">
                    Student Body
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-slate-900 block leading-none">
                  {totalStudents || "500+"}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Total Strength
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {/* Batch 1 Bar */}
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                  <span>{b1.name}</span>
                  <span>{b1.male + b1.female} Students</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
                  {" "}
                  {/* Thinner bar */}
                  <div
                    className="h-full bg-slate-800"
                    style={{
                      width: `${(b1.male / (b1.male + b1.female)) * 100}%`,
                    }}
                  />
                  <div
                    className="h-full bg-accent"
                    style={{
                      width: `${(b1.female / (b1.male + b1.female)) * 100}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                  <span>M: {b1.male}</span>
                  <span>F: {b1.female}</span>
                </div>
              </div>

              {/* Batch 2 Bar */}
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                  <span>{b2.name}</span>
                  <span>{b2.male + b2.female} Students</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-slate-800"
                    style={{
                      width: `${(b2.male / (b2.male + b2.female)) * 100}%`,
                    }}
                  />
                  <div
                    className="h-full bg-accent"
                    style={{
                      width: `${(b2.female / (b2.male + b2.female)) * 100}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                  <span>M: {b2.male}</span>
                  <span>F: {b2.female}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 3. CLUBS & COMMITTEES */}
          <motion.div
            variants={cardVariants}
            className="bg-white border border-slate-100 rounded-2xl hover:-translate-y-1 transition-transform duration-300 ease-out shadow-sm hover:shadow-md relative overflow-hidden"
          >
            <Link
              to="/clubs"
              className="block w-full h-full p-5 flex flex-col justify-between"
            >
              <div className="p-2 w-fit bg-purple-50 text-purple-600 rounded-lg mb-3">
                <Users className="w-4 h-4" />
              </div>
              <StatDisplay
                value={clubs ? clubs.length : "--"}
                label="Student Clubs"
              />
            </Link>
          </motion.div>

          <motion.div
            variants={cardVariants}
            className="bg-white border border-slate-100 rounded-2xl hover:-translate-y-1 transition-transform duration-300 ease-out shadow-sm hover:shadow-md relative overflow-hidden"
          >
            <Link
              to="/committees"
              className="block w-full h-full p-5 flex flex-col justify-between"
            >
              <div className="p-2 w-fit bg-orange-50 text-orange-600 rounded-lg mb-3">
                <Target className="w-4 h-4" />
              </div>
              <StatDisplay
                value={committees ? committees.length : "--"}
                label="Committees"
              />
            </Link>
          </motion.div>

          {/* 4. MISSION */}
          <motion.div
            variants={cardVariants}
            className="md:col-span-2 bg-slate-50 rounded-2xl p-6 border border-slate-100" // Reduced padding
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
              <h4 className="font-heading text-lg font-bold text-slate-900">
                Our Mission
              </h4>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed">
              {aboutContent?.mission ||
                "To represent student interests, foster holistic development, and build a legacy of excellence for future generations."}
            </p>
          </motion.div>

          {/* 5. LINK CARD */}
          <motion.div
            variants={cardVariants}
            className="md:col-span-2 group relative"
          >
            <Link
              to="/events"
              className="block h-full bg-white border border-slate-200 rounded-2xl p-6 hover:border-accent transition-colors duration-300" // Reduced padding
            >
              <div className="flex justify-between items-start h-full">
                <div className="space-y-2">
                  <div className="p-2 w-fit bg-blue-50 text-blue-600 rounded-lg mb-2">
                    <Award className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-lg group-hover:text-accent transition-colors">
                    Life at IIM Sambalpur
                  </h4>
                  <p className="text-slate-500 text-sm">
                    Explore our flagship events, culture, and campus vibes.
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-all duration-300">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
              </div>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
