import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-[calc(100vh-140px)] items-center justify-center p-4">
      <SignUp
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "rounded-xl border border-border bg-card shadow-lg",
          },
        }}
      />
    </div>
  );
}
