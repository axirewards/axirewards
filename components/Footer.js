export default function Footer() {
  return (
    <footer className="bg-primary text-white py-4 mt-6">
      <div className="container mx-auto text-center">
        &copy; {new Date().getFullYear()} AxiRewards. All rights reserved.
      </div>
    </footer>
  )
}
