import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import Image from "next/image";
import { PROJECT_NAME } from "@/constants";

const logo = (
  <Image
    alt={PROJECT_NAME}
    src="/logo.svg"
    width={32}
    height={32}
    className="h-8 w-auto"
    aria-label={PROJECT_NAME}
  />
);

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <>
          {logo}
          <span className="font-medium">{PROJECT_NAME}</span>
        </>
      ),
      url: "/",
    },
    githubUrl: "https://github.com/yurisasc/starter-kit",
  };
}
