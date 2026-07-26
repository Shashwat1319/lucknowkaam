import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "संपर्क करें | LucknowKaam",
  description: "LucknowKaam से संपर्क करें। हमें आपके सवालों और सुझावों का इंतजार है।",
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
