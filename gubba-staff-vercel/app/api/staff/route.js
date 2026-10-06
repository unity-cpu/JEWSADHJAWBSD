import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

const KEY = "gubba-staff";

const DEFAULT_STAFF = {
  title: "\\\\ GUBBA TAG STAFF //",
  colorA: "#8e5cff",
  colorB: "#ffffff",
  roles: {
    FOUNDERS: ["UNITY", "GUBBA"],
    "CO FOUNDERS": ["FROG", "SOT"],
    OWNERS: ["Unity", "Rain", "Notagirl"],
    "CO OWNERS": ["WHY", "Rackz", "Review", "Bunny"],
    "STAFF MANAGER": ["Enzo"],
    PLAYFAB: [],
    "COMMUNITY MANAGER": [],
    "HEAD ADMIN": ["Faded"],
    ADMIN: [],
    "TRIAL ADMIN": ["Fort", "Kiwi"],
    "HEAD MOD": [],
    MOD: ["lexi", "Instinct"],
    "TRIAL MOD": ["Exotic", "Jewelry"],
  },
};

async function load() {
  const data = await redis.get(KEY);
  if (data) {
    // ensure color fields exist even on old data
    if (!data.colorA) data.colorA = DEFAULT_STAFF.colorA;
    if (!data.colorB) data.colorB = DEFAULT_STAFF.colorB;
    return data;
  }
  await redis.set(KEY, DEFAULT_STAFF);
  return DEFAULT_STAFF;
}

export async function GET() {
  return Response.json(await load());
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const staff = await load();

  // Update gradient colors
  if (body.colorA !== undefined || body.colorB !== undefined) {
    if (body.colorA) staff.colorA = body.colorA;
    if (body.colorB) staff.colorB = body.colorB;
    await redis.set(KEY, staff);
    return Response.json(staff);
  }

  // Add name to role
  const { role, name } = body || {};
  if (!role || !name) {
    return Response.json({ error: "role and name required (or colorA/colorB)" }, { status: 400 });
  }

  if (!staff.roles[role]) staff.roles[role] = [];

  const trimmed = name.trim();
  if (!staff.roles[role].includes(trimmed)) {
    staff.roles[role].push(trimmed);
  }

  await redis.set(KEY, staff);
  return Response.json(staff);
}

export async function DELETE(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const { role, name } = body || {};
  if (!role || !name) {
    return Response.json({ error: "role and name required" }, { status: 400 });
  }

  const staff = await load();
  if (staff.roles[role]) {
    const idx = staff.roles[role].indexOf(name);
    if (idx !== -1) staff.roles[role].splice(idx, 1);
  }

  await redis.set(KEY, staff);
  return Response.json(staff);
}
