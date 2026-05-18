import { normalizer } from "@repo/shared/utils";

export const project = {
    url: normalizer.string(process.env.NEXT_PUBLIC_APP_URL),
    name: normalizer.string(process.env.NEXT_PUBLIC_APP_NAME),
    projectName: "",
    projectDescription: "",
    keywords: [""],
    defLang: "az",
} as const;
