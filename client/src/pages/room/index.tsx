//next js page to redirect to index

import React from 'react'
import { useRouter } from 'next/router';


function index() {
    const router = useRouter();
    
    React.useEffect(() => {
        router.push(`/`);

    }, [])
  return (
    <div>index</div>
  )
}

export default index
