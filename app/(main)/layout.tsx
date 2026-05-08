import React from "react";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Navbar will go here */}
      <div className="flex flex-1">
        {/* Sidebar will go here */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
