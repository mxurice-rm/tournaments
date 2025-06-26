import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'

const Page = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-3xl"></div>

      {/* PAGE CONTAINER */}
      <div className="max-w-7xl container mx-auto flex-grow flex flex-col">
        {/* HEADER */}
        <Header />

        {/* CONTENT */}
        <main className="my-5 space-y-4 p-5"></main>
      </div>
      {/* FOOTER */}
      <Footer />
    </div>
  )
}

export default Page;