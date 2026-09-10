import type { ComponentPropsWithoutRef, ElementType } from "react";

type Props<T extends ElementType> = { as?: T } & ComponentPropsWithoutRef<T>;

export function VisuallyHidden<T extends ElementType = "span">({ as, className = "", ...rest }: Props<T>) {
  const Tag = (as ?? "span") as ElementType;
  return <Tag className={`sr-only ${className}`} {...rest} />;
}
