// src/react-router-hash-link.d.ts
declare module "react-router-hash-link" {
  import * as React from "react";
  import { LinkProps } from "react-router-dom";

  export interface HashLinkProps extends LinkProps {
    smooth?: boolean;
    scroll?: (el: HTMLElement) => void;
  }

  export const HashLink: React.ForwardRefExoticComponent<
    HashLinkProps & React.RefAttributes<HTMLAnchorElement>
  >;

  export default HashLink;
}
