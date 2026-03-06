import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Menu,
  X,
  MoreVertical,
  Home,
  Building2,
  Heart,
  Bell,
  MessageCircle,
  Settings,
  HelpCircle,
  LogOut,
  Search,
  Filter,
  Share2,
  Plus,
  User,
} from "lucide-react";

/**
 * Canvas single-file “multi page” demo.
 * Pages:
 *  - Slide-in Drawer (sidebar)
 *  - Bottom Sheet Menu
 *  - Dropdown “More” Menu
 */

const PAGES = [
  { id: "drawer", label: "Drawer" },
  { id: "sheet", label: "Bottom Sheet" },
  { id: "dropdown", label: "Dropdown" },
];

export default function MobileNavPatternsCanvas() {
  const [page, setPage] = useState("drawer");

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <TopHeader page={page} setPage={setPage} />

      <main className="mx-auto max-w-6xl px-4 pb-10 pt-6">
        <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
          <MobileFrame>
            <AnimatePresence mode="wait">
              {page === "drawer" && (
                <motion.div
                  key="drawer"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                  className="h-full"
                >
                  <DrawerDemo />
                </motion.div>
              )}

              {page === "sheet" && (
                <motion.div
                  key="sheet"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                  className="h-full"
                >
                  <BottomSheetDemo />
                </motion.div>
              )}

              {page === "dropdown" && (
                <motion.div
                  key="dropdown"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                  className="h-full"
                >
                  <DropdownDemo />
                </motion.div>
              )}
            </AnimatePresence>
          </MobileFrame>

          <RightPanel page={page} />
        </div>
      </main>
    </div>
  );
}

