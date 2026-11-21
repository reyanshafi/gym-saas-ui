"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  CalendarDays,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from "lucide-react";
import { portals } from "../_data/portals";
import GymToolbar from "./gym-toolbar";
import { GymDashboard, GymReports } from "./gym-overview";
import SectionRecords from "./section-records";
import Dashboard from "./dashboard";
import ProfileMenu from "./profile-menu";
import SidebarNav from "./sidebar-nav";

export default function Portal({ id, section, add, search, memberId }) {
  const data = portals[id];
  const active = section ? data.sections[section] : null;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const sidebarPreference = "GymSaas:sidebar:" + id;

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(sidebarPreference) === "collapsed");
    } catch {
      // Navigation is still available when browser storage is blocked.
    }
  }, [sidebarPreference]);

  function toggleSidebar() {
    const next = !collapsed;
    setCollapsed(next);
    try {
      localStorage.setItem(sidebarPreference, next ? "collapsed" : "expanded");
    } catch {
      // Keep the in-memory preference for this page.
    }
  }

  const currentPage = active?.[1] ?? "Overview";
  const Toggle = collapsed ? PanelLeftOpen : PanelLeftClose;

  return (
    <div
      className={`shell ${id} ${collapsed ? "sidebar-collapsed" : ""}`}
      onKeyDown={(event) => {
        if (event.key === "Escape") setMobileOpen(false);
      }}
    >
      {mobileOpen && (
        <button
          className="scrim"
          type="button"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside
        id="workspace-navigation"
        className={`sidebar ${mobileOpen ? "open" : ""}`}
      >
        <div className="sidebar-header">
          <Link className="brand" href={`/${id}`} aria-label="GymSaas overview">
            <span className="brand-mark">
              <Activity size={20} />
            </span>
            <span className="sidebar-text">GymSaas</span>
          </Link>
          {mobileOpen && (
            <button
              type="button"
              className="sidebar-close icon-button"
              aria-label="Close sidebar"
              onClick={() => setMobileOpen(false)}
            >
              <X size={18} />
            </button>
          )}
        </div>
        <SidebarNav
          id={id}
          sections={data.sections}
          current={section}
          onNavigate={() => setMobileOpen(false)}
        />
      </aside>
      <div className="main-area">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="menu-button icon-button"
              type="button"
              aria-controls="workspace-navigation"
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <button
              className="collapse-button icon-button"
              type="button"
              aria-controls="workspace-navigation"
              aria-expanded={!collapsed}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              onClick={toggleSidebar}
            >
              <Toggle size={19} />
            </button>
            <span>{data.name}</span>
            <span className="crumb-divider">/</span>
            <strong>{currentPage}</strong>
          </div>
          <ProfileMenu name={data.admin} role={data.name} />
        </header>
        <main className="content">
          <div className="page-heading">
            <div>
              <h1>
                {active
                  ? currentPage
                  : id === "gym"
                    ? "Gym overview"
                    : "Platform overview"}
              </h1>
              <p>{active?.[2] ?? data.summary}</p>
            </div>
            {!active && (
              <div className="date">
                <CalendarDays size={17} /> November 2026
              </div>
            )}
          </div>
          {id === "gym" && <GymToolbar sections={data.sections} />}
          {id === "gym" && section === "reports" ? (
            <GymReports sections={data.sections} />
          ) : active ? (
            <SectionRecords
              initialAdd={add}
              memberId={memberId}
              initialSearch={search}
              key={section}
              portal={id}
              sectionId={section}
              section={active}
            />
          ) : id === "gym" ? (
            <GymDashboard data={data} />
          ) : (
            <Dashboard id={id} data={data} />
          )}
        </main>
      </div>
    </div>
  );
}
