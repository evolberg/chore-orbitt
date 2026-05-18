import { useState } from "react";

export default function OrbitalChoreScheduler() {
  const peopleMap = {
    1: "Sara",
    2: "Nina",
    3: "Kirsten",
    4: "Colton",
    5: "Jack",
    6: "Ethan",
    7: "Kaya",
  };

  const wheels = [
    {
      name: "Everyone",
      people: ["1", "2", "3", "4", "5", "6", "7"],
      chores: ["a", "b"],
    },
    {
      name: "Main and Upstairs",
      people: ["1", "2", "3", "4", "5"],
      chores: ["c", "d"],
    },
    {
      name: "Upstairs",
      people: ["1", "2", "3"],
      chores: ["e", "f"],
    },
    {
      name: "Main and Downstairs",
      people: ["4","5","6","7"],
      chores: ["g"],
    },
  ];

  const choresMap = {
    a: "Living Room + Dining Room",
    b: "Stoop + Stairs",
    c: "Recycling + Porch",
    d: "Kitchen",
    e: "Upstairs Bathroom",
    f: "Laundry + Landing",
    g: "Mainfloor Bathroom",
  };

  const choreColor = {
    a: "#3b82f6",
    b: "#22c55e",
    c: "#3b82f6",
    d: "#22c55e",
    e: "#3b82f6",
    f: "#22c55e",
    g: "#3b82f6",
  };

  const [weekOffset, setWeekOffset] = useState(0);

  const MS_PER_WEEK = 1000 * 60 * 60 * 24 * 7;
  // Anchor weeks to ISO-style Mondays so week ranges are consistent
  // Anchor weeks to Monday start for consistent week ranges
  const YEAR_START = new Date("2026-01-05T00:00:00"); // Monday start
  const now = new Date();

  const currentWeek = Math.floor((now - YEAR_START) / MS_PER_WEEK);
  const baseWeek = currentWeek + weekOffset;

  const totalWeeksInYear = 52;

  function formatDate(d) {
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  const baseStartDate = new Date(YEAR_START.getTime() + baseWeek * MS_PER_WEEK);
  const baseEndDate = new Date(baseStartDate.getTime() + 6 * 24 * 60 * 60 * 1000);

  const calendarLabel = `Week ${baseWeek + 2}/${totalWeeksInYear} • ${formatDate(baseStartDate)} - ${formatDate(baseEndDate)}`;

  const allPeople = Object.keys(peopleMap);

  function generateWheelAssignments(wheel, week) {
    const assignments = {};
    const activePeople = wheel.people;
    const n = activePeople.length;
    const k = wheel.chores.length;

    wheel.chores.forEach((chore, choreIndex) => {
      const spacedIndex = Math.round((choreIndex * n) / k);
      const personIndex = (week + spacedIndex) % n;
      const person = activePeople[personIndex];

      if (!assignments[person]) assignments[person] = [];
      assignments[person].push(chore);
    });

    return assignments;
  }

  function generateAllAssignments(week) {
    const assignments = {};

    for (const wheel of wheels) {
      const wheelAssignments = generateWheelAssignments(wheel, week);

      for (const [person, chores] of Object.entries(wheelAssignments)) {
        if (!assignments[person]) assignments[person] = [];
        assignments[person].push(...chores);
      }
    }

    return assignments;
  }

  function pickDeterministic(arr, key) {
    if (!arr.length) return null;
    let h = 0;
    for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
    return arr[h % arr.length];
  }

  function ensureRecycling(displayMap, fullAssignments) {
    const recyclingChore = "c";

    const alreadyAssigned = Object.values(displayMap).includes(recyclingChore);
    if (alreadyAssigned) return displayMap;

    // find candidate who has recycling in their full list
    let candidate = null;

    for (const [person, chores] of Object.entries(fullAssignments)) {
      if (chores.includes(recyclingChore)) {
        candidate = person;
        break;
      }
    }

    // fallback: any person
    if (!candidate) candidate = Object.keys(displayMap)[0];

    displayMap[candidate] = recyclingChore;
    return displayMap;
  }

  const currentAssignments = generateAllAssignments(baseWeek);
  const previewAssignments = generateAllAssignments(baseWeek + 1);

  function buildDisplay(assignments, week) {
    let display = {};

    for (const id of allPeople) {
      const list = assignments[id] || [];
      display[id] = pickDeterministic(list, `${id}-${week}`);
    }

    display = ensureRecycling(display, assignments);
    return display;
  }

  const currentDisplay = buildDisplay(currentAssignments, baseWeek);
  const previewDisplay = buildDisplay(previewAssignments, baseWeek + 1);

  function AssignmentCard({ title, display }) {
    return (
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6">
        <h2 className="mb-4 text-xl font-semibold">{title}</h2>
        {allPeople.map(id => (
          <div key={id} className="flex justify-between py-1 text-sm">
            <span>{peopleMap[id]}</span>
            <span className="text-zinc-400">
              {display[id] ? choresMap[display[id]] : "—"}
            </span>
          </div>
        ))}
      </div>
    );
  }

  function OrbitalWheel({ wheel, weekOffset, size }) {
    const radius = size / 2 - 40;
    const center = size / 2;

    const activePeople = wheel.people;
    const assignments = generateWheelAssignments(wheel, weekOffset);

    const activeIndex = ((weekOffset % activePeople.length) + activePeople.length) % activePeople.length;

    return (
      <div className="flex flex-col items-center">
        

        <div className="relative rounded-full border border-zinc-700 bg-zinc-900/50" style={{ width: size, height: size }}>
          {activePeople.map((person, index) => {
            const angle = (index / activePeople.length) * 2 * Math.PI;
            const x = center + Math.cos(angle) * radius;
            const y = center + Math.sin(angle) * radius;

            const personChores = assignments[person] || [];
            const primary = personChores[0];
            const color = primary ? choreColor[primary] : "#525252";

            const isActive = index === activeIndex;

            return (
              <div
                key={person}
                className="absolute flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border text-xs transition-all"
                style={{
                  left: x,
                  top: y,
                  borderColor: isActive ? "#ffffff" : color,
                  color: isActive ? "#ffffff" : color,
                  backgroundColor: isActive ? `${color}55` : `${color}22`,
                  boxShadow: isActive ? `0 0 18px ${color}` : `0 0 6px ${color}33`,
                  transform: isActive ? "translate(-50%, -50%) scale(1.15)" : "translate(-50%, -50%) scale(1)",
                  zIndex: isActive ? 10 : 1,
                }}
              >
                {peopleMap[person]}
              </div>
            );
          })}
        </div>

        {/* Wheel labels */}
        <div className="mt-2 text-xs text-zinc-400 text-center">
          {wheel.chores.map(c => (
            <span key={c} style={{ color: choreColor[c] }}>
              {choresMap[c]}
            </span>
          )).reduce((acc, el, i) => i === 0 ? [el] : [...acc, <span key={i} className="mx-1 text-zinc-500">•</span>, el], [])}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-4 text-white">
      <div className="mb-4">
        <h1 className="text-3xl font-bold">Orbital Chore Scheduler</h1>
        <div className="mt-2 text-sm text-cyan-300">{calendarLabel}</div>
      </div>

      <div className="mb-4 flex justify-center gap-4">
        <button
          onClick={() => setWeekOffset(v => v - 1)}
          className="border px-3 py-1"
        >
          ◀
        </button>

        <button
          onClick={() => setWeekOffset(0)}
          className="border px-3 py-1 text-cyan-300"
        >
          This week
        </button>

        <button
          onClick={() => setWeekOffset(v => v + 1)}
          className="border px-3 py-1"
        >
          ▶
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <AssignmentCard title="This Week" display={currentDisplay} />
        <AssignmentCard title="Next Week" display={previewDisplay} />
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {wheels.map(w => (
          <OrbitalWheel key={w.name} wheel={w} weekOffset={baseWeek} size={240} />
        ))}
      </div>
    </div>
  );
}
