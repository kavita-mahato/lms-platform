import Hero from "../../components/student/Hero"
import Companies from "../../components/student/Companies"
import CoursesSection from "../../components/student/CoursesSection"
import TestimonialSection from "../../components/student/TestimonialSection"

const Home = () => {
  return (
    <div className="flex flex-col items-center space-y-7 text-center">
      <Hero/>
      <Companies/>
      <CoursesSection/>
      <TestimonialSection/>
    </div>
  )
}

export default Home