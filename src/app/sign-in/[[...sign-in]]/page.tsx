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
    formFieldLabel: "block mb-2 font-medium text-black",
    formFieldInput:
      "w-full p-3 text-black border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
    formButtonPrimary: "bg-blue-600 hover:bg-blue-700",
    formButtonReset: "text-black hover:text-blue-600",
    footerActionText: "text-black",
    footerActionLink: "text-blue-600 hover:text-blue-800 font-medium",
    identityPreview: "bg-gray-100 border border-gray-300",
    identityPreviewText: "text-black",
    identityPreviewEditButton: "text-blue-600 hover:text-blue-800",
    formField: "mb-4",
    formFieldInputWrapper: "relative",
    formFieldAction: "hidden",
  },
};

export default function SignInPage() {
  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50">
      <SignIn
        appearance={darkTextTheme}
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        redirectUrl="/"
        afterSignInUrl="/"
        afterSignUpUrl="/"
        initialValues={{
          emailAddress: "",
        }}
      />
    </div>
  );
}
