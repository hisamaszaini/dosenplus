// Tipe untuk item menu tunggal (yang punya path)
export interface MenuItem {
  label: string;
  path: string;
  icon: string;
  children?: never;
  isLogout?: boolean;
}

export interface MenuDropdown {
  label: string;
  icon: string;
  children: MenuItem[];
  path?: never;
  isLogout?: never;
}

export type NavigationItem = MenuItem | MenuDropdown;