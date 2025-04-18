"use client";

import { SignIn } from "@clerk/nextjs";

// Custom dark theme
const darkTextTheme = {
  variables: {
    colorPrimary: "#3b82f6",
    colorText: "#000000",
    colorTextSecondary: "#000000",
    colorTextOnPrimaryBackground: "#ffffff",
    colorInputText: "#000000",
    colorBackground: "#ffffff",
    colorInputBackground: "#ffffff",
    fontWeight: {
      normal: 500,
      medium: 600,
      bold: 700,
    },
  },
  elements: {
    card: "bg-white shadow-xl border border-gray-200 rounded-xl",
    headerTitle: "text-black text-2xl font-bold !important",
    headerSubtitle: "text-black font-medium",
    socialButtonsBlockButton: "border-gray-300",
    socialButtonsBlockButtonText: "text-gray-900 font-semibold",
    socialButtonsBlockButtonArrow: "text-gray-900",
    dividerLine: "bg-gray-300",
    dividerText: "text-gray-900",
    formFieldLabel: "text-black font-medium",
    formFieldInput:
      "text-black border-gray-300 focus:border-blue-500 focus:ring-blue-500",
    formButtonPrimary: "bg-blue-600 hover:bg-blue-700",
    formButtonReset: "text-black hover:text-blue-600",
    footerActionText: "text-black",
    footerActionLink: "text-blue-600 hover:text-blue-800 font-medium",
    identityPreview: "bg-gray-100 border border-gray-300",
    identityPreviewText: "text-black",
    identityPreviewEditButton: "text-blue-600 hover:text-blue-800",
  },
};

export default function SignInPage() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
      <SignIn appearance={darkTextTheme} />
    </div>
  );
}