function TopHeader({ page, setPage }) {
  return (
    <div className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-slate-900 text-white">
            <Building2 size={18} />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold">Mobile Nav Patterns</div>
            <div className="text-xs text-slate-500">Canvas • React • 3 page designs</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {PAGES.map((p) => (
            <button
              key={p.id}
              onClick={() => setPage(p.id)}
              className={
                "rounded-xl px-3 py-2 text-sm transition " +
                (page === p.id
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200")
              }
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function MobileFrame({ children }) {
  return (
    <div className="mx-auto w-full max-w-[420px]">
      <div className="rounded-[34px] border border-slate-200 bg-white shadow-sm">
        <div className="px-3 pt-3">
          <div className="mx-auto h-6 w-28 rounded-full bg-slate-200" />
        </div>
        <div className="p-3">
          <div className="relative h-[760px] overflow-hidden rounded-[26px] border border-slate-200 bg-slate-50">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function RightPanel({ page }) {
  const copy = useMemo(() => {
    if (page === "drawer") {
      return {
        title: "Slide-in Drawer",
        bullets: [
          "Best for full navigation + settings.",
          "Scrim closes on tap; swipe left to dismiss.",
          "Sticky bottom section for account actions.",
          "Active item uses a subtle left indicator.",
        ],
        tips: [
          "Width: ~80% of screen (max ~360px).",
          "Tap targets: 48–56px.",
          "Works great for real-estate sections (Search, Saved, Messages).",
        ],
      };
    }
    if (page === "sheet") {
      return {
        title: "Bottom Sheet",
        bullets: [
          "Best for quick actions and one-handed use.",
          "Swipe down to close; tap outside to dismiss.",
          "Optional search bar for many actions.",
          "Feels modern and native on mobile.",
        ],
        tips: [
          "Height: content up to ~75% of screen.",
          "Tap targets: 56–64px.",
          "Great for “Create / Filter / Sort / Share”.",
        ],
      };
    }
    return {
      title: "Dropdown Menu",
      bullets: [
        "Best for contextual actions on the current page.",
        "Anchored to the ⋯ button.",
        "Closes on outside tap or after selecting an action.",
        "Keep it short (3–8 actions).",
      ],
      tips: [
        "Width: ~220–280px.",
        "Row height: 44–48px.",
        "Use red only for destructive actions.",
      ],
    };
  }, [page]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="text-lg font-semibold">{copy.title}</div>
      <div className="mt-2 text-sm text-slate-600">
        Each page is interactive inside the phone frame.
      </div>

      <div className="mt-5">
        <div className="text-sm font-semibold">Behaviour</div>
        <ul className="mt-2 space-y-2 text-sm text-slate-700">
          {copy.bullets.map((b, i) => (
            <li key={i} className="flex gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6">
        <div className="text-sm font-semibold">Sizing tips</div>
        <ul className="mt-2 space-y-2 text-sm text-slate-700">
          {copy.tips.map((t, i) => (
            <li key={i} className="flex gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
        <div className="font-semibold">Quick note</div>
        <div className="mt-1">
          These patterns work for both real native apps and mobile-styled React web apps. For
          push notifications on iOS/Android, you’ll typically pair this UI with a native wrapper
          (React Native / Capacitor) or dedicated apps.
        </div>
      </div>
    </div>
  );
}

/* -----------------------------
 * Page 1: Drawer (Sidebar)
 * ----------------------------- */

function DrawerDemo() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("home");

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="relative h-full">
      <PhoneTopBar
        title="BalhinBalay"
        subtitle="Browse listings"
        left={
          <IconBtn ariaLabel="Open menu" onClick={() => setOpen(true)}>
            <Menu size={20} />
          </IconBtn>
        }
        right={
          <div className="flex items-center gap-2">
            <IconBtn ariaLabel="Notifications">
              <Bell size={20} />
            </IconBtn>
            <AvatarChip />
          </div>
        }
      />

      <div className="p-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-900 text-white">
              <Home size={18} />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold">Recommended near you</div>
              <div className="text-xs text-slate-500">Tokyo • 128 new listings</div>
            </div>
          </div>
          <div className="mt-4 h-32 rounded-2xl bg-slate-100" />
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="h-20 rounded-2xl bg-slate-100" />
            <div className="h-20 rounded-2xl bg-slate-100" />
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">Messages</div>
            <span className="rounded-full bg-slate-900 px-2 py-1 text-xs text-white">3</span>
          </div>
          <div className="mt-3 space-y-2">
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </div>
        </div>
      </div>

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        active={active}
        onSelect={(id) => {
          setActive(id);
          setOpen(false);
        }}
      />
    </div>
  );
}

function Drawer({ open, onClose, active, onSelect }) {
  const menu = [
    { id: "home", label: "Home", icon: Home },
    { id: "search", label: "Search", icon: Search },
    { id: "saved", label: "Saved", icon: Heart, badge: "New" },
    { id: "messages", label: "Messages", icon: MessageCircle, count: 3 },
  ];

  const bottom = [
    { id: "settings", label: "Settings", icon: Settings },
    { id: "help", label: "Help", icon: HelpCircle },
    { id: "logout", label: "Log out", icon: LogOut, danger: true },
  ];

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            aria-label="Close menu overlay"
            className="absolute inset-0 z-20 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.aside
            className="absolute left-0 top-0 z-30 flex h-full w-[82%] max-w-[360px] flex-col bg-white shadow-xl"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <div className="flex items-center justify-between border-b border-slate-200 p-4">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-900 text-white">
                  <Building2 size={18} />
                </div>
                <div className="leading-tight">
                  <div className="text-sm font-semibold">BalhinBalay</div>
                  <div className="text-xs text-slate-500">khacey@company.com</div>
                </div>
              </div>
              <IconBtn ariaLabel="Close menu" onClick={onClose}>
                <X size={18} />
              </IconBtn>
            </div>

            <div className="p-3">
              <div className="rounded-2xl bg-slate-50 p-3">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white shadow-sm">
                    <User size={18} className="text-slate-700" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">Khacey</div>
                    <div className="text-xs text-slate-500">Agent dashboard</div>
                  </div>
                </div>
              </div>

              <div className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Main
              </div>
              <div className="mt-2 space-y-1">
                {menu.map((m) => (
                  <DrawerItem
                    key={m.id}
                    active={active === m.id}
                    label={m.label}
                    Icon={m.icon}
                    badge={m.badge}
                    count={m.count}
                    onClick={() => onSelect(m.id)}
                  />
                ))}
              </div>
            </div>

            <div className="mt-auto border-t border-slate-200 p-3">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Account
              </div>
              <div className="mt-2 space-y-1">
                {bottom.map((m) => (
                  <DrawerItem
                    key={m.id}
                    active={active === m.id}
                    label={m.label}
                    Icon={m.icon}
                    danger={m.danger}
                    onClick={() => onSelect(m.id)}
                  />
                ))}
              </div>
              <div className="mt-3 text-[11px] text-slate-400">v1.0.0</div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function DrawerItem({ active, label, Icon, badge, count, danger, onClick }) {
  return (
    <button
      onClick={onClick}
      className={
        "relative flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition " +
        (active
          ? "bg-slate-900 text-white"
          : danger
          ? "bg-white text-rose-600 hover:bg-rose-50"
          : "bg-white text-slate-800 hover:bg-slate-100")
      }
    >
      {active && (
        <span className="absolute left-1 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-full bg-white/80" />
      )}
      <Icon size={18} className={danger ? "text-rose-600" : active ? "text-white" : "text-slate-600"} />
      <span className="text-sm font-medium">{label}</span>

      <div className="ml-auto flex items-center gap-2">
        {badge && (
          <span
            className={
              "rounded-full px-2 py-1 text-[11px] font-semibold " +
              (active ? "bg-white/15 text-white" : "bg-slate-900 text-white")
            }
          >
            {badge}
          </span>
        )}
        {typeof count === "number" && (
          <span
            className={
              "grid min-w-[26px] place-items-center rounded-full px-2 py-1 text-[11px] font-semibold " +
              (active ? "bg-white/15 text-white" : "bg-slate-200 text-slate-800")
            }
          >
            {count}
          </span>
        )}
      </div>
    </button>
  );
}

/* -----------------------------
 * Page 2: Bottom Sheet
 * ----------------------------- */

function BottomSheetDemo() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative h-full">
      <PhoneTopBar
        title="Search"
        subtitle="Filters & quick actions"
        left={
          <IconBtn ariaLabel="Back">
            <X size={20} />
          </IconBtn>
        }
        right={
          <IconBtn ariaLabel="Open actions" onClick={() => setOpen(true)}>
            <Plus size={20} />
          </IconBtn>
        }
      />

      <div className="p-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-900 text-white">
              <Search size={18} />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold">Find a property</div>
              <div className="text-xs text-slate-500">House • Condo • Land</div>
            </div>
          </div>
          <div className="mt-4 h-10 rounded-2xl bg-slate-100" />
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="h-10 rounded-2xl bg-slate-100" />
            <div className="h-10 rounded-2xl bg-slate-100" />
          </div>

          <button
            onClick={() => setOpen(true)}
            className="mt-4 w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white"
          >
            Open quick actions
          </button>
        </div>

        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
          <div className="text-sm font-semibold">Results</div>
          <div className="mt-3 space-y-3">
            <ListingCard />
            <ListingCard />
          </div>
        </div>
      </div>

      <BottomSheet open={open} onClose={() => setOpen(false)} />
    </div>
  );
}

function BottomSheet({ open, onClose }) {
  const actions = [
    { id: "filter", label: "Filters", icon: Filter },
    { id: "sort", label: "Sort by", icon: Search },
    { id: "share", label: "Share search", icon: Share2 },
    { id: "saved", label: "View saved", icon: Heart },
    { id: "alerts", label: "Listing alerts", icon: Bell },
  ];

  // Basic Escape close
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            aria-label="Close sheet overlay"
            className="absolute inset-0 z-20 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="absolute inset-x-0 bottom-0 z-30"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.24, ease: "easeOut" }}
          >
            <div className="rounded-t-[26px] border border-slate-200 bg-white shadow-xl">
              <div className="flex items-center justify-between px-4 pt-3">
                <div className="mx-auto h-1.5 w-14 rounded-full bg-slate-200" />
              </div>

              <div className="px-4 pb-2 pt-3">
                <div className="text-sm font-semibold">Quick actions</div>
                <div className="mt-3 flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <Search size={18} className="text-slate-500" />
                  <input
                    placeholder="Search actions…"
                    className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                    onChange={() => {}}
                  />
                </div>
              </div>

              <div className="px-2 pb-4">
                {actions.map((a) => (
                  <button
                    key={a.id}
                    onClick={onClose}
                    className="flex w-full items-center gap-3 rounded-2xl px-4 py-4 text-left hover:bg-slate-50"
                  >
                    <div className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-900 text-white">
                      <a.icon size={18} />
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{a.label}</div>
                      <div className="text-xs text-slate-500">Tap to open</div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="border-t border-slate-200 p-3">
                <button
                  onClick={onClose}
                  className="w-full rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-800"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* -----------------------------
 * Page 3: Dropdown Menu
 * ----------------------------- */

function DropdownDemo() {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);

  useEffect(() => {
    const onDoc = (e) => {
      if (!open) return;
      const anchor = anchorRef.current;
      if (!anchor) return;
      // close if click outside the button + menu
      const menu = document.getElementById("demo-dropdown-menu");
      if (menu && menu.contains(e.target)) return;
      if (anchor.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="relative h-full">
      <PhoneTopBar
        title="Listing"
        subtitle="2LDK • Shinjuku"
        left={
          <IconBtn ariaLabel="Back">
            <X size={20} />
          </IconBtn>
        }
        right={
          <div className="relative">
            <button
              ref={anchorRef}
              onClick={() => setOpen((v) => !v)}
              className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-100 text-slate-700 hover:bg-slate-200"
              aria-label="Open more menu"
            >
              <MoreVertical size={18} />
            </button>

            <AnimatePresence>
              {open && (
                <motion.div
                  id="demo-dropdown-menu"
                  className="absolute right-0 top-12 z-30 w-[260px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl"
                  initial={{ opacity: 0, y: -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  transition={{ duration: 0.16, ease: "easeOut" }}
                >
                  <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Actions
                  </div>

                  <MenuRow icon={Share2} label="Share" onClick={() => setOpen(false)} />
                  <MenuRow icon={Heart} label="Save listing" onClick={() => setOpen(false)} />
                  <MenuRow icon={Bell} label="Notify me" onClick={() => setOpen(false)} />

                  <div className="my-2 h-px bg-slate-200" />

                  <MenuRow
                    icon={MessageCircle}
                    label="Message agent"
                    onClick={() => setOpen(false)}
                  />
                  <MenuRow
                    icon={X}
                    label="Report"
                    danger
                    onClick={() => setOpen(false)}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        }
      />

      <div className="p-4">
        <div className="h-44 rounded-2xl border border-slate-200 bg-white">
          <div className="h-full rounded-2xl bg-slate-100" />
        </div>

        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-base font-semibold">¥168,000 / month</div>
              <div className="mt-1 text-sm text-slate-600">Shinjuku • 7 min walk</div>
            </div>
            <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
              Available
            </span>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <Chip>2LDK</Chip>
            <Chip>45 m²</Chip>
            <Chip>Balcony</Chip>
          </div>

          <div className="mt-4 text-sm text-slate-700">
            Tap the ⋯ button to open a compact dropdown for contextual actions.
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
          <div className="text-sm font-semibold">Agent</div>
          <div className="mt-3 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-900 text-white">
              <User size={18} />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold">M. Tanaka</div>
              <div className="text-xs text-slate-500">Replies within 1 hour</div>
            </div>
            <button className="ml-auto rounded-2xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white">
              Message
            </button>
          </div>
        </div>
      </div>

      {/* Optional scrim when dropdown open */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="absolute inset-0 z-10 bg-black/0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function MenuRow({ icon: Icon, label, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className={
        "flex w-full items-center gap-3 px-3 py-3 text-left text-sm hover:bg-slate-50 " +
        (danger ? "text-rose-600" : "text-slate-800")
      }
    >
      <Icon size={18} className={danger ? "text-rose-600" : "text-slate-600"} />
      <span className="font-medium">{label}</span>
    </button>
  );
}

/* -----------------------------
 * Shared UI bits
 * ----------------------------- */

function PhoneTopBar({ title, subtitle, left, right }) {
  return (
    <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/85 backdrop-blur">
      <div className="flex items-center justify-between px-3 py-3">
        <div className="flex items-center gap-2">
          {left}
          <div className="leading-tight">
            <div className="text-sm font-semibold">{title}</div>
            <div className="text-xs text-slate-500">{subtitle}</div>
          </div>
        </div>
        <div>{right}</div>
      </div>
    </div>
  );
}

function IconBtn({ children, onClick, ariaLabel }) {
  return (
    <button
      aria-label={ariaLabel}
      onClick={onClick}
      className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-100 text-slate-700 hover:bg-slate-200"
    >
      {children}
    </button>
  );
}

function AvatarChip() {
  return (
    <div className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-900 text-white">
      <User size={18} />
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 rounded-2xl bg-slate-100" />
      <div className="flex-1">
        <div className="h-3 w-2/3 rounded bg-slate-100" />
        <div className="mt-2 h-3 w-1/2 rounded bg-slate-100" />
      </div>
    </div>
  );
}

function ListingCard() {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
      <div className="h-14 w-14 rounded-2xl bg-slate-200" />
      <div className="flex-1 leading-tight">
        <div className="text-sm font-semibold">¥150,000 • 1LDK</div>
        <div className="mt-1 text-xs text-slate-500">Near station • Pet OK</div>
      </div>
      <button className="rounded-2xl bg-white px-3 py-2 text-xs font-semibold text-slate-800 shadow-sm">
        View
      </button>
    </div>
  );
}

function Chip({ children }) {
  return (
    <div className="rounded-full bg-slate-100 px-3 py-2 text-center text-xs font-semibold text-slate-700">
      {children}
    </div>
  );
}
