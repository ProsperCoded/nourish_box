import React from 'react'
import Search_bar from '../components/Search_bar'
import Cart_tab from '../components/cart_tab'

type Props = {}

const page = (props: Props) => {
  return (
    <div>
      <Search_bar PageTitle='Cart' />
      <Cart_tab/>
    </div>
  )
}

export default page
