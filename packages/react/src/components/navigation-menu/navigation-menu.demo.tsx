import type {Demo} from '../../demo';
import {NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger} from './navigation-menu';

export const demos: Demo[] = [
  {title: 'Site navigation', render: () => (
    <div style={{minHeight: '200px'}}>
      <NavigationMenu aria-label="Site">
        <NavigationMenuList>
          <NavigationMenuItem><NavigationMenuLink href="#" active>Home</NavigationMenuLink></NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Products</NavigationMenuTrigger>
            <NavigationMenuContent><div className="navmenu-panel"><NavigationMenuLink href="#">UI kit</NavigationMenuLink><NavigationMenuLink href="#">Icons</NavigationMenuLink><NavigationMenuLink href="#">Templates</NavigationMenuLink></div></NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem><NavigationMenuLink href="#">Docs</NavigationMenuLink></NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  )},
];
