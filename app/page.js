import { redirect } from 'next/navigation';
import React from 'react'

const Home = async () => {

  redirect('/dashboard')
  
}

export default Home