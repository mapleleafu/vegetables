import { MenuButton } from "@/components/MenuButton";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";

interface NavigationProps {
  items: { label: string; href?: string }[];
}

export function Navigation(props: NavigationProps) {
  return (
    <>
      <header className="mt-2 mb-6 flex items-center justify-between">
        <PageBreadcrumb items={props.items} />
        <MenuButton />
      </header>
    </>
  );
}
