type NavigationNode = {
  name: string;
  url?: string;
  iconClassName: string;
  children?: NavigationNode[];
};
export const navigation: NavigationNode[] =
[
  {
    name: 'Asset Collection',
    url: '/dss/collections',
    iconClassName: 'fa-cubes'
  },
  {
    name: 'Bookmarks',
    url: '/dss/bookmarks',
    iconClassName: 'fa-bookmark'
  },
  {
    name: 'Dashboard',
    children: [],
    iconClassName: 'fa-dashboard'
  }
];
