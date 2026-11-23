"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";
import { Activity, Bell, Menu, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import { portals } from "@/data/catalog/portals";
import GymToolbar from "@/features/workspace/gym-toolbar";
import PlatformSearch from "@/features/workspace/platform-search";
import ProfileMenu from "@/features/workspace/profile-menu";
import SidebarNav from "@/features/workspace/sidebar-nav";

export default function WorkspaceShell({ id, children }) {
  const data = portals[id];
  const section = useSelectedLayoutSegment();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(true);
  const mainArea = useRef(null);
  const sidebarPreference = "Gypptiro:compact-sidebar:" + id;
  const SidebarToggle = collapsed ? PanelLeftOpen : PanelLeftClose;

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(sidebarPreference) !== "expanded");
    } catch {
      // The sidebar can still be toggled without browser storage.
    }
  }, [sidebarPreference]);

  useEffect(() => {
    mainArea.current.scrollTop = 0;
  }, [section]);

  function toggleSidebar() {
    const next = !collapsed;
    setCollapsed(next);
    try {
      localStorage.setItem(sidebarPreference, next ? "collapsed" : "expanded");
    } catch {
      // Keep the selection for the current page.
    }
  }

  return (
    <div
      className={`shell ${id}${collapsed ? " sidebar-collapsed" : ""}`}
      data-workspace-overview={section === null || undefined}
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
          <Link
            className="brand"
            href={`/${id}`}
            aria-label="Gypptiro overview"
            onClick={() => setMobileOpen(false)}
          >
            <span className="brand-mark">
              <Activity size={20} aria-hidden="true" />
            </span>
            <span className="sidebar-text">Gypptiro</span>
          </Link>
          {mobileOpen && (
            <button
              type="button"
              className="sidebar-close icon-button"
              aria-label="Close sidebar"
              onClick={() => setMobileOpen(false)}
            >
              <X size={18} aria-hidden="true" />
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
      <div className="main-area" ref={mainArea}>
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
              <SidebarToggle size={19} aria-hidden="true" />
            </button>
            {id === "gym" ? (
              <GymToolbar sections={data.sections} />
            ) : (
              <PlatformSearch sections={data.sections} />
            )}
          </div>
          <div className="workspace-header-account">
            <Link
              className="icon-button"
              href={
                id === "gym" ? "/gym/notifications" : "/platform/support-queue"
              }
              aria-label={id === "gym" ? "Notifications" : "Open support queue"}
            >
              <Bell size={18} aria-hidden="true" />
            </Link>
            <ProfileMenu name={data.admin} role={data.name} compact />
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
