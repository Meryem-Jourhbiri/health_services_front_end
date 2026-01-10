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
import { usePathname } from "next/navigation";

type NavLink = {
  href: string;
  label: string;
};

type DashboardNavbarProps = {
  title: string;
  onLogout: () => void;
  avatarLabel?: string | null;
  avatarSrc?: string | null;
  userName?: string | null;
  links?: NavLink[];
};

export function DashboardNavbar(props: DashboardNavbarProps) {
  const { title, onLogout, avatarLabel, avatarSrc, userName, links = [] } =
    props;
  const pathname = usePathname();

  return (
    <Navbar maxWidth="full">
      <NavbarBrand>
        <span className="font-semibold text-lg">{title}</span>
      </NavbarBrand>

      <NavbarContent className="hidden gap-4 sm:flex" justify="center">
        {links.map((l) => (
          <NavbarItem key={l.href} isActive={pathname === l.href}>
            {pathname === l.href ? (
              <span className="text-primary">{l.label}</span>
            ) : (
              <Link href={l.href}>{l.label}</Link>
            )}
          </NavbarItem>
        ))}
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

        {avatarLabel || avatarSrc ? (
          <NavbarItem>
            <Avatar
              name={avatarLabel || undefined}
              src={avatarSrc || undefined}
              size="sm"
              className="bg-primary/20 text-primary-foreground"
              isBordered
            />
          </NavbarItem>
        ) : null}
      </NavbarContent>
    </Navbar>
  );
}
