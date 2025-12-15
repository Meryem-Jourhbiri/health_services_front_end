// components/navigation/DashboardNavbar.tsx
"use client";

import { Avatar } from "@heroui/avatar";
import { Button } from "@heroui/button";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
} from "@heroui/navbar";
import Link from "next/link";

type DashboardNavbarProps = {
  title: string;
  onLogout: () => void;
  avatarLabel?: string | null;
  userName?: string | null;
};

export function DashboardNavbar(props: DashboardNavbarProps) {
  const { title, onLogout, avatarLabel, userName } = props;

  return (
    <Navbar maxWidth="full">
      <NavbarBrand>
        <span className="font-semibold text-lg">{title}</span>
      </NavbarBrand>
      <NavbarContent className="hidden gap-4 sm:flex" justify="center">
        <NavbarItem>
          <Link href="/">Home</Link>
        </NavbarItem>
        <NavbarItem isActive>
          <span className="text-primary">Dashboard</span>
        </NavbarItem>
      </NavbarContent>
      <NavbarContent justify="end">
        <NavbarItem>
          <Button variant="light" size="sm" color="danger" onPress={onLogout}>
            Sign out
          </Button>
        </NavbarItem>
        {userName ? (
          <NavbarItem>
            <span className="text-sm font-medium">{userName}</span>
          </NavbarItem>
        ) : null}
        {avatarLabel ? (
          <NavbarItem>
            <Avatar
              name={avatarLabel || undefined}
              size="sm"
              className="bg-primary/20 text-primary-foreground"
            />
          </NavbarItem>
        ) : null}
      </NavbarContent>
    </Navbar>
  );
}
