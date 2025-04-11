import NavbarUpdated from '@/components/layout/NavbarUpdated';

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <NavbarUpdated />
      {children}
    </>
  );
}
