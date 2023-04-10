//next js page to redirect to index

import React, {useEffect} from 'react'
import { useRouter } from 'next/router';


function Room() {
    const router = useRouter();
    
    useEffect(() => {
        router.push(`/`);

    }, [])
  return (
    <div>index</div>
  )
}

export default Room
