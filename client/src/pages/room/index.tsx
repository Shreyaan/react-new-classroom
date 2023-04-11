import React from 'react'
import { useRouter } from 'next/router';


function Index() {
    const router = useRouter();
    
    React.useEffect(() => {
        void router.push(`/`);

    }, [router])
  return (
    <div>index</div>
  )
}

export default Index
