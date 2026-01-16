import React from 'react'
import { assets, dummyTestimonial } from '../../assets/assets';

const TestimonialSection = () => {
  return (
    <div className='pb-14 px-8 md:px-0'>
      <h2 className='text-3xl font-medium text-gray-800'>Testimonials</h2>
      <p className='text-gray-500 md:text-base mt-3'>Hear from our learners as they share their journeys of transformation, success, and how our <br /> platform has made a difference in their lives.</p>
      <div className='grid grid-cols-3 gap-8 mt-14 mx-30'>
        {dummyTestimonial.map((testimonial, index) => (
          <div key={index} className='text-sm text-left border border-gray-500/30 rounded-lg bg-white shadow-[0px_4px_15px_0px] shadow-black/5 overflow-hidden mt-7 pb-5'>
            <div className='flex items-center gap-4 px-5 py-4 bg-gray-500/10'>
              <img src={testimonial.image} alt={testimonial.name} className='w-20 h-20 rounded-full object-cover'/>
              <div>
                <h3 className='text-lg font-medium text-gray-800'>{testimonial.name}</h3>
                <p className='text-gray-800/80 mt-1'>{testimonial.role}</p>
                <p className='mt-2 text-gray-700'>{testimonial.description}</p>
              </div>
            </div>
              <div className='p-5'>
                <div className='flex gap-0.5'>
                  {[...Array(5)].map((_, index) => (
                    <img key={index} src={index < Math.floor(testimonial.rating) ? assets.star : assets.star_blank} alt='star' className='h-5'/>
                  ))}
                </div>
                <p className='text-gray-500 mt-5'>{testimonial.feedback}</p>
              </div>
              <a href="#" className='text-blue-500 underline px-5'>Read more...</a>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TestimonialSection;