//next js page to redirect to index

import React, {useEffect} from 'react'
import { useRouter } from 'next/router';


function index() {
    const router = useRouter();
    
    React.useEffect(() => {
        router.push(`/`);

    }, [router])
  return (
    <div>index</div>
  )
}

export default index
